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
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Thumb / Initial */}
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-2xl text-slate-400">
                {claim.postId?.title?.charAt(0) || "?"}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-800 truncate">
                    {claim.postId?.title || "Unknown Item"}
                  </h3>
                  <StatusBadge status={claim.status || "PENDING"} />
                </div>
                <p className="text-sm text-slate-500">From: {claim.claimantId?.username || claim.claimantId?.email || "Unknown"}</p>

                {/* Evidence */}
                {claim.verification && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">Serial:</span>
                      <span>{claim.verification.serialNumber || "—"}</span>
                    </div>
                    {claim.verification.additionalDescription && (
                      <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                        {claim.verification.additionalDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {claim.verification.imageProofUrl && (
                        <a
                          href={claim.verification.imageProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg transition"
                        >
                          <ExternalLink size={16} /> View Proof
                        </a>
                      )}

                      {/* Trust score (hardcoded 30 for now) */}
                      <div className="flex items-center gap-2 ml-1">
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `30%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">30% Trust</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  onClick={() => updateDecision(claim._id, "ACCEPTED")}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                  disabled={claim.status === "ACCEPTED"}
                >
                  Accept
                </button>
                <button
                  onClick={() => updateDecision(claim._id, "REJECTED")}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50"
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
