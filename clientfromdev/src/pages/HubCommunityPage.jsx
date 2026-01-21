// // src/pages/HubCommunityPage.jsx
// import { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "axios";
// import { BASE_URL } from "../utils/constants";
// import CreateCommunityPost from "../components/CreateCommunityPost";

// const CATEGORY_LABELS = {
//     SIGHTING: "👀 Sighting",
//     ALERT: "⚠️ Alert",
//     QUESTION: "❓ Question",
//     DISCUSSION: "💬 Discussion",
//     UPDATE: "📢 Update",
// };

// export default function HubCommunityPage() {
//     const { slug } = useParams();

//     const [hub, setHub] = useState(null);
//     const [posts, setPosts] = useState([]);
//     const [isMember, setIsMember] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         const fetchCommunity = async () => {
//             try {
//                 setLoading(true);
//                 setError("");

//                 // 1️⃣ Fetch hub by slug
//                 const hubRes = await axios.get(`${BASE_URL}/hubs/${slug}`, {
//                     withCredentials: true,
//                 });

//                 const hubData = hubRes.data;
//                 if (!hubData?._id) {
//                     throw new Error("Invalid hub data");
//                 }
//                 setHub(hubData);

//                 // 2️⃣ Fetch logged-in user to check membership
//                 const userRes = await axios.get(`${BASE_URL}/profile`, {
//                     withCredentials: true,
//                 });

//                 const user = userRes.data;
//                 const member = user.memberships?.some(
//                     (m) => String(m.hubId) === String(hubData._id)
//                 );
//                 setIsMember(Boolean(member));

//                 // 3️⃣ Fetch community posts (IMPORTANT: use hubId, not slug)
//                 const postsRes = await axios.get(
//                     `${BASE_URL}/hubs/${hubData._id}/community/posts`,
//                     { withCredentials: true }
//                 );

//                 setPosts(postsRes.data || []);
//             } catch (err) {
//                 console.error("Community load error:", err);
//                 setError(
//                     err.response?.data?.message || "Failed to load community"
//                 );
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (slug) fetchCommunity();
//     }, [slug]);

//     if (loading) {
//         return <div className="p-6 text-slate-500">Loading community…</div>;
//     }

//     if (error) {
//         return <div className="p-6 text-red-600">{error}</div>;
//     }

//     return (
//         <div className="max-w-3xl mx-auto px-4 py-6">
//             {/* Hub Header */}
//             <div className="mb-4">
//                 <h1 className="text-2xl font-bold text-slate-900">
//                     {hub.name} Community
//                 </h1>
//                 {hub.description && (
//                     <p className="text-sm text-slate-500 mt-1">
//                         {hub.description}
//                     </p>
//                 )}
//             </div>

//             {/* Hub Navigation Tabs */}
//             <div className="flex gap-4 border-b mb-6">
//                 <Link
//                     to={`/hubs/${slug}`}
//                     className={`py-2 px-4 font-medium ${window.location.pathname === `/hubs/${slug}`
//                         ? "text-slate-900 border-b-2 border-slate-900"
//                         : "text-slate-500 hover:text-slate-700"
//                         }`}
//                 >
//                     Lost &amp; Found
//                 </Link>

//                 <Link
//                     to={`/hubs/${slug}/community`}
//                     className={`py-2 px-4 font-medium ${window.location.pathname === `/hubs/${slug}/community`
//                         ? "text-slate-900 border-b-2 border-slate-900"
//                         : "text-slate-500 hover:text-slate-700"
//                         }`}
//                 >
//                     Community
//                 </Link>
//             </div>

//             {/* Membership Info */}
//             {!isMember && (
//                 <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
//                     👋 Join this hub to post or comment in the community.
//                 </div>
//             )}

//             {/* Community Posts */}
//             {posts.length === 0 ? (
//                 <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
//                     <div className="text-slate-400 text-sm">
//                         No community posts yet.
//                     </div>
//                 </div>
//             ) : (
//                 <div className="space-y-4">
//                     {posts.map((post) => (
//                         <div
//                             key={post._id}
//                             className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
//                         >
//                             <div className="flex items-center justify-between text-xs text-slate-500">
//                                 <span className="font-semibold text-indigo-600">
//                                     {CATEGORY_LABELS[post.category] || post.category}
//                                 </span>
//                                 <span>
//                                     {new Date(post.createdAt).toLocaleString()}
//                                 </span>
//                             </div>

//                             {post.title && (
//                                 <h3 className="mt-2 font-bold text-slate-900">
//                                     {post.title}
//                                 </h3>
//                             )}

//                             <p className="mt-2 text-slate-700">{post.body}</p>

//                             {post.authorId && (
//                                 <div className="mt-3 text-xs text-slate-500">
//                                     Posted by{" "}
//                                     <span className="font-semibold">
//                                         {post.authorId.displayName ||
//                                             post.authorId.username}
//                                     </span>
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const CATEGORY_OPTIONS = [
    { value: "DISCUSSION", label: "💬 Discussion" },
    { value: "QUESTION", label: "❓ Question" },
    { value: "SIGHTING", label: "👀 Sighting" },
    { value: "ALERT", label: "⚠️ Alert" },
    { value: "UPDATE", label: "📢 Update" },
];

const CATEGORY_LABELS = {
    DISCUSSION: "💬 Discussion",
    QUESTION: "❓ Question",
    SIGHTING: "👀 Sighting",
    ALERT: "⚠️ Alert",
    UPDATE: "📢 Update",
};

export default function HubCommunityPage() {
    const { slug } = useParams();

    const [hub, setHub] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isMember, setIsMember] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Create post state
    const [category, setCategory] = useState("DISCUSSION");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState("");

    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                setLoading(true);
                setError("");

                // 1️⃣ Fetch hub by slug
                const hubRes = await axios.get(`${BASE_URL}/hubs/${slug}`, {
                    withCredentials: true,
                });

                const hubData = hubRes.data;
                if (!hubData?._id) throw new Error("Invalid hub");

                setHub(hubData);

                // 2️⃣ Fetch user to check membership
                const userRes = await axios.get(`${BASE_URL}/profile`, {
                    withCredentials: true,
                });

                const user = userRes.data;
                const member = user.memberships?.some(
                    (m) => String(m.hubId) === String(hubData._id)
                );
                setIsMember(Boolean(member));

                // 3️⃣ Fetch community posts using HUB ID
                const postsRes = await axios.get(
                    `${BASE_URL}/hubs/${hubData._id}/community/posts`,
                    { withCredentials: true }
                );

                setPosts(postsRes.data || []);
            } catch (err) {
                console.error("Community load error:", err);
                setError(
                    err.response?.data?.message || "Failed to load community"
                );
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchCommunity();
    }, [slug]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!body.trim()) return;

        try {
            setPosting(true);
            setPostError("");

            const res = await axios.post(
                `${BASE_URL}/hubs/${hub._id}/community/posts`,
                { category, title, body },
                { withCredentials: true }
            );

            // Add new post at top
            setPosts((prev) => [res.data, ...prev]);

            // Reset form
            setTitle("");
            setBody("");
            setCategory("DISCUSSION");
        } catch (err) {
            console.error(err);
            setPostError(
                err.response?.data?.message || "Failed to create post"
            );
        } finally {
            setPosting(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-slate-500">Loading community…</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600">{error}</div>;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Hub Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-900">
                    {hub.name} Community
                </h1>
                {hub.description && (
                    <p className="text-sm text-slate-500 mt-1">
                        {hub.description}
                    </p>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b mb-6">
                <Link
                    to={`/hubs/${slug}`}
                    className={`py-2 px-4 font-medium ${window.location.pathname === `/hubs/${slug}`
                            ? "text-slate-900 border-b-2 border-slate-900"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Lost &amp; Found
                </Link>
                <Link
                    to={`/hubs/${slug}/community`}
                    className={`py-2 px-4 font-medium ${window.location.pathname === `/hubs/${slug}/community`
                            ? "text-slate-900 border-b-2 border-slate-900"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Community
                </Link>
            </div>

            {/* Create Post */}
            {isMember ? (
                <form
                    onSubmit={handleCreatePost}
                    className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">
                        Create a community post
                    </h3>

                    {postError && (
                        <div className="mb-3 text-sm text-red-600">
                            {postError}
                        </div>
                    )}

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Title (optional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />

                    <textarea
                        placeholder="Share something with the community…"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={3}
                        required
                        className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
                    />

                    <button
                        type="submit"
                        disabled={posting}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black transition disabled:opacity-60"
                    >
                        {posting ? "Posting…" : "Post"}
                    </button>
                </form>
            ) : (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    👋 Join this hub to post or comment in the community.
                </div>
            )}

            {/* Community Posts */}
            {posts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">No community posts yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                            <div className="flex justify-between text-xs text-slate-500">
                                <span className="font-semibold text-indigo-600">
                                    {CATEGORY_LABELS[post.category] || post.category}
                                </span>
                                <span>
                                    {new Date(post.createdAt).toLocaleString()}
                                </span>
                            </div>

                            {post.title && (
                                <h3 className="mt-2 font-bold text-slate-900">
                                    {post.title}
                                </h3>
                            )}

                            <p className="mt-2 text-slate-700">{post.body}</p>

                            {post.authorId && (
                                <div className="mt-3 text-xs text-slate-500">
                                    Posted by{" "}
                                    <span className="font-semibold">
                                        {post.authorId.displayName ||
                                            post.authorId.username}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}