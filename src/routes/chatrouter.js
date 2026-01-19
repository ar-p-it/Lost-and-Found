const express = require("express");
const mongoose = require("mongoose");
const { userAuth } = require("../middleware/adminAuth");
const Chat = require("../models/chat");
const Message = require("../models/message");
const Post = require("../models/post");
const Hub = require("../models/hub");

const router = express.Router();

// Start or reuse a chat between post author and the viewer (member of the hub)
// Route: POST /chats/start
// Body: { postId }
router.post("/chats/start", userAuth, async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Valid postId is required" });
    }

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    const hub = await Hub.findById(post.hubId);
    if (!hub || !hub.isActive) {
      return res.status(404).json({ message: "Hub not found or inactive" });
    }

    const viewer = req.user;
    if (viewer.isSuspended) {
      return res.status(403).json({ message: "Account is suspended" });
    }

    // Membership check: viewer must be member of hub unless ADMIN
    const isAdmin = (viewer.roles || []).includes("ADMIN");
    const viewerMembership = (viewer.memberships || []).find(
      (m) => String(m.hubId) === String(hub._id),
    );
    if (!isAdmin && !viewerMembership) {
      return res.status(403).json({ message: "Join the hub to start a chat" });
    }

    const authorId = String(post.authorId);
    const viewerId = String(viewer._id);
    if (authorId === viewerId) {
      return res
        .status(400)
        .json({ message: "Author cannot start chat with themselves" });
    }

    // Try to reuse existing open chat for this post between the same participants
    let chat = await Chat.findOne({
      postId: post._id,
      isClosed: false,
      participantIds: { $all: [post.authorId, viewer._id] },
    });

    if (!chat) {
      chat = new Chat({
        type: "POST",
        postId: post._id,
        participantIds: [post.authorId, viewer._id],
        createdById: viewer._id,
        isClosed: false,
        lastMessageAt: new Date(),
      });
      chat = await chat.save();

      // increment participantCount on post (once)
      await Post.updateOne(
        { _id: post._id },
        { $inc: { participantCount: 1 } },
      );
    }

    return res.status(201).json({ message: "Chat ready", chat: chat.toJSON() });
  } catch (err) {
    console.error("Start chat error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// Send a message in a chat
// Route: POST /chats/:chatId/messages
// Body: { body, attachment?, expiresAt? }
router.post("/chats/:chatId/messages", userAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { body, attachment, expiresAt } = req.body;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat || chat.isClosed) {
      return res.status(404).json({ message: "Chat not found or closed" });
    }

    // Authorization: sender must be participant
    const sender = req.user;
    const isParticipant = (chat.participantIds || []).some(
      (id) => String(id) === String(sender._id),
    );
    if (!isParticipant) {
      return res
        .status(403)
        .json({ message: "Not a participant of this chat" });
    }

    if (!body && !(attachment && attachment.url)) {
      return res
        .status(400)
        .json({ message: "Message body or attachment is required" });
    }

    const message = new Message({
      chatId: chat._id,
      senderId: sender._id,
      body,
      attachment,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });
    const saved = await message.save();

    // Update chat's lastMessageAt
    await Chat.updateOne(
      { _id: chat._id },
      { $set: { lastMessageAt: new Date() } },
    );

    return res
      .status(201)
      .json({ message: "Message sent", data: saved.toJSON() });
  } catch (err) {
    console.error("Send message error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// List messages in a chat (participants only)
// Route: GET /chats/:chatId/messages
router.get("/chats/:chatId/messages", userAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    const userId = String(req.user._id);
    const isParticipant = (chat.participantIds || []).some(
      (id) => String(id) === userId,
    );
    if (!isParticipant) {
      return res
        .status(403)
        .json({ message: "Not a participant of this chat" });
    }

    const messages = await Message.find({ chatId: chat._id }).sort({
      createdAt: 1,
    });
    return res.status(200).json({ messages });
  } catch (err) {
    console.error("List messages error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;
