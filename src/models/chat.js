const mongoose = require("mongoose");

// Chat schema for private conversations related to posts.
// Typically 1:1 chats between participants for a specific post.
const chatSchema = new mongoose.Schema(
  {
    // Chat type; currently only POST-linked private chat
    type: { type: String, enum: ["POST"], default: "POST", index: true },

    // Optional linkage to a post; required for POST type
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", index: true },

    // Participants in the chat (usually 2 users)
    participantIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2,
        message: "Chat must have at least two participants",
      },
      index: true,
    },

    // Chat lifecycle
    isClosed: { type: Boolean, default: false, index: true },

    // Last message timestamp for sorting conversations
    lastMessageAt: { type: Date, default: Date.now, index: true },

    // Creator of the chat
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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

// Index to quickly find chats by post and recency
chatSchema.index({ postId: 1, lastMessageAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);
