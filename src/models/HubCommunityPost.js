// models/HubCommunityPost.js
const mongoose = require("mongoose");

const hubCommunityPostSchema = new mongoose.Schema(
    {
        hubId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hub",
            required: true,
            index: true,
        },

        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // What kind of community post this is
        category: {
            type: String,
            required: true,
            enum: ["SIGHTING", "ALERT", "QUESTION", "DISCUSSION", "UPDATE"],
            index: true,
        },

        title: {
            type: String,
            trim: true,
            maxlength: 140,
        },

        body: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000,
        },

        // Optional location for sightings / alerts
        location: {
            type: {
                type: String,
                enum: ["Point"],
            },
            coordinates: {
                type: [Number], // [lng, lat]
            },
        },

        // Optional reference to a LOST/FOUND post
        relatedPostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            index: true,
        },

        images: [
            {
                url: String,
                caption: String,
            },
        ],

        isPinned: { type: Boolean, default: false, index: true },

        isDeleted: { type: Boolean, default: false, index: true },

        // Counters
        commentCount: { type: Number, default: 0 },
        reactionCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Indexes for fast community feed
hubCommunityPostSchema.index({
    hubId: 1,
    category: 1,
    createdAt: -1,
});

hubCommunityPostSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(
    "HubCommunityPost",
    hubCommunityPostSchema
);