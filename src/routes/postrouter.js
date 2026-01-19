const express = require("express");
const mongoose = require("mongoose");
const { userAuth } = require("../middleware/adminAuth");
const Post = require("../models/post");
const Hub = require("../models/hub");
const { interpolateRoute } = require("../utils/routeUtils");

const router = express.Router();

// Create a LOST/FOUND post
// Route: POST /posts
// Auth: required
// Body: { type, title, description, hubId | hubSlug, location?, tags?, images? }
router.post("/posts", userAuth, async (req, res) => {
  try {
//     console.log("METHOD:", req.method);
// console.log("CONTENT-TYPE:", req.headers["content-type"]);
// console.log("RAW BODY:", req.body);

    const { type, title, description, hubId, hubSlug, location, tags, images } =
      req.body;

    // Basic validation
    if (!type || !["LOST", "FOUND"].includes(type)) {
      return res.status(400).json({ message: "type must be LOST or FOUND" });
    }
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "title must be at least 3 chars" });
    }
    if (description && description.length > 4000) {
      return res.status(400).json({ message: "description too long" });
    }

    // Resolve hub
    let hub;
    if (hubId) {
      if (!mongoose.Types.ObjectId.isValid(hubId)) {
        return res.status(400).json({ message: "Invalid hubId" });
      }
      hub = await Hub.findById(hubId);
    } else if (hubSlug) {
      hub = await Hub.findOne({ slug: hubSlug.toLowerCase() });
    } else {
      return res.status(400).json({ message: "hubId or hubSlug is required" });
    }
    if (!hub || !hub.isActive) {
      return res.status(404).json({ message: "Hub not found or inactive" });
    }

    // Enforce membership: user must be member or moderator of hub, unless ADMIN
    const user = req.user;
    const isAdmin = (user.roles || []).includes("ADMIN");
    const membership = (user.memberships || []).find(
      (m) => String(m.hubId) === String(hub._id),
    );
    if (!isAdmin && !membership) {
      return res.status(403).json({ message: "Join hub to create posts" });
    }

    // Validate location if provided
    let loc = undefined;
    if (location) {
      const { type: ltype, coordinates } = location;
      if (ltype && ltype !== "Point") {
        return res
          .status(400)
          .json({ message: "location.type must be 'Point'" });
      }
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        return res
          .status(400)
          .json({ message: "location.coordinates must be [lng, lat]" });
      }
      loc = { type: "Point", coordinates };
    }

    // Normalize tags/images
    const normalizedTags = Array.isArray(tags)
      ? tags
          .filter((t) => typeof t === "string")
          .map((t) => t.trim())
          .filter((t) => t.length > 0 && t.length <= 40)
      : [];

    const normalizedImages = Array.isArray(images)
      ? images
          .filter((img) => img && typeof img === "object")
          .map((img) => ({ url: img.url, caption: img.caption }))
      : [];

    const post = new Post({
      type,
      title: title.trim(),
      description,
      authorId: user._id,
      hubId: hub._id,
      status: "OPEN",
      location: loc,
      tags: normalizedTags,
      images: normalizedImages,
    });

    const saved = await post.save();

    return res.status(201).json({
      message: "Post created",
      post: saved.toJSON(),
    });
  } catch (err) {
    console.error("Create post error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// Regular post creation (optional, keep if needed)


router.post("/broadcast", userAuth, async (req, res) => {
  const { title, description, tags, start, end } = req.body;

  if (!title || !description || !start || !end) {
    return res.status(400).json({ error: 'Missing fields: title, description, start, end' });
  }

  if (
    typeof start.lat !== 'number' ||
    typeof start.lng !== 'number' ||
    typeof end.lat !== 'number' ||
    typeof end.lng !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  try {
    const points = interpolateRoute(start, end);
    const hubMap = new Map();

    for (const p of points) {
      const hubs = await Hub.find({
        isActive: true,
        location: {
          $nearSphere: {
            $geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
            $maxDistance: 2000
          }
        }
      });
      hubs.forEach(h => hubMap.set(h._id.toString(), h));
    }

    const hubs = [...hubMap.values()];
    const createdPosts = [];

    for (const hub of hubs) {
      const post = new Post({
        type: 'LOST',
        title: title.trim(),
        description,
        authorId: req.user._id,
        hubId: hub._id,
        status: 'OPEN',
        tags: Array.isArray(tags) ? tags : []
      });
      const saved = await post.save();
      createdPosts.push(saved);
    }

    res.json({
      message: 'Broadcast successful',
      hubsNotified: hubs.length,
      postsCreated: createdPosts.length
    });
  } catch (err) {
    console.error("Broadcast error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
