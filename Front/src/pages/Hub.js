import PostCard from "../components/PostCard.js";

export default function Hub() {
  // Placeholder hub page; in real app fetch hub and posts by slug
  const posts = [];
  return (
    <div className="feed">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Hub Header</h3>
        <div className="muted">Category • Members • Rules • Join/Leave</div>
      </div>
      {posts.length === 0 && (
        <div className="muted">No posts yet in this hub.</div>
      )}
      {posts.map((p) => (
        <PostCard key={p._id} post={p} />
      ))}
    </div>
  );
}
