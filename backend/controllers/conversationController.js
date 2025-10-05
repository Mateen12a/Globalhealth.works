// controllers/conversationController.js
const Conversation = require("../models/Conversation");
const User = require("../models/User");

/**
 * POST /api/conversations/start
 * Create or return existing one-to-one conversation between two users.
 * Body: { toUserId, taskId?, proposalId? }
 */
exports.startConversation = async (req, res) => {
  try {
    const fromUserId = req.user.id; // logged-in user
    const { toUserId, taskId = null, proposalId = null } = req.body;

    if (!toUserId) {
      return res.status(400).json({ msg: "Recipient user ID is required" });
    }

    if (toUserId === fromUserId) {
      return res.status(400).json({ msg: "Cannot start conversation with yourself" });
    }

    // Check if recipient exists
    const recipient = await User.findById(toUserId);
    if (!recipient) {
      return res.status(404).json({ msg: "Recipient user not found" });
    }

    // Check if a conversation already exists
    const existingConversation = await Conversation.findOne({
      $or: [
        { participants: [fromUserId, toUserId] },
        { participants: [toUserId, fromUserId] }
      ],
      ...(taskId && { taskId }),
      ...(proposalId && { proposalId }),
    });

    if (existingConversation) {
      return res.status(200).json({ _id: existingConversation._id, msg: "Conversation already exists" });
    }

    // Create new conversation
    const newConversation = new Conversation({
      participants: [fromUserId, toUserId],
      taskId: taskId || null,
      proposalId: proposalId || null,
      messages: [],
    });

    await newConversation.save();

    res.status(201).json({ _id: newConversation._id, msg: "Conversation started" });
  } catch (err) {
    console.error("StartConversation error:", err);
    res.status(500).json({ msg: "Server error starting conversation" });
  }
};

// GET /api/conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "firstName lastName profileImage")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error("GetConversations error:", err);
    res.status(500).json({ msg: "Server error fetching conversations" });
  }
};

// GET /api/conversations/:conversationId
exports.getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "firstName lastName profileImage")
      .populate("messages");

    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }

    // Ensure user is part of the conversation
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json(conversation);
  } catch (err) {
    console.error("GetConversationById error:", err);
    res.status(500).json({ msg: "Server error fetching conversation" });
  }
};

/**
 * GET /api/conversations/:conversationId
 * Returns conversation metadata
 */
exports.getConversationById = async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.conversationId)
      .populate("participants", "firstName lastName profileImage")
      .lean();
    if (!convo) return res.status(404).json({ msg: "Conversation not found" });

    const isParticipant = convo.participants.some(
      (p) => String(p._id) === String(req.user.id)
    );
    console.log(isParticipant);

    if (!isParticipant) return res.status(403).json({ msg: "Not authorized" });

    res.json(convo);
  } catch (err) {
    console.error("getConversationById error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
