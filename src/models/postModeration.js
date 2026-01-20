const mongoose = require("mongoose");

// PostModeration records moderation actions taken on posts.
// Supports assignment, escalation, and resolution.
const postModerationSchema = new mongoose.Schema(
  {
    // Target post
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    // Moderator who performed the action or is assigned
    moderatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Action type and status
    action: {
      type: String,
      required: true,
      enum: [
        "ASSIGN",
        "FLAG",
        "HIDE",
        "LOCK",
        "UNLOCK",
        "DELETE",
        "WARN_USER",
        "ESCALATE",
        "NOTE",
      ],
      index: true,
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
      index: true,
    },

    // Free-form reason and outcomes for audit trails
    reason: { type: String, trim: true, maxlength: 1000 },
    outcome: { type: String, trim: true, maxlength: 1000 },

    // Resolution timestamps
    assignedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },

    // Additional metadata
    metadata: { type: mongoose.Schema.Types.Mixed },
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

// Text index on reasoning/outcomes for internal search
postModerationSchema.index({ reason: "text", outcome: "text" });

// Retrieval indexes
postModerationSchema.index({ postId: 1, createdAt: -1 });
postModerationSchema.index({ moderatorId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("PostModeration", postModerationSchema);
