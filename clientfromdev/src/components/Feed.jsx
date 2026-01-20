import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { resetFeed, addFeed, incrementPage, setHasMore } from "../utils/feedSlice";
import { addClaim, withdrawByPostId } from "../utils/claimsSlice";
import ClaimModal from "./ClaimModal";

const Feed = () => {
  const dispatch = useDispatch();
  const items = useSelector((store) => store.feed.items);
  const page = useSelector((store) => store.feed.page);
  const hasMore = useSelector((store) => store.feed.hasMore);

  // Filters
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [hubSlug, setHubSlug] = useState("");
  const [tag, setTag] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  // Location state
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("prompt"); // 'prompt' | 'granted' | 'denied'

  const loadingRef = useRef(false);
  const abortRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q);
    }, 400);
    return () => clearTimeout(handler);
  }, [q]);

  const fetchFeed = useCallback(
    async (pageToLoad = 1, { replace = false } = {}) => {
      if (!replace && (!hasMore || loadingRef.current)) return;

      loadingRef.current = true;
      setLoading(true);

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const tagParam =
          tag && typeof tag === "string"
            ? tag.split(",").map((t) => t.trim()).filter(Boolean)
            : undefined;

        // Build params
        const params = {
          page: pageToLoad,
          limit: 5,
          sort: "-createdAt",
          type: type || undefined,
          status: status || undefined,
          hubSlug: hubSlug || undefined,
          tag: tagParam,
          q: debouncedQ || undefined,
        };

        // Add location if available
        if (userLocation) {
          params.lat = userLocation.lat;
          params.lng = userLocation.lng;
        }

        const res = await axios.get(`${BASE_URL}/posts`, {
          params,
          withCredentials: true,
          signal: controller.signal,
        });

        const posts = res?.data?.data || [];
        const totalPages = res?.data?.pagination?.pages || 1;

        if (replace) {
          dispatch(resetFeed());
        }

        if (posts.length) {
          dispatch(addFeed(posts));
          dispatch(incrementPage());
        }

        dispatch(setHasMore(pageToLoad < totalPages));
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Failed to fetch feed:", err);
        }
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [hasMore, type, status, hubSlug, tag, debouncedQ, userLocation, dispatch]
  );

  // Request location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Initial load + refetch on filter/location change
  useEffect(() => {
    fetchFeed(1, { replace: true });
  }, [type, status, hubSlug, tag, debouncedQ, userLocation]);

  const claimed = useSelector((s) => s.claims.items);
  const isPostClaimed = (postId) => claimed.some((c) => c.post?._id === postId);

  const [selectedPost, setSelectedPost] = useState(null);

  const handleClaimSuccess = (post, serverData) => {
    const claimObj = serverData?.claim || serverData?.data?.claim || serverData;
    const claimId = claimObj?._id;
    const status = claimObj?.status || "PENDING";
    const createdAt = claimObj?.createdAt || new Date().toISOString();
    const claim = {
      id:
        claimId ||
        ((crypto && crypto.randomUUID && crypto.randomUUID()) || String(Date.now())),
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
    <div className="max-w-2xl mx-auto mt-6 space-y-4">
      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => setType("")}
          className={`btn ${!type ? "bg-blue-600 text-white" : ""}`}
        >
          All
        </button>
        <button
          onClick={() => setType("LOST")}
          className={`btn ${type === "LOST" ? "bg-blue-600 text-white" : ""}`}
        >
          LOST
        </button>
        <button
          onClick={() => setType("FOUND")}
          className={`btn ${type === "FOUND" ? "bg-blue-600 text-white" : ""}`}
        >
          FOUND
        </button>
        <button
          onClick={() => setStatus("OPEN")}
          className={`btn ${status === "OPEN" ? "bg-blue-600 text-white" : ""}`}
        >
          OPEN
        </button>
        <button
          onClick={() => setStatus("CLOSED")}
          className={`btn ${status === "CLOSED" ? "bg-blue-600 text-white" : ""}`}
        >
          CLOSED
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search posts..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-2"
      />

      <div className="grid grid-cols-2 gap-2 mb-4">
        <input
          type="text"
          placeholder="Hub slug (e.g. central-hub)"
          value={hubSlug}
          onChange={(e) => setHubSlug(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Location status */}
      {locationStatus === "denied" && (
        <div className="bg-yellow-900/30 p-3 rounded text-sm text-yellow-200 mb-4">
          🌍 Location access denied. Showing global feed. Enable location for local results.
        </div>
      )}

      {/* Posts */}
      {items.map((post) => (
        <div
          key={post._id}
          className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
        >
          <div className="flex justify-between text-sm text-gray-500">
            <span className="font-semibold">
              {post.type === "LOST" ? "🔴 LOST" : "🟢 FOUND"}
            </span>
            <span>{new Date(post.createdAt).toLocaleString()}</span>
          </div>

          <h2 className="text-lg font-bold mt-2">{post.title}</h2>

          {post.description && (
            <p className="text-gray-700 mt-1 line-clamp-3">{post.description}</p>
          )}

          {post.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-4 text-sm text-gray-500">
            <span>Status: {post.status}</span>
            <div>
              {isPostClaimed(post._id) ? (
                <button
                  className="bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-red-100 transition"
                  onClick={() => handleWithdraw(post._id)}
                >
                  Withdraw
                </button>
              ) : (
                <button
                  className="bg-gray-900 text-white px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-black transition"
                  onClick={() => setSelectedPost(post)}
                >
                  Claim
                </button>
              )}
            </div>
            {post.hubId?.name && <span>📍 {post.hubId.name}</span>}
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-between py-6">
        <button
          disabled={page <= 1 || loading}
          onClick={() => fetchFeed(Math.max(1, page - 1), { replace: true })}
          className="btn"
        >
          ⏮ Prev
        </button>

        <button
          disabled={!hasMore || loading}
          onClick={() => fetchFeed(page + 1)}
          className="btn"
        >
          Next ⏭
        </button>
      </div>

      {loading && <p className="text-center text-gray-400">Loading…</p>}

      {!hasMore && <p className="text-center text-gray-400">You’ve reached the end 🚀</p>}

      {selectedPost && (
        <ClaimModal
          postId={selectedPost._id}
          postTitle={selectedPost.title}
          questions={selectedPost.questions || []}
          onClose={() => setSelectedPost(null)}
          onSuccess={(serverData) => handleClaimSuccess(selectedPost, serverData)}
        />
      )}
    </div>
  );
};

export default Feed;
