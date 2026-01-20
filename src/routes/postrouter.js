const express = require("express");
const mongoose = require("mongoose");
const { userAuth } = require("../middleware/adminAuth");
const Post = require("../models/post");
const Hub = require("../models/hub");
const { interpolateRoute } = require("../utils/routeUtils");

const router = express.Router();

// Small helper to safely build regex from user input
const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Usage: Testing GET /posts (list)
// - No auth required.
// - Replace BASE_URL with your server + mount path (e.g., http://localhost:3000).
// Examples:
// curl -s "BASE_URL/posts?page=1&limit=10&sort=-createdAt"
// curl -s "BASE_URL/posts?type=LOST&status=OPEN"
// curl -s "BASE_URL/posts?hubSlug=central-hub&q=wallet"
// curl -s "BASE_URL/posts?tag=phone&tag=electronics"        // multiple tags
// curl -s "BASE_URL/posts?hubId=<hubId>"                    // by hubId
// curl -s "BASE_URL/posts?authorId=<userId>"                // by authorId
// GET /posts - List posts with pagination, filters, and sorting
// router.get("/posts", async (req, res) => {
//   try {
//     const {
//       page = "1",
//       limit = "5",
//       type,
//       status,
//       hubId,
//       hubSlug,
//       authorId,
//       tag,
//       q,
//       sort = "-createdAt",
//     } = req.query;

//     const pageNum = Math.max(1, parseInt(page, 10) || 1);
//     const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

//     const filter = {};

//     if (type && ["LOST", "FOUND"].includes(type)) filter.type = type;
//     if (status && ["OPEN", "CLOSED"].includes(status)) filter.status = status;

//     if (authorId && mongoose.Types.ObjectId.isValid(authorId)) {
//       filter.authorId = authorId;
//     }

//     if (hubId && mongoose.Types.ObjectId.isValid(hubId)) {
//       filter.hubId = hubId;
//     } else if (!hubId && hubSlug) {
//       const hub = await Hub.findOne({
//         slug: String(hubSlug).toLowerCase(),
//         isActive: true,
//       })
//         .select("_id")
//         .lean();
//       if (!hub) {
//         return res.status(404).json({ message: "Hub not found or inactive" });
//       }
//       filter.hubId = hub._id;
//     }

//     if (typeof tag !== "undefined") {
//       const tags = Array.isArray(tag) ? tag : [tag];
//       filter.tags = {
//         $in: tags.filter((t) => typeof t === "string" && t.trim()),
//       };
//     }

//     if (q && String(q).trim()) {
//       const rx = new RegExp(escapeRegex(String(q).trim()), "i");
//       filter.$or = [{ title: rx }, { description: rx }];
//     }

//     // Allow only safe sort fields
//     const allowedSorts = new Set(["createdAt", "-createdAt"]);
//     const sortBy = allowedSorts.has(sort) ? sort : "-createdAt";

//     const [items, total] = await Promise.all([
//       Post.find(filter)
//         .sort(sortBy)
//         .skip((pageNum - 1) * limitNum)
//         .limit(limitNum)
//         .select("-__v")
//         .lean(),
//       Post.countDocuments(filter),
//     ]);

//     return res.json({
//       data: items,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total,
//         pages: Math.ceil(total / limitNum) || 1,
//       },
//     });
//   } catch (err) {
//     console.error("List posts error:", err);
//     return res
//       .status(500)
//       .json({ message: "Internal server error", error: err.message });
//   }
// });

// GET /posts - List posts with optional location-based filtering
router.get("/posts", async (req, res) => {
  try {
    console.log("RAW QUERY:", req.query);
    const {
      page = "1",
      limit = "5",
      type,
      status,
      hubId,
      hubSlug,
      authorId,
      tag,
      q,
      sort = "-createdAt",
      lat,
      lng,
    } = req.query;

    /* ---------------- Pagination ---------------- */
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    /* ---------------- Base filter ---------------- */
    const filter = {};

    if (type && ["LOST", "FOUND"].includes(type)) filter.type = type;
    if (status && ["OPEN", "MATCHED", "RESOLVED"].includes(status)) {
      filter.status = status;
    }

    if (authorId && mongoose.Types.ObjectId.isValid(authorId)) {
      filter.authorId = authorId;
    }

    /* ---------------- Normalize hubSlug ---------------- */
    const cleanHubSlug =
      typeof hubSlug === "string" && hubSlug.trim().length > 0
        ? hubSlug.trim().toLowerCase()
        : null;

    /* ---------------- Resolve explicit hub ---------------- */
    let resolvedHubId = null;

    if (hubId && mongoose.Types.ObjectId.isValid(hubId)) {
      resolvedHubId = hubId;
    } else if (!hubId && cleanHubSlug) {
      const hub = await Hub.findOne({
        slug: cleanHubSlug,
        isActive: true,
      })
        .select("_id")
        .lean();

      if (!hub) {
        return res.status(404).json({ message: "Hub not found or inactive" });
      }

      resolvedHubId = hub._id;
    }

    /* ---------------- Location-based hub filtering ---------------- */
    let hubIdsToInclude = [];

    const latNum = Number(lat);
    const lngNum = Number(lng);

    console.log("PARSED LOCATION:", {
      lat,
      lng,
      latNum,
      lngNum,
      hasValidLocation: Number.isFinite(latNum) && Number.isFinite(lngNum),
    });

    const hasValidLocation =
      Number.isFinite(latNum) && Number.isFinite(lngNum);

    if (!resolvedHubId && hasValidLocation) {
      const userLocation = {
        type: "Point",
        coordinates: [lngNum, latNum], // [lng, lat]
      };

      const nearbyHubs = await Hub.find({
        isActive: true,
        location: {
          $nearSphere: {
            $geometry: userLocation,
            $maxDistance: 5000, // 5 km
          },
        },
      }).select("_id");

      console.log("NEARBY HUB COUNT:", nearbyHubs.length);

      hubIdsToInclude = nearbyHubs.map((h) => h._id);

      if (hubIdsToInclude.length === 0) {
        return res.json({
          data: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            pages: 1,
          },
        });
      }
    }

    /* ---------------- Apply hub filter precedence ---------------- */
    if (resolvedHubId) {
      filter.hubId = resolvedHubId;
    } else if (hubIdsToInclude.length > 0) {
      filter.hubId = { $in: hubIdsToInclude };
    }
    // else → global feed

    /* ---------------- Tag filter ---------------- */
    if (typeof tag !== "undefined") {
      const tags = Array.isArray(tag) ? tag : [tag];
      filter.tags = {
        $in: tags.filter((t) => typeof t === "string" && t.trim()),
      };
    }

    /* ---------------- Search filter ---------------- */
    if (q && String(q).trim()) {
      const rx = new RegExp(escapeRegex(String(q).trim()), "i");
      filter.$or = [{ title: rx }, { description: rx }];
    }

    /* ---------------- Sorting ---------------- */
    const allowedSorts = new Set(["createdAt", "-createdAt"]);
    const sortBy = allowedSorts.has(sort) ? sort : "-createdAt";

    /* ---------------- Fetch data ---------------- */
    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort(sortBy)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select("-__v")
        .lean(),
      Post.countDocuments(filter),
    ]);

    return res.json({
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error("List posts error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});



// Usage: Testing GET /posts/:id (single)
// - No auth required.
// - Returns 400 for invalid id, 404 if not found.
// Example:
// curl -s "BASE_URL/posts/<postId>"
// GET /posts/:id - Fetch a single post by id
router.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await Post.findById(id).select("-__v").lean();
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json({ data: post });
  } catch (err) {
    console.error("Get post error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

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

// router.post("/broadcast", userAuth, async (req, res) => {
//   const { title, description, tags, start, end } = req.body;

//   if (!title || !description || !start || !end) {
//     return res
//       .status(400)
//       .json({ error: "Missing fields: title, description, start, end" });
//   }

//   if (
//     typeof start.lat !== "number" ||
//     typeof start.lng !== "number" ||
//     typeof end.lat !== "number" ||
//     typeof end.lng !== "number"
//   ) {
//     return res.status(400).json({ error: "Invalid coordinates" });
//   }

//   try {
//     const points = interpolateRoute(start, end);
//     const hubMap = new Map();

//     for (const p of points) {
//       const hubs = await Hub.find({
//         isActive: true,
//         location: {
//           $nearSphere: {
//             $geometry: { type: "Point", coordinates: [p.lng, p.lat] },
//             $maxDistance: 2000,
//           },
//         },
//       });
//       hubs.forEach((h) => hubMap.set(h._id.toString(), h));
//     }

//     const hubs = [...hubMap.values()];
//     const createdPosts = [];

//     for (const hub of hubs) {
//       const post = new Post({
//         type: "LOST",
//         title: title.trim(),
//         description,
//         authorId: req.user._id,
//         hubId: hub._id,
//         status: "OPEN",
//         tags: Array.isArray(tags) ? tags : [],
//       });
//       const saved = await post.save();
//       createdPosts.push(saved);
//     }

//     res.json({
//       message: "Broadcast successful",
//       hubsNotified: hubs.length,
//       postsCreated: createdPosts.length,
//     });
//   } catch (err) {
//     console.error("Broadcast error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

router.post("/broadcast", userAuth, async (req, res) => {
  const {
    type = "LOST",
    title,
    description,
    tags = [],
    start,
    end,
    location,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "title and description are required" });
  }

  if (!["LOST", "FOUND"].includes(type)) {
    return res.status(400).json({ error: "Invalid post type" });
  }

  try {
    let hubs = [];

    /* ---------------- LOST FLOW ---------------- */
    if (type === "LOST") {
      if (!start || !end) {
        return res.status(400).json({
          error: "start and end are required for LOST items",
        });
      }

      if (
        typeof start.lat !== "number" ||
        typeof start.lng !== "number" ||
        typeof end.lat !== "number" ||
        typeof end.lng !== "number"
      ) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      const points = interpolateRoute(start, end);
      const hubMap = new Map();

      for (const p of points) {
        const nearby = await Hub.find({
          isActive: true,
          location: {
            $nearSphere: {
              $geometry: {
                type: "Point",
                coordinates: [p.lng, p.lat],
              },
              $maxDistance: 2000,
            },
          },
        });

        nearby.forEach((h) => hubMap.set(h._id.toString(), h));
      }

      hubs = [...hubMap.values()];
    }

    /* ---------------- FOUND FLOW ---------------- */
    if (type === "FOUND") {
      if (
        !location ||
        typeof location.lat !== "number" ||
        typeof location.lng !== "number"
      ) {
        return res.status(400).json({
          error: "location (lat,lng) is required for FOUND items",
        });
      }

      hubs = await Hub.find({
        isActive: true,
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [location.lng, location.lat],
            },
            $maxDistance: 2000,
          },
        },
      });
    }

    /* ---------------- CREATE POSTS ---------------- */
    if (hubs.length === 0) {
      return res.json({
        message: "Broadcast successful",
        hubsNotified: 0,
        postsCreated: 0,
      });
    }

    const createdPosts = await Promise.all(
      hubs.map((hub) =>
        Post.create({
          type,
          title: title.trim(),
          description,
          authorId: req.user._id,
          hubId: hub._id,
          status: "OPEN",
          tags,
          location:
            type === "FOUND"
              ? {
                type: "Point",
                coordinates: [location.lng, location.lat],
              }
              : undefined,
        })
      )
    );

    res.json({
      message: "Broadcast successful",
      hubsNotified: hubs.length,
      postsCreated: createdPosts.length,
    });
  } catch (err) {
    console.error("Broadcast error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
