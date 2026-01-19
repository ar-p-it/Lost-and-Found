import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  const badgeClass = post.type === "LOST" ? "lost" : "found";
  const statusClass = (post.status || "OPEN").toLowerCase();
  return (
    <article className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row">
          <span className={`post-badge ${badgeClass}`}>{post.type}</span>
          <span className={`status ${statusClass}`}>
            {post.status || "OPEN"}
          </span>
        </div>
        <span className="muted">
          {new Date(post.createdAt || Date.now()).toLocaleString()}
        </span>
      </div>
      <div className="row">
        {post.images?.[0]?.url && (
          <img className="thumb" src={post.images[0].url} alt="thumb" />
        )}
        <div style={{ display: "grid", gap: 4 }}>
          <Link className="title" to={`/app/post/${post._id}`}>
            {post.title}
          </Link>
          <div className="desc">{post.description?.slice(0, 140)}</div>
          <div className="muted">
            in{" "}
            <Link to={`/app/h/${post.hubSlug || post.hubId}`}>
              {post.hubName || "Hub"}
            </Link>{" "}
            • by {post.authorName || "User"}
          </div>
        </div>
      </div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row" style={{ gap: 6 }}>
          {(post.tags || []).slice(0, 4).map((t) => (
            <span key={t} className="tag">
              #{t}
            </span>
          ))}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn ghost">Save</button>
          <button className="btn ghost">Share</button>
        </div>
      </div>
    </article>
  );
}
