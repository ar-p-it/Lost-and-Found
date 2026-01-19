import { useEffect, useState } from "react";
import PostCard from "../components/PostCard.js";

// Placeholder feed using static sample until a GET /posts endpoint exists.
const sample = [
  {
    _id: "1",
    type: "LOST",
    status: "OPEN",
    title: "Lost black backpack near platform 3",
    description: "Contains laptop and documents.",
    tags: ["backpack", "black", "laptop"],
    createdAt: Date.now() - 3600_000,
  },
  {
    _id: "2",
    type: "FOUND",
    status: "OPEN",
    title: "Found iPhone with red case",
    description: "Found near ticket counter.",
    tags: ["iphone", "phone"],
    createdAt: Date.now() - 7200_000,
  },
];

export default function Feed() {
  const [posts, setPosts] = useState(sample);
  useEffect(() => {
    /* TODO: fetch feed when GET /posts is available */
  }, []);
  return (
    <div className="feed">
      <div className="filters">
        <span className="tag active">New</span>
        <span className="tag">Open</span>
        <span className="tag">Lost</span>
        <span className="tag">Found</span>
      </div>
      {posts.map((p) => (
        <PostCard key={p._id} post={p} />
      ))}
    </div>
  );
}
