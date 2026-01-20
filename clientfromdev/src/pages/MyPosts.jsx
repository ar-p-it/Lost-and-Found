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
        setPosts(res?.data?.data || []);
      } catch (err) {
        console.error(err);
        setError("Could not load your posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [user?._id]);

  if (loading)
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Loading your posts…
      </div>
    );

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-6">
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-6 flex items-center gap-2 border border-rose-100">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-b from-slate-50 via-white to-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-6 rounded-2xl border border-slate-100 bg-white/90 shadow-sm p-6">
          <h1 className="text-3xl font-extrabold text-slate-900">My Posts</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Track your lost and found reports in one place.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit3 className="text-indigo-400" size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Posts Yet</h3>
            <p className="text-slate-500 mt-1">
              Create your first post from the Create button above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white/90 p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
                  <span
                    className={
                      post.type === "LOST"
                        ? "inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 px-3 py-1 font-semibold"
                        : "inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 font-semibold"
                    }
                  >
                    {post.type === "LOST" ? "🔴 LOST" : "🟢 FOUND"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold mt-3 text-slate-900">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="text-slate-600 mt-2 leading-relaxed">
                    {post.description}
                  </p>
                )}
                {post.tags?.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
