const mongoose = require("mongoose");

// TokenTransaction tracks earning/spending tokens for actions like raising tickets,
// resolving posts, moderation penalties, etc.
const tokenTransactionSchema = new mongoose.Schema(
  {
    // User who owns this transaction
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Optional association to a post
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", index: true },

    // Transaction type: EARN or SPEND
    type: {
      type: String,
      required: true,
      enum: ["EARN", "SPEND"],
      index: true,
    },

    // Action or reason category for the transaction
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE_POST",
        "MATCH_FOUND",
        "RESOLVE_POST",
        "TICKET_RAISE",
        "TICKET_RESOLVE",
        "MODERATION_PENALTY",
        "BONUS",
      ],
      index: true,
    },

    // Token amount (positive integer)
    amount: { type: Number, required: true, min: 0 },

    // Denormalized balance after applying this transaction
    balanceAfter: { type: Number, min: 0 },

    // Transaction status lifecycle
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "REVERSED"],
      default: "COMPLETED",
      index: true,
    },

    // Arbitrary metadata for auditing
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

// Retrieval indexes
tokenTransactionSchema.index({ userId: 1, createdAt: -1 });
tokenTransactionSchema.index({ postId: 1, createdAt: -1 });

module.exports = mongoose.model("TokenTransaction", tokenTransactionSchema);
