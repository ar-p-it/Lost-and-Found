import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Hub = () => {
  const [name, setName] = useState("TSEC");
  const [slug, setSlug] = useState("Mumbai");
  const [category, setCategory] = useState("EDUCATIONAL");
  const [description, setDescription] = useState(
    "TSEC campus and surrounding academic and residential areas in Kalyan West.",
  );
  const [lng, setLng] = useState("77.2167");
  const [lat, setLat] = useState("28.6315");
  const [coverageRadiusMeters, setCoverageRadiusMeters] = useState("1200");
  const [rules, setRules] = useState(
    "Post only items lost or found within the campus and nearby residential areas.",
  );
  const [makeModerator, setMakeModerator] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!name || !slug || !category) {
      setError("Name, slug, and category are required.");
      return;
    }

    const lngNum = Number(lng);
    const latNum = Number(lat);
    const radiusNum = Number(coverageRadiusMeters);

    if (!Number.isFinite(lngNum) || !Number.isFinite(latNum)) {
      setError("Latitude and longitude must be valid numbers.");
      return;
    }

    if (!Number.isFinite(radiusNum) || radiusNum <= 0) {
      setError("Coverage radius must be a positive number.");
      return;
    }

    try {
      setSaving(true);
      await axios.post(
        `${BASE_URL}/hubs`,
        {
          name,
          slug,
          category,
          description,
          location: {
            type: "Point",
            coordinates: [lngNum, latNum],
          },
          coverageRadiusMeters: radiusNum,
          rules,
          makeModerator,
        },
        { withCredentials: true },
      );
      setStatus("Hub created successfully.");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create hub.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create Hub</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a new hub for your community.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Hub Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">
                Use lowercase letters, numbers, and hyphens.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="EDUCATIONAL">EDUCATIONAL</option>
                <option value="TRANSIT">TRANSIT</option>
                <option value="COMMERCIAL">COMMERCIAL</option>
                <option value="PUBLIC">PUBLIC</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Coverage Radius (meters)
              </label>
              <input
                type="number"
                value={coverageRadiusMeters}
                onChange={(e) => setCoverageRadiusMeters(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Longitude
              </label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Latitude
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Rules
            </label>
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={makeModerator}
              onChange={(e) => setMakeModerator(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Make me a moderator of this hub
          </label>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          {status && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {status}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Hub"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Hub;
