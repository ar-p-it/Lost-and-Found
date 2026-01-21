const express = require("express");
const { userAuth } = require("../middleware/adminAuth");

const Hub = require("../models/hub");
const User = require("../models/user");
const HubCommunityPost = require("../models/HubCommunityPost");
const Comment = require("../models/comment");

const router = express.Router();

const isMemberOfHub = (user, hubId) => {
    return user.memberships.some(
        (m) => m.hubId.toString() === hubId.toString()
    );
};

// POST /hubs/:hubId/join
router.post("/hubs/:hubId/join", userAuth, async (req, res) => {
    try {
        const { hubId } = req.params;
        const user = req.user;

        const hub = await Hub.findById(hubId);
        if (!hub || !hub.isActive) {
            return res.status(404).json({ message: "Hub not found" });
        }

        if (isMemberOfHub(user, hubId)) {
            return res.status(400).json({ message: "Already a member" });
        }

        user.memberships.push({ hubId, role: "MEMBER" });
        await user.save();

        hub.memberCount += 1;
        await hub.save();

        res.status(200).json({ message: "Joined hub successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /hubs/:hubId/leave
router.post("/hubs/:hubId/leave", userAuth, async (req, res) => {
    try {
        const { hubId } = req.params;
        const user = req.user;

        user.memberships = user.memberships.filter(
            (m) => m.hubId.toString() !== hubId
        );
        await user.save();

        await Hub.findByIdAndUpdate(hubId, {
            $inc: { memberCount: -1 },
        });

        res.status(200).json({ message: "Left hub successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /hubs/:hubId/community/posts
router.post("/hubs/:hubId/community/posts", userAuth, async (req, res) => {
    try {
        const { hubId } = req.params;
        const user = req.user;

        if (!isMemberOfHub(user, hubId)) {
            return res.status(403).json({
                message: "Join the hub to post in its community",
            });
        }

        const { category, title, body, location, relatedPostId, images } = req.body;

        const communityPost = await HubCommunityPost.create({
            hubId,
            authorId: user._id,
            category,
            title,
            body,
            location,
            relatedPostId,
            images,
        });

        res.status(201).json(communityPost);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /hubs/:hubId/community/posts
router.get("/hubs/:hubId/community/posts", async (req, res) => {
    try {
        const { hubId } = req.params;
        const { category } = req.query;

        const filter = { hubId, isDeleted: false };
        if (category) filter.category = category;

        const posts = await HubCommunityPost.find(filter)
            .populate("authorId", "username displayName avatarUrl")
            .sort({ isPinned: -1, createdAt: -1 })
            .limit(50);

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /community/posts/:postId/comments
router.post(
    "/community/posts/:postId/comments",
    userAuth,
    async (req, res) => {
        try {
            const { postId } = req.params;
            const { body, parentCommentId } = req.body;
            const user = req.user;

            const post = await HubCommunityPost.findById(postId);
            if (!post || post.isDeleted) {
                return res.status(404).json({ message: "Post not found" });
            }

            if (!isMemberOfHub(user, post.hubId)) {
                return res.status(403).json({
                    message: "Join the hub to comment",
                });
            }

            const comment = await Comment.create({
                authorId: user._id,
                targetType: "HUB_COMMUNITY_POST",
                targetId: postId,
                body,
                parentCommentId,
            });

            await HubCommunityPost.findByIdAndUpdate(postId, {
                $inc: { commentCount: 1 },
            });

            res.status(201).json(comment);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
);

// GET /community/posts/:postId/comments
router.get("/community/posts/:postId/comments", async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({
            targetType: "HUB_COMMUNITY_POST",
            targetId: postId,
            isDeleted: false,
        })
            .populate("authorId", "username displayName avatarUrl")
            .sort({ createdAt: 1 });

        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;