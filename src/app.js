require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/databse");
const cors = require("cors");
app.use(express.json());
const cookieParser = require("cookie-parser");
const path = require("path");

app.use(cookieParser());
// app.use(cors());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
// middleware

// This makes http://localhost:7777/uploads/claim-123.jpg accessible
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// root route
app.get("/", (req, res) => {
  res.send("Hello");
});

// Masked env info for debugging (printed once at startup)
const mask = (k) => (k ? `${String(k).slice(0, 6)}… (len ${String(k).length})` : "(missing)");
console.log("[Env] GOOGLE_API_KEY:", mask(process.env.GOOGLE_API_KEY));

// Simple AI health-check endpoint
app.get("/api/ai/health", async (req, res) => {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const apiKeyRaw = process.env.GOOGLE_API_KEY;
    const apiKey = apiKeyRaw ? String(apiKeyRaw).trim().replace(/^['"]|['"]$/g, "") : apiKeyRaw;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "GOOGLE_API_KEY missing" });
    }
    const client = new GoogleGenerativeAI( apiKey );
    const model = client.getGenerativeModel({ model: "gemini-flash-latest" });
    const r = await model.generateContent("ping");
    const text = r?.response?.text?.() || r?.response?.text || "";
    return res.json({ ok: true, sample: text.slice(0, 60) });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

const authRouter = require("./routes/auth");
const postRouter = require("./routes/postrouter");
const hubRouter = require("./routes/hubrouter");
const chatRouter = require("./routes/chatrouter");




const verificationRouter = require("./routes/verification");


app.use("/", authRouter);
app.use("/", postRouter);
app.use("/", hubRouter);
app.use("/", chatRouter);
app.use("/api/verification", verificationRouter);

// connect DB then start server
connectDB()
  .then(() => {
    console.log("DB connection Success");

    const PORT = 7777;
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
  });

// module.exports = app;
