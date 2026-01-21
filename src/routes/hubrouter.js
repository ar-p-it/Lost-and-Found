const express = require("express");
const mongoose = require("mongoose");
const { userAuth } = require("../middleware/adminAuth");
const Hub = require("../models/hub");
const User = require("../models/user");

const router = express.Router();

// Search hubs by name/slug
// Route: GET /hubs/search?q=...
router.get("/hubs/search", userAuth, async (req, res) => {
  try {
    const { q, limit } = req.query;
    const parsedLimit = limit ? parseInt(limit, 10) : 20;

    if (!q || typeof q !== "string" || q.trim().length < 2) {
      return res.status(200).json({ data: [] });
    }

    const search = q.trim();
    const hubs = await Hub.find({
      isActive: true,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ],
    })
      .select(
        "name slug category description rules memberCount coverageRadiusMeters location",
      )
      .sort({ memberCount: -1, createdAt: -1 })
      .limit(parsedLimit);

    return res.status(200).json({ data: hubs });
  } catch (err) {
    console.error("Search hubs error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// List all hubs
// Route: GET /gethubs
router.get("/gethubs", async (req, res) => {
  try {
    const hubs = await Hub.find({ isActive: true })
      .select(
        "name slug category description rules memberCount coverageRadiusMeters location isActive",
      )
      .sort({ createdAt: -1 });

    return res.json({ data: hubs });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// List hubs joined by the current user
// Route: GET /hubs
router.get("/hubs", userAuth, async (req, res) => {
  try {
    const { limit } = req.query;
    const parsedLimit = limit ? parseInt(limit, 10) : 50;

    const userDoc = await User.findById(req.user._id).select("memberships");
    const hubIds = (userDoc?.memberships || []).map((m) => m.hubId);

    if (!hubIds.length) {
      return res.status(200).json({ data: [] });
    }

    const hubs = await Hub.find({ _id: { $in: hubIds }, isActive: true })
      .select(
        "name slug category description rules memberCount coverageRadiusMeters location",
      )
      .sort({ memberCount: -1, createdAt: -1 })
      .limit(parsedLimit);

    return res.status(200).json({ data: hubs });
  } catch (err) {
    console.error("List hubs error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// Create a hub
// Route: POST /hubs
// Body: { name, slug, category, location: { type:'Point', coordinates:[lng,lat] }, description?, coverageRadiusMeters?, rules?, makeModerator? }
router.get("/hubs/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const hub = await Hub.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    }).select(
      "name slug category description rules memberCount coverageRadiusMeters location _id"
    );

    if (!hub) {
      return res.status(404).json({ message: "Hub not found" });
    }

    res.status(200).json(hub);
  } catch (err) {
    console.error("Get hub by slug error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/hubs", userAuth, async (req, res) => {
  try {
    const {
      name,
      slug,
      category,
      location,
      description,
      coverageRadiusMeters,
      rules,
      makeModerator = true,
    } = req.body;

    // Validate required fields
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "name is required" });
    }
    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ message: "slug is required" });
    }
    const normalizedSlug = slug.toLowerCase().trim();
    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      return res.status(400).json({
        message: "slug must be lowercase letters, numbers, or hyphens",
      });
    }
    if (
      !category ||
      !["EDUCATIONAL", "TRANSIT", "COMMERCIAL", "PUBLIC"].includes(category)
    ) {
      return res.status(400).json({ message: "Invalid category" });
    }

    if (
      !location ||
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        message: "location must be { type:'Point', coordinates:[lng,lat] }",
      });
    }

    // Check slug uniqueness
    const existing = await Hub.findOne({ slug: normalizedSlug });
    if (existing) {
      return res.status(409).json({ message: "Hub slug already exists" });
    }

    const hub = new Hub({
      name: name.trim(),
      slug: normalizedSlug,
      category,
      description,
      location: { type: "Point", coordinates: location.coordinates },
      coverageRadiusMeters,
      rules,
      createdBy: req.user._id,
      isActive: true,
    });

    // If creator should be moderator
    if (makeModerator) {
      hub.moderatorIds = [req.user._id];
    }

    const savedHub = await hub.save();

    // Add membership to user (role MEMBER or MODERATOR depending on makeModerator)
    const role = makeModerator ? "MODERATOR" : "MEMBER";
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        memberships: { hubId: savedHub._id, role, joinedAt: new Date() },
      },
    });

    await Hub.updateOne({ _id: savedHub._id }, { $inc: { memberCount: 1 } });

    return res
      .status(201)
      .json({ message: "Hub created", hub: savedHub.toJSON() });
  } catch (err) {
    console.error("Create hub error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// Join a hub by slug or id
// Route: POST /hubs/:slugOrId/join
router.post("/hubs/:slugOrId/join", userAuth, async (req, res) => {
  try {
    const { slugOrId } = req.params;
    console.log("join");
    let hub;
    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      hub = await Hub.findById(slugOrId);
    } else {
      hub = await Hub.findOne({ slug: slugOrId.toLowerCase() });
    }
    if (!hub || !hub.isActive) {
      return res.status(404).json({ message: "Hub not found or inactive" });
    }

    const user = req.user;
    const alreadyMember = (user.memberships || []).find(
      (m) => String(m.hubId) === String(hub._id),
    );
    if (alreadyMember) {
      return res
        .status(200)
        .json({ message: "Already a member", hub: hub.toJSON() });
    }

    await User.updateOne(
      { _id: user._id },
      {
        $push: {
          memberships: { hubId: hub._id, role: "MEMBER", joinedAt: new Date() },
        },
      },
    );
    await Hub.updateOne({ _id: hub._id }, { $inc: { memberCount: 1 } });

    return res.status(200).json({ message: "Joined hub", hub: hub.toJSON() });
  } catch (err) {
    console.error("Join hub error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;
