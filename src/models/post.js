const mongoose = require("mongoose");
const validator = require("validator");

// Post schema for LOST or FOUND items; appears in global and hub-specific feeds.
// Supports lifecycle OPEN → MATCHED → RESOLVED, geo location, moderation, and tokens linkage.
const postSchema = new mongoose.Schema(
  {
    // LOST or FOUND post type
    type: {
      type: String,
      required: true,
      enum: ["LOST", "FOUND"],
      index: true,
    },

    // Title of the post
    title: { type: String, required: true, trim: true, maxlength: 140 },

    // Detailed description for search
    description: { type: String, trim: true, maxlength: 4000 },

    // Author of the post
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Hub where the post is published
    hubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hub",
      required: true,
      index: true,
    },

    // Current status of the post
    status: {
      type: String,
      required: true,
      enum: ["OPEN", "MATCHED", "RESOLVED"],
      default: "OPEN",
      index: true,
    },

    // Location where the item was lost/found
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [lng, lat]
        validate: {
          validator: (arr) => Array.isArray(arr) && arr.length === 2,
          message: "location.coordinates must be [lng, lat]",
        },
      },
    },

    // Tags to improve searchability
    tags: [{ type: String, trim: true, maxlength: 40 }],

    // Optional image URLs for the post
    images: [
      {
        url: {
          type: String,
          trim: true,
          validate: (v) => !v || validator.isURL(v),
        },
        caption: { type: String, trim: true, maxlength: 120 },
      },
    ],

    // Optional security questions to verify ownership/knowledge
    securityQuestions: [
      new mongoose.Schema(
        {
          id: { type: String, required: true },
          question: { type: String, required: true, trim: true, maxlength: 200 },
          answer: { type: String, trim: true, maxlength: 400 }, // kept private
          required: { type: Boolean, default: false },
        },
        { _id: false },
      ),
    ],

    // Reference to a counterpart post when matched
    matchedPostId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },

    // Resolution information
    resolvedById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },

    // Moderators assigned specifically to this post
    moderatorIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    ],

    // Soft delete flag for moderation
    isDeleted: { type: Boolean, default: false, index: true },

    // Denormalized counters for performance
    commentCount: { type: Number, default: 0, min: 0 },
    participantCount: { type: Number, default: 0, min: 0 },

    // Optional metadata for ticketing linkage
    metadata: {
      ticketRaised: { type: Boolean, default: false }, // indicates if a token-based ticket was raised
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        // Strip answers from securityQuestions for client safety
        if (Array.isArray(ret.securityQuestions)) {
          ret.securityQuestions = ret.securityQuestions.map((q) => ({
            id: q.id,
            question: q.question,
            required: !!q.required,
          }));
        }
        return ret;
      },
    },
  },
);

// Text index on searchable fields
postSchema.index({ title: "text", description: "text", tags: "text" });

// Geo index for location-based discovery
postSchema.index({ location: "2dsphere" });

// Feed indexes
postSchema.index({ hubId: 1, status: 1, createdAt: -1 }); // hub feed by status and recency
postSchema.index({ status: 1, createdAt: -1 }); // global feed by status
postSchema.index({ type: 1, createdAt: -1 }); // filter by LOST/FOUND

module.exports = mongoose.model("Post", postSchema);
