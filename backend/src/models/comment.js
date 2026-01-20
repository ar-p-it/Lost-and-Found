const mongoose = require("mongoose");

// Comment schema for posts; supports threading via optional parentCommentId.
// Indexed for post-level retrieval and text search.
const commentSchema = new mongoose.Schema(
  {
    // Post being commented on
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    // Author of the comment
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Comment body content
    body: { type: String, required: true, trim: true, maxlength: 5000 },

    // For threaded comments (optional)
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },

    // Moderation flags
    isDeleted: { type: Boolean, default: false, index: true },
    isLocked: { type: Boolean, default: false },
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

// Text index for search within comments
commentSchema.index({ body: "text" });

// Retrieval index for post comments by recency
commentSchema.index({ postId: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
