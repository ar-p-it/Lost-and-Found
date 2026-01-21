import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { AlertCircle, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";

const IncomingClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchIncoming = async () => {
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/api/verification/incoming`, {
        withCredentials: true,
      });
      setClaims(res.data || []);
    } catch (err) {
      console.error("Incoming Fetch Error:", err);
      const msg = err.response?.data?.message || "Could not load incoming claims.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncoming();
  }, []);

  const updateDecision = async (claimId, status) => {
    try {
      await axios.put(
        `${BASE_URL}/api/verification/decision/${claimId}`,
        { status },
        { withCredentials: true },
      );
      setClaims((prev) => prev.map((c) => (c._id === claimId ? { ...c, status } : c)));
    } catch (err) {
      console.error("Decision error:", err);
      alert("Failed to update decision.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Incoming Claim Requests</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 border border-red-100">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading requests…</div>
      ) : claims.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No Claim Requests</h3>
          <p className="text-slate-500 mt-1">You'll see claims for your posts here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {claims.map((claim) => (
            <div key={claim._id} className="bg-white p-7 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row gap-6 items-start md:items-start">

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  {/* Inline Initial next to title */}
                  <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center font-bold text-lg text-slate-500">
                    {claim.postId?.title?.charAt(0) || "?"}
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 truncate">
                    {claim.postId?.title || "Unknown Item"}
                  </h3>
                  <StatusBadge status={claim.status || "PENDING"} />
                </div>
                <p className="text-base text-slate-600">From: {claim.claimantId?.username || claim.claimantId?.email || "Unknown"}</p>

                {/* Evidence */}
                {claim.verification && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-base text-slate-700">
                      <span className="font-semibold">Serial:</span>
                      <span className="text-slate-800">{claim.verification.serialNumber || "—"}</span>
                    </div>
                    {claim.verification.additionalDescription && (
                      <p className="text-base leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-4">
                        {claim.verification.additionalDescription}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      {claim.verification.imageProofUrl && (
                        <a
                          href={claim.verification.imageProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg transition"
                        >
                          <ExternalLink size={16} /> View Proof
                        </a>
                      )}

                      {/* Trust score (dynamic) */}
                      <div className="flex items-center gap-3 ml-1">
                        {(() => {
                          const score = Math.max(0, Math.min(100, Math.round(Number(claim.verification?.systemTrustScore ?? 0))));
                          const barColor = score > 70 ? "bg-emerald-500" : score > 40 ? "bg-amber-500" : "bg-rose-500";
                          return (
                            <>
                              <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                                <div className={`h-full ${barColor}`} style={{ width: `${score}%` }}></div>
                              </div>
                              <span className="text-sm font-semibold text-slate-600">{score}% Trust</span>
                            </>
                          );
                        })()}
                      </div>

                      {/* AI Suggestion moved below Claimant Answers */}

                      {/* Claimed Answers (if any) */}
                      {Array.isArray(claim.verification.questionAnswers) && claim.verification.questionAnswers.length > 0 && (
                        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-slate-800 mb-2">Claimant Answers</h4>
                          <ul className="text-sm text-slate-700 space-y-1">
                            {claim.verification.questionAnswers.map((qa, idx) => (
                              <li key={idx}>
                                <span className="font-semibold text-slate-800">Q{idx + 1}:</span> {qa.answer || '—'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {claim.verification?.systemTrustRationale && (
                        <div className="w-full mt-3 text-sm md:text-base text-slate-700 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                          <span className="font-bold text-indigo-700">AI Suggestion:</span>
                          <span className="ml-2 italic">“{claim.verification.systemTrustRationale}”</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 self-end ml-auto mt-4">
                <button
                  onClick={() => updateDecision(claim._id, "ACCEPTED")}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                  disabled={claim.status === "ACCEPTED"}
                >
                  Accept
                </button>
                <button
                  onClick={() => updateDecision(claim._id, "REJECTED")}
                  className="px-5 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50"
                  disabled={claim.status === "REJECTED"}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
    VERIFICATION_SUBMITTED: { color: "bg-blue-100 text-blue-700", icon: Clock },
    ACCEPTED: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    REJECTED: { color: "bg-red-100 text-red-700", icon: XCircle },
  };
  const { color, icon: Icon } = config[status] || config.PENDING;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${color}`}>
      <Icon size={12} />
      {status.replace("_", " ")}
    </span>
  );
};

export default IncomingClaims;
