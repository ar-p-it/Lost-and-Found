const { GoogleGenerativeAI } = require("@google/generative-ai");

let client = null;

function sanitizeKey(raw) {
  if (!raw) return raw;
  return String(raw).trim().replace(/^['"]|['"]$/g, "");
}

function getClient() {
  const apiKey = sanitizeKey(process.env.GOOGLE_API_KEY);
  if (!client) {
    if (!apiKey) throw new Error("GOOGLE_API_KEY missing");
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(Number(n) || 0)));
}

function buildPrompt({ postDesc, claimDesc, serialNumber, postTitle, tags }) {
  return `You are scoring how well a claimant's description matches the original post.
Return STRICT JSON with keys: score (0-100 integer) and rationale (string). No extra text.

Criteria:
- Match of key facts (brand, model, color, size, unique marks)
- Consistency of place/time context
- Presence and match of serial/IDs (bonus if matching and plausible)
- Penalize vague or contradictory statements

Output must be: {"score": <int>, "rationale": "..."}

Original Post Title: ${postTitle || ""}
Original Description:\n${postDesc || ""}
\nClaimant Description:\n${claimDesc || ""}
\nClaimant Serial Number: ${serialNumber || "(none)"}
Post Tags: ${(Array.isArray(tags) ? tags.join(", ") : "(none)")}
`;
}

// ✅ FIXED: Applied the same robust parsing logic here
async function scoreDescriptions({ postDesc, claimDesc, serialNumber, postTitle, tags }, { timeoutMs = 6000 } = {}) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const prompt = buildPrompt({ postDesc, claimDesc, serialNumber, postTitle, tags });

  const run = async () => {
    const resp = await model.generateContent(prompt);
    let text = resp?.response?.text?.() || resp?.response?.text || "";
    
    // 🧹 CLEANING STEP
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed = null;
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start >= 0 && end >= 0) {
        parsed = JSON.parse(text.slice(start, end + 1));
      } else {
        throw new Error("No JSON braces found");
      }
    } catch (e) {
      // Fallback regex
      const m = text.match(/"score"\s*:\s*(\d+)/i);
      parsed = { score: m ? Number(m[1]) : 0, rationale: "LLM parse fallback" };
    }
    return { score: clamp(parsed.score), rationale: String(parsed.rationale || "") };
  };

  const result = await Promise.race([
    run(),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini timeout")), timeoutMs)),
  ]);

  return result;
}

module.exports = {
  scoreDescriptions,
};

// Extended: include per-question comparison and aggregate with description
async function scoreQAAndDescription({ postDesc, claimDesc, serialNumber, postTitle, tags, securityQuestions = [], claimantAnswers = [] }, { timeoutMs = 7000 } = {}) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const answersById = new Map((Array.isArray(claimantAnswers) ? claimantAnswers : []).map(a => [String(a.questionId), String(a.answer || "")]));
  const qaPairs = (Array.isArray(securityQuestions) ? securityQuestions : []).map(q => ({
    id: String(q.id || ""),
    question: String(q.question || ""),
    expected: String(q.expectedAnswer || ""),
    required: !!q.required,
    provided: answersById.get(String(q.id || "")) || "",
  }));

  const prompt = `You are verifying ownership through security questions and description similarity.
Return STRICT JSON only. Keys: overall (0-100 int), perQuestion (array of {id, score:int}), descScore:int, rationale:string.

Scoring rules:
- Security Q&A (70% weight): For each question, compare claimant answer to expected.
  * Exact or precise match -> high (85-100); semantic near-match -> 70-85.
  * Vague/off-target -> 30-70; incorrect/contradictory -> 0-30.
  * Required unanswered -> score low (0-20).
- Description (30% weight): Match distinctive features, place/time consistency; penalize contradictions.

Compute descScore (0-100) and perQuestion scores. Then overall = round(0.7*avg(perQuestion) + 0.3*descScore). Output integers.

Original Title: ${postTitle || ""}
Original Description:\n${postDesc || ""}
Claimant Description:\n${claimDesc || ""}
Claimant Serial Number: ${serialNumber || "(none)"}
Post Tags: ${(Array.isArray(tags) ? tags.join(", ") : "(none)")}

Questions:\n${qaPairs.map(q => `- id:${q.id} required:${q.required}\n  question:${q.question}\n  expected:${q.expected}\n  provided:${q.provided}`).join("\n")}
`;

  const run = async () => {
    const resp = await model.generateContent(prompt);
    let text = resp?.response?.text?.() || resp?.response?.text || "";
    
    // 🧹 CLEANING STEP
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed = null;
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start >= 0 && end >= 0) {
        const jsonText = text.slice(start, end + 1);
        parsed = JSON.parse(jsonText);
      } else {
        throw new Error("No JSON braces found");
      }
    } catch (e) {
      console.error("[TrustScore] JSON Parse Error. Raw Text:", text); 
      parsed = { overall: 50, perQuestion: [], descScore: 50, rationale: "AI returned invalid JSON. Defaulting to 50." };
    }

    const overall = clamp(parsed.overall);
    const descScore = clamp(parsed.descScore);
    const perQuestion = Array.isArray(parsed.perQuestion) 
      ? parsed.perQuestion.map(pq => ({ id: String(pq.id || ""), score: clamp(pq.score) })) 
      : [];

    let qaAvg = 0;
    if (perQuestion.length > 0) {
      qaAvg = Math.round(perQuestion.reduce((s, pq) => s + pq.score, 0) / perQuestion.length);
    }
    
    const computedOverall = clamp(0.7 * qaAvg + 0.3 * descScore);
    const finalOverall = (parsed.overall !== undefined) ? overall : computedOverall;

    return { score: finalOverall, rationale: String(parsed.rationale || ""), descScore, perQuestion };
  };
  
  const result = await Promise.race([
    run(),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini timeout")), timeoutMs)),
  ]);

  return result;
}

module.exports.scoreQAAndDescription = scoreQAAndDescription;