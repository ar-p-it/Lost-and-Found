import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Hubs = () => {
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinedHubIds, setJoinedHubIds] = useState(new Set());

  useEffect(() => {
    const fetchAllHubs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/gethubs`, {
          withCredentials: true,
        });
        setHubs(res?.data?.data || []);
      } catch (err) {
        setError("Could not load hubs.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllHubs();
  }, []);

  const handleJoin = async (hubId) => {
    try {
      await axios.post(
        `${BASE_URL}/hubs/${hubId}/join`,
        {},
        { withCredentials: true },
      );
      setJoinedHubIds((prev) => new Set(prev).add(hubId));
    } catch (err) {
      setError("Failed to join hub. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-slate-500">
        Loading hubs…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Hubs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Showing all hubs in the database.
        </p>
      </div>

      {hubs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          No hubs found nearby.
        </div>
      ) : (
        <div className="space-y-4">
          {hubs.map((hub) => (
            <div
              key={hub._id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link
                    to={`/hubs/${hub.slug}`}
                    className="text-lg font-semibold text-slate-900 hover:text-indigo-600 transition"
                  >
                    {hub.name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">r/{hub.slug}</p>
                </div>
                <button
                  onClick={() => handleJoin(hub._id)}
                  disabled={joinedHubIds.has(hub._id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition border ${
                    joinedHubIds.has(hub._id)
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                  } disabled:opacity-60`}
                >
                  {joinedHubIds.has(hub._id) ? "Joined" : "Join"}
                </button>
              </div>

              {hub.description && (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {hub.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {hub.category}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  Members: {hub.memberCount || 0}
                </span>
                {hub.coverageRadiusMeters && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    Radius: {Math.round(hub.coverageRadiusMeters / 1000)} km
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hubs;
