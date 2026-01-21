import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { Clock, Edit3, Tag } from "lucide-react";

const MyPosts = () => {
  const user = useSelector((s) => s.user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?._id) {
        setError("User not loaded. Please login.");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${BASE_URL}/posts`, {
          params: { authorId: user._id, sort: "-createdAt", limit: 20 },
          withCredentials: true,
        });
        const raw = res?.data?.data || [];
        // Deduplicate by title+description (keep the first/newest)
        const seen = new Set();
        const unique = [];
        for (const p of raw) {
          const key = `${(p.title || "").trim().toLowerCase()}|${(p.description || "").trim().toLowerCase()}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(p);
          }
        }
        setPosts(unique);
      } catch (err) {
        console.error(err);
        setError("Could not load your posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [user?._id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your posts…</div>;

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 border border-red-100">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Posts</h1>

      {posts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit3 className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-700">No Posts Yet</h3>
          <p className="text-gray-500 mt-1">Create your first post from the Create button above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between text-sm text-gray-500">
                <span className="font-semibold">{post.type === "LOST" ? "🔴 LOST" : "🟢 FOUND"}</span>
                <span className="flex items-center gap-1"><Clock size={14} />{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <h2 className="text-lg font-bold mt-2">{post.title}</h2>
              {post.description && (
                <p className="text-gray-700 mt-1">{post.description}</p>
              )}
              {post.tags?.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1">
                      <Tag size={12} />{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;
