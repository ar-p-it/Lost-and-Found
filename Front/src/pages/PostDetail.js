import { useParams } from "react-router-dom";
import * as api from "../services/api.js";
import { useEffect, useState } from "react";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    // TODO: replace with GET /posts/:id
    setPost({
      _id: id,
      type: "LOST",
      status: "OPEN",
      title: "Sample Post",
      description: "Details here",
      tags: ["sample"],
    });
  }, [id]);

  const startChat = async () => {
    try {
      const res = await api.startChat(id);
      setStatus(`Chat ready: ${res.chat?._id}`);
    } catch (err) {
      setStatus(err.message);
    }
  };

  if (!post) return null;
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row">
          <span
            className={`post-badge ${post.type === "LOST" ? "lost" : "found"}`}
          >
            {post.type}
          </span>
          <span
            className={`status ${post.status.toLowerCase()}`}
            style={{ marginLeft: 8 }}
          >
            {post.status}
          </span>
        </div>
        <div className="muted">{new Date().toLocaleString()}</div>
      </div>
      <h2 style={{ margin: "4px 0" }}>{post.title}</h2>
      <div className="desc">{post.description}</div>
      <div style={{ margin: "8px 0" }}>
        {(post.tags || []).map((t) => (
          <span className="tag" key={t}>
            #{t}
          </span>
        ))}
      </div>
      <div className="cta" style={{ justifyContent: "flex-end" }}>
        <button className="btn primary" onClick={startChat}>
          Message Author
        </button>
      </div>
      {status && <div className="muted">{status}</div>}
    </div>
  );
}
