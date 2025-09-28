// controllers/messageController.js
// path: controllers/messageController.js

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

// ---------- CONFIG ----------
const MAX_FILES = 5;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIMES = [
  "image/jpeg","image/png","image/gif","image/webp",
  "application/pdf","application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4","video/quicktime",
  "audio/mpeg","audio/mp3",
  "text/plain"
];

// ---------- UPLOAD (local disk) ----------
const uploadDir = path.join(__dirname, "..", "uploads", "messages");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) return cb(new Error("Unsupported file type"), false);
    cb(null, true);
  }
});

// middleware to attach to route
exports.uploadMiddleware = upload.array("attachments", MAX_FILES);

// ---------- SOCKET (set from index.js) ----------
let io;
exports.setSocket = (socketInstance) => {
  io = socketInstance;

  io.on("connection", (socket) => {
    // join user room for personal events
    socket.on("join", (userId) => {
      socket.join(userId);
      io.emit("presence:update", { userId, online: true });
    });

    socket.on("leave", (userId) => {
      socket.leave(userId);
      io.emit("presence:update", { userId, online: false });
    });

    socket.on("typing", ({ conversationId, from, to }) => {
      if (to) io.to(to).emit("typing", { conversationId, from });
    });

    socket.on("stopTyping", ({ conversationId, from, to }) => {
      if (to) io.to(to).emit("stopTyping", { conversationId, from });
    });
  });
};

// ---------- HELPERS ----------
const isImage = (mimetype) => mimetype.startsWith("image/");

const buildAttachmentsFromFiles = (files) => {
  if (!files || files.length === 0) return [];
  return files.map((f) => {
    const relative = path.relative(path.join(__dirname, ".."), f.path).replace(/\\/g, "/");
    return {
      type: isImage(f.mimetype)
        ? "image"
        : f.mimetype.startsWith("video")
        ? "video"
        : f.mimetype.startsWith("audio")
        ? "audio"
        : "file",
      url: `/${relative}`,
      fileName: f.originalname,
      fileSize: f.size,
      mimeType: f.mimetype,
      storage: "local"
    };
  });
};

/**
 * Send a message.
 * Body (multipart/form-data):
 * - conversationId (optional) OR receiverId (required)
 * - text (optional if attachments)
 * - replyTo (optional)
 * - attachments[] (files)
 * - taskId/proposalId (optional) -> used when creating a new convo
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, text, replyTo, taskId, proposalId } = req.body;
    const sender = req.user._id;

    if (!conversationId && !receiverId) return res.status(400).json({ msg: "conversationId or receiverId required" });
    const hasFiles = req.files && req.files.length > 0;
    if (!text && !hasFiles) return res.status(400).json({ msg: "Message must contain text or attachments" });

    // ensure conversation exists or create it
    let convoId = conversationId;
    if (!convoId) {
      // find existing convo between sender and receiver
      let convo = await Conversation.findOne({
        participants: { $all: [sender, receiverId] },
        isTaskConversation: !!taskId,
        ...(taskId ? { taskId } : {}),
        ...(proposalId ? { proposalId } : {}),
      });
      if (!convo) {
        convo = new Conversation({
          participants: [sender, receiverId],
          isTaskConversation: !!taskId,
          taskId: taskId || undefined,
          proposalId: proposalId || undefined,
          lastMessage: {},
        });
        await convo.save();

        // notify other user of new conversation
        if (io) {
          io.to(receiverId).emit("conversation:new", { conversationId: convo._id, from: sender.toString(), isTaskConversation: !!taskId, taskId, proposalId });
        }
      }
      convoId = convo._id;
    } else {
      // verify participant
      const c = await Conversation.findById(convoId);
      if (!c) return res.status(404).json({ msg: "Conversation not found" });
      if (!c.participants.some((p) => String(p) === String(sender))) return res.status(403).json({ msg: "Not authorized" });
    }

    // Construct attachments
    const attachments = buildAttachmentsFromFiles(req.files);

    // Determine receiver if not provided (conversation participants)
    let finalReceiver = receiverId;
    if (!finalReceiver) {
      const convo = await Conversation.findById(convoId);
      finalReceiver = convo.participants.find((p) => String(p) !== String(sender));
    }

    // Create message
    const message = new Message({
      conversationId: convoId,
      sender,
      receiver: finalReceiver,
      text: text || "",
      attachments,
      replyTo: replyTo || undefined,
      status: "sent",
    });

    await message.save();

    // update conversation lastMessage
    await Conversation.findByIdAndUpdate(convoId, {
      lastMessage: { text: message.text || (attachments[0] && "[attachment]") || "", sender, createdAt: message.createdAt }
    }, { new: true });

    // Realtime emits
    if (io) {
      // message to receiver
      io.to(finalReceiver.toString()).emit("message:new", {
        ...message.toObject(),
        sender: message.sender.toString(),
        receiver: message.receiver.toString(),
      });

      // notify sender too (for local echo)
      io.to(sender.toString()).emit("message:new", {
        ...message.toObject(),
        sender: message.sender.toString(),
        receiver: message.receiver.toString(),
      });

      // conversation update (for inbox)
      io.to(finalReceiver.toString()).emit("conversationUpdate", {
        conversationId: convoId.toString(),
        withUser: sender.toString(),
        lastMessage: { text: message.text, createdAt: message.createdAt, attachments: message.attachments }
      });
      io.to(sender.toString()).emit("conversationUpdate", {
        conversationId: convoId.toString(),
        withUser: finalReceiver.toString(),
        lastMessage: { text: message.text, createdAt: message.createdAt, attachments: message.attachments }
      });
    }

    // create in-app notification
    try {
      await createNotification(finalReceiver, "message", `${req.user.name} sent you a message`, `/messages/${sender}`);
    } catch (nerr) {
      // non-fatal
      console.warn("createNotification failed", nerr);
    }

    res.status(201).json(message);
  } catch (err) {
    console.error("sendMessage error:", err);
    if (err instanceof multer.MulterError || err.message === "Unsupported file type") {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Get conversation messages by conversationId (paginated).
 * GET /api/conversations/:conversationId/messages?page=1&limit=20
 */
exports.getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const myId = req.user._id;

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ msg: "Conversation not found" });
    if (!convo.participants.some((p) => String(p) === String(myId))) return res.status(403).json({ msg: "Not authorized" });

    const messages = await Message.find({ conversationId, deletedBy: { $ne: myId } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // mark incoming messages as read (only those addressed to me)
    const update = await Message.updateMany(
      { conversationId, receiver: myId, read: false },
      { $set: { read: true, readAt: new Date(), status: "seen" } }
    );

    if (update.modifiedCount > 0 && io) {
      // notify other participants (only the other user in one-to-one)
      const other = convo.participants.find((p) => String(p) !== String(myId));
      if (other) {
        io.to(other.toString()).emit("messagesSeen", { conversationId: conversationId.toString(), seenBy: myId.toString(), seenAt: new Date() });
      }
    }

    res.json(messages.reverse()); // return ascending order (oldest first)
  } catch (err) {
    console.error("getMessagesByConversation error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Edit message (only sender can edit)
 * PATCH /api/messages/:messageId
 * body: { text, attachmentsToAdd[], attachmentsToRemove[] }
 */
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text, attachmentsToRemove } = req.body;

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ msg: "Message not found" });
    if (String(msg.sender) !== String(req.user._id)) return res.status(403).json({ msg: "Not authorized to edit" });

    // remove attachments if provided (local files left on disk for now; implement cleanup later)
    if (Array.isArray(attachmentsToRemove) && attachmentsToRemove.length > 0) {
      msg.attachments = msg.attachments.filter((a) => !attachmentsToRemove.includes(a.url));
    }

    if (typeof text === "string") {
      msg.text = text;
      msg.isEdited = true;
      msg.editedAt = new Date();
    }

    // If new attachments uploaded, add them (req.files)
    if (req.files && req.files.length > 0) {
      const newAttachments = buildAttachmentsFromFiles(req.files);
      msg.attachments = msg.attachments.concat(newAttachments);
    }

    await msg.save();

    // emit edited message
    if (io) {
      io.to(msg.receiver.toString()).emit("message:edited", msg);
      io.to(msg.sender.toString()).emit("message:edited", msg);
    }

    res.json(msg);
  } catch (err) {
    console.error("editMessage error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Delete message for user (soft delete). If both users delete, you may choose to permanently remove later.
 * DELETE /api/messages/:messageId
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myId = req.user._id;

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ msg: "Message not found" });

    if (!msg.deletedBy.map(String).includes(String(myId))) {
      msg.deletedBy.push(myId);
      await msg.save();
    }

    // Emit deletion to both participants for UI update
    if (io) {
      io.to(msg.receiver.toString()).emit("message:deleted", { messageId, by: myId.toString() });
      io.to(msg.sender.toString()).emit("message:deleted", { messageId, by: myId.toString() });
    }

    res.json({ msg: "Message hidden for user" });
  } catch (err) {
    console.error("deleteMessage error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Mark single message as read (manual)
 * PATCH /api/messages/:messageId/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myId = req.user._id;

    const msg = await Message.findOneAndUpdate(
      { _id: messageId, receiver: myId },
      { $set: { read: true, readAt: new Date(), status: "seen" } },
      { new: true }
    );

    if (!msg) return res.status(404).json({ msg: "Message not found or unauthorized" });

    if (io) {
      io.to(msg.sender.toString()).emit("message:seen", { messageId: msg._id.toString(), seenBy: myId.toString(), readAt: msg.readAt });
      // conversation update too
      io.to(msg.sender.toString()).emit("conversationUpdate", { conversationId: msg.conversationId.toString(), lastMessage: { text: msg.text, createdAt: msg.createdAt, read: true, readAt: msg.readAt } });
    }

    res.json(msg);
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Mark entire conversation as read
 * PATCH /api/conversations/:conversationId/read
 */
exports.markConversationRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const myId = req.user._id;

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ msg: "Conversation not found" });
    if (!convo.participants.some((p) => String(p) === String(myId))) return res.status(403).json({ msg: "Not authorized" });

    const updated = await Message.updateMany({ conversationId, receiver: myId, read: false }, { $set: { read: true, readAt: new Date(), status: "seen" } });

    // notify other participant
    const other = convo.participants.find((p) => String(p) !== String(myId));
    if (other && io) {
      io.to(other.toString()).emit("messagesSeen", { conversationId: conversationId.toString(), seenBy: myId.toString(), seenAt: new Date() });
    }

    res.json({ modifiedCount: updated.modifiedCount });
  } catch (err) {
    console.error("markConversationRead error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Inbox (conversations list) with pagination and unread count:
 * GET /api/messages/inbox?page=1&limit=20
 *
 * NOTE: For one-to-one, Conversation model stores lastMessage so we query Conversation.
 */
exports.getInbox = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const convos = await Conversation.find({ participants: userId })
      .sort({ "lastMessage.createdAt": -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("participants", "name profileImage")
      .lean();

    // compute unread counts per conversation
    const results = await Promise.all(convos.map(async (c) => {
      const other = c.participants.find((p) => String(p._id) !== String(userId));
      const unreadCount = await Message.countDocuments({ conversationId: c._id, receiver: userId, read: false });
      return {
        conversationId: c._id.toString(),
        otherUser: other ? { _id: other._id.toString(), name: other.name, profileImage: other.profileImage } : null,
        isTaskConversation: c.isTaskConversation,
        taskId: c.taskId,
        proposalId: c.proposalId,
        lastMessage: c.lastMessage,
        unreadCount,
        updatedAt: c.updatedAt
      };
    }));

    res.json(results);
  } catch (err) {
    console.error("getInbox error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Reactions: POST /api/messages/:messageId/reactions
 * body: { emoji }
 */
exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji) return res.status(400).json({ msg: "emoji required" });

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ msg: "Message not found" });

    // prevent duplicate reaction by same user+emoji
    const exists = msg.reactions.some((r) => r.emoji === emoji && String(r.by) === String(userId));
    if (exists) {
      // remove (toggle)
      msg.reactions = msg.reactions.filter((r) => !(r.emoji === emoji && String(r.by) === String(userId)));
    } else {
      msg.reactions.push({ emoji, by: userId });
    }

    await msg.save();

    // notify participants
    if (io) {
      io.to(msg.receiver.toString()).emit("message:reaction", { messageId, reactions: msg.reactions });
      io.to(msg.sender.toString()).emit("message:reaction", { messageId, reactions: msg.reactions });
    }

    res.json({ messageId, reactions: msg.reactions });
  } catch (err) {
    console.error("addReaction error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Search messages (your own messages)
 * GET /api/messages/search?q=term&page=1&limit=20
 */
exports.searchMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ msg: "query (q) required" });

    // text search within messages where user is participant (sender or receiver)
    const filter = {
      $text: { $search: q },
      $or: [{ sender: userId }, { receiver: userId }],
      deletedBy: { $ne: userId }
    };

    const messages = await Message.find(filter, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json(messages);
  } catch (err) {
    console.error("searchMessages error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};



// ---------- HELPERS ----------


// ---------- CONTROLLERS ----------

// (sendMessage, getMessagesByConversation, editMessage, deleteMessage, markAsRead, markConversationRead remain same as in your code — already good with emits)

// EXTRA: Get unread count for all conversations
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Message.countDocuments({ receiver: userId, read: false });
    res.json({ unreadCount: count });
  } catch (err) {
    console.error("getUnreadCount error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};