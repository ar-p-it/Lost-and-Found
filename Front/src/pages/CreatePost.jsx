import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import * as api from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: "LOST",
    title: "",
    description: "",
    hubSlug: "",
    tags: "",
    lng: "",
    lat: "",
  });
  const memberHubs = useMemo(
    () => (user?.memberships || []).map((m) => m.hubId),
    [user],
  );
  const [hubSlug, setHubSlug] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    /* optionally fetch hub slugs by ids; using manual input for now */
  }, []);

  const canPost = (user?.memberships || []).length > 0;

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const body = {
        type: form.type,
        title: form.title,
        description: form.description,
        hubSlug: hubSlug || form.hubSlug,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        location:
          form.lng && form.lat
            ? {
                type: "Point",
                coordinates: [parseFloat(form.lng), parseFloat(form.lat)],
              }
            : undefined,
      };
      const res = await api.createPost(body);
      setMessage("Post created!");
      navigate(`/app/post/${res.post?._id || ""}`);
    } catch (err) {
      setMessage(err.message || "Failed to create post");
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Create Post</h3>
      {!canPost && <div className="error">Join a hub to post.</div>}
      <form onSubmit={submit}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <label>
            Type
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="btn"
              style={{ marginLeft: 8 }}
            >
              <option>LOST</option>
              <option>FOUND</option>
            </select>
          </label>
          <label>
            Hub slug
            <input
              placeholder="city-central-station"
              value={hubSlug}
              onChange={(e) => setHubSlug(e.target.value)}
              style={{ marginLeft: 8 }}
            />
          </label>
        </div>
        <div className="field">
          <label>Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <label>
            Lng{" "}
            <input
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              placeholder="77.5946"
            />
          </label>
          <label>
            Lat{" "}
            <input
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              placeholder="12.9716"
            />
          </label>
        </div>
        <div className="field">
          <label>Tags (comma separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="backpack, black, laptop"
          />
        </div>
        <div className="cta" style={{ justifyContent: "flex-end" }}>
          <button className="btn" type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="btn primary" type="submit" disabled={!canPost}>
            Submit
          </button>
        </div>
      </form>
      {message && <div className="muted">{message}</div>}
      <div className="muted" style={{ marginTop: 8 }}>
        Map pin selector TODO: integrate a map library.
      </div>
    </div>
  );
}
