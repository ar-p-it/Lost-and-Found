const mongoose = require("mongoose");

// Message schema for chat conversations.
// Supports TTL expiration via expiresAt index when set.
const messageSchema = new mongoose.Schema(
  {
    // Chat this message belongs to
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },

    // Sender of the message
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Message content
    body: { type: String, trim: true, maxlength: 5000 },

    // Optional attachment
    attachment: {
      url: { type: String, trim: true },
      type: { type: String, trim: true }, // e.g., image/png
      sizeBytes: { type: Number, min: 0 },
    },

    // Read receipts (ids of users who have read)
    readByIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Optional expiration time for retention policies (TTL index below)
    expiresAt: { type: Date },
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

// Index for conversation ordering and retrieval
messageSchema.index({ chatId: 1, createdAt: 1 });

// TTL index: when expiresAt is set, MongoDB will purge after that time
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Message", messageSchema);
