const mongoose = require("mongoose");

// Hub schema represents a location-based community (Educational, Transit, Commercial, Public)
// Users can join hubs; hubs have moderators, geospatial location, and rules.
const hubSchema = new mongoose.Schema(
  {
    // Human-friendly name of the hub
    name: { type: String, required: true, trim: true, maxlength: 120 },

    // URL-safe slug (unique) for routing and identification
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Category type of hub
    category: {
      type: String,
      required: true,
      enum: ["EDUCATIONAL", "TRANSIT", "COMMERCIAL", "PUBLIC"],
      index: true,
    },

    // Short description to guide users
    description: { type: String, trim: true, maxlength: 500 },

    // Geospatial center point of the hub (2dsphere)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        validate: {
          validator: (arr) => Array.isArray(arr) && arr.length === 2,
          message: "location.coordinates must be [lng, lat]",
        },
      },
    },

    // Optional coverage radius in meters; used for proximity feeds
    coverageRadiusMeters: { type: Number, min: 0, default: 1000 },

    // Hub moderators (users who can manage posts within this hub)
    moderatorIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    ],

    // Optional counters to support fast reads
    memberCount: { type: Number, default: 0, min: 0 },
    postCount: { type: Number, default: 0, min: 0 },

    // Rules/policies for posting in this hub
    rules: { type: String, trim: true },

    // Hub creator/owner for administrative purposes
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Active status to disable hubs without removing data
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Text index for discoverability
hubSchema.index({ name: "text", description: "text" });

// Unique slug and geo index for location queries
hubSchema.index({ slug: 1 }, { unique: true });
hubSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Hub", hubSchema);
