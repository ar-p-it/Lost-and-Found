import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addClaim, withdrawByPostId } from "../utils/claimsSlice";
import ClaimModal from "./ClaimModal";
import { Link } from "react-router-dom";

const HubPosts = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const claimed = useSelector((s) => s.claims.items);
  const isPostClaimed = (postId) => claimed.some((c) => c.post?._id === postId);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(hasMore);
  const abortRef = useRef(null);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const fetchPosts = useCallback(
    async (pageToLoad = 1, { replace = false } = {}) => {
      if (!replace && (!hasMoreRef.current || loadingRef.current)) return;
      loadingRef.current = true;
      setLoading(true);

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await axios.get(`${BASE_URL}/posts`, {
          params: {
            page: pageToLoad,
            limit: 5,
            sort: "-createdAt",
            hubSlug: slug,
          },
          withCredentials: true,
          signal: controller.signal,
        });

        const posts = res?.data?.data || [];
        const totalPages = res?.data?.pagination?.pages || 1;

        if (replace) {
          setItems([]);
          setPage(1);
        }

        if (posts.length) {
          setItems((prev) => (replace ? posts : [...prev, ...posts]));
          setPage((prev) => (replace ? 2 : prev + 1));
        }

        setHasMore(pageToLoad < totalPages);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Failed to fetch hub posts:", err);
        }
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    fetchPosts(1, { replace: true });
  }, [slug, fetchPosts]);

  const handleClaimSuccess = (post, serverData) => {
    const claimObj = serverData?.claim || serverData?.data?.claim || serverData;
    const claimId = claimObj?._id;
    const status = claimObj?.status || "PENDING";
    const createdAt = claimObj?.createdAt || new Date().toISOString();
    const claim = {
      id:
        claimId ||
        (crypto && crypto.randomUUID && crypto.randomUUID()) ||
        String(Date.now()),
      post,
      status,
      createdAt,
    };
    dispatch(addClaim(claim));
  };

  const handleWithdraw = async (postId) => {
    const claimForPost = claimed.find((c) => c.post?._id === postId);
    const claimId = claimForPost?.id;
    if (!claimId) {
      alert("No claim found for this post.");
      return;
    }
    if (!window.confirm("Withdraw your claim for this item?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/verification/${claimId}`, {
        withCredentials: true,
      });
      dispatch(withdrawByPostId(postId));
    } catch (err) {
      console.error(err);
      alert("Failed to withdraw claim.");
    }
  };

  return (
    <div className="bg-slate-50/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              r/{slug}
            </h2>
            <p className="text-sm text-slate-500">Posts in this hub</p>
          </div>
          <button
            onClick={() => fetchPosts(1, { replace: true })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Refresh
          </button>
          <div className="flex gap-4 border-b mb-6">
            <Link
              to={`/hubs/${slug}`}
              className={`py-2 px-4 font-medium ${
                window.location.pathname === `/hubs/${slug}`
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Lost & Found
            </Link>
            <Link
              to={`/hubs/${slug}/community`}
              className={`py-2 px-4 font-medium ${
                window.location.pathname === `/hubs/${slug}/community`
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Community
            </Link>
          </div>
        </div>

        {items.length === 0 && !loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              📦
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              No posts yet
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Be the first to post in this hub.
            </p>
          </div>
        )}

        {items.map((post) => (
          <div
            key={post._id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold tracking-wide ${
                  post.type === "LOST"
                    ? "bg-rose-50 text-rose-700 border border-rose-100"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}
              >
                {post.type === "LOST" ? "Lost" : "Found"}
              </span>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-3">
              {post.title}
            </h2>

            {post.description && (
              <p className="text-slate-700 mt-2 text-sm leading-relaxed line-clamp-3">
                {post.description}
              </p>
            )}

            {post.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-3">
                <span className="font-medium text-slate-600">Status:</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                  {post.status}
                </span>
                {post.hubId?.name && <span>📍 {post.hubId.name}</span>}
              </div>
              <div>
                {isPostClaimed(post._id) ? (
                  <button
                    className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-rose-100 transition"
                    onClick={() => handleWithdraw(post._id)}
                  >
                    Withdraw
                  </button>
                ) : (
                  <button
                    className="bg-slate-900 text-white px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-black transition"
                    onClick={() => setSelectedPost(post)}
                  >
                    Claim
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between py-4">
          <button
            disabled={page <= 1 || loading}
            onClick={() => fetchPosts(Math.max(1, page - 1), { replace: true })}
            className="btn rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
          >
            ⏮ Prev
          </button>

          <button
            disabled={!hasMore || loading}
            onClick={() => fetchPosts(page)}
            className="btn rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
          >
            Next ⏭
          </button>
        </div>

        {loading && <p className="text-center text-slate-400">Loading…</p>}

        {!hasMore && items.length > 0 && (
          <p className="text-center text-slate-400">
            You’ve reached the end of the feed !
          </p>
        )}

        {selectedPost && (
          <ClaimModal
            postId={selectedPost._id}
            postTitle={selectedPost.title}
            questions={selectedPost.questions || []}
            onClose={() => setSelectedPost(null)}
            onSuccess={(serverData) =>
              handleClaimSuccess(selectedPost, serverData)
            }
          />
        )}
      </div>
    </div>
  );
};

export default HubPosts;
