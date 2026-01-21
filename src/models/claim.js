// src/models/claim.js
const mongoose = require("mongoose");

// --- 1. Audit Log Sub-schema ---
const auditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true,
    enum: [
      "CLAIM_CREATED", 
      "EVIDENCE_SUBMITTED", 
      "SCORE_CALCULATED", 
      "ACCEPTED", 
      "REJECTED", 
      "MODERATION_REQUESTED"
    ]
  },
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User"
  }, 
  details: { type: String, trim: true },
  timestamp: { type: Date, default: Date.now }
});

// --- 2. Verification Data Sub-schema ---
const verificationDataSchema = new mongoose.Schema({
  questionAnswers: [{
    questionId: String, 
    answer: String      
  }],
  imageProofUrl: { type: String, trim: true, default: null },
  serialNumber: { type: String, trim: true, default: null },
  additionalDescription: { type: String, trim: true, maxlength: 2000 },
  systemTrustScore: { type: Number, default: 0, min: 0, max: 100 },
  systemTrustRationale: { type: String, trim: true, maxlength: 2000 }
});

// --- 3. Main Claim Schema ---
const claimSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
    index: true
  },
  claimantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  verifierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ["PENDING", "VERIFICATION_SUBMITTED", "ACCEPTED", "REJECTED", "MANUAL_REVIEW"],
    default: "PENDING",
    index: true
  },
  verification: verificationDataSchema, 
  timeline: [auditLogSchema],
  isDeleted: { type: Boolean, default: false }
}, { 
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } }
});

claimSchema.index({ postId: 1, claimantId: 1 }, { unique: true });

module.exports = mongoose.model("Claim", claimSchema);