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
    const { toUserId, taskId, proposalId } = req.body;
    const me = req.user?._id;

    if (!me) return res.status(401).json({ msg: "Unauthorized" });
    if (!toUserId) return res.status(400).json({ msg: "toUserId required" });
    if (String(toUserId) === String(me)) {
      return res.status(400).json({ msg: "Cannot start conversation with yourself" });
    }

    // Ensure both users exist
    const [meUser, otherUser] = await Promise.all([
      User.findById(me).select("_id"),
      User.findById(toUserId).select("_id"),
    ]);
    if (!meUser || !otherUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Try to find existing one-to-one conversation
    let convo = await Conversation.findOne({
      isTaskConversation: !!taskId,
      participants: { $all: [me, toUserId], $size: 2 },
      ...(taskId ? { taskId } : {}),
      ...(proposalId ? { proposalId } : {}),
    });

    if (!convo) {
      convo = new Conversation({
        participants: [me, toUserId], // ✅ both guaranteed
        isTaskConversation: !!taskId,
        taskId: taskId || undefined,
        proposalId: proposalId || undefined,
      });
      await convo.save();
    }

    // Populate minimal info
    const populated = await Conversation.findById(convo._id)
      .populate("participants", "name profileImage");

    res.json(populated);
  } catch (err) {
    console.error("startConversation error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET /api/conversations
 * Query: page, limit
 * Returns user's conversations with lastMessage and participant info
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const convos = await Conversation.find({ participants: userId })
      .sort({ "lastMessage.createdAt": -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("participants", "name profileImage")
      .lean();

    const mapped = convos.map((c) => {
      const other = c.participants.find((p) => String(p._id) !== String(userId));
      return {
        conversationId: c._id.toString(),
        isTaskConversation: c.isTaskConversation,
        taskId: c.taskId,
        proposalId: c.proposalId,
        otherUser: other
          ? { _id: other._id.toString(), name: other.name, profileImage: other.profileImage }
          : null,
        lastMessage: c.lastMessage,
        updatedAt: c.updatedAt,
        pinnedFor: c.pinnedFor || [],
        mutedFor: c.mutedFor || [],
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET /api/conversations/:conversationId
 * Returns conversation metadata
 */
exports.getConversationById = async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.conversationId)
      .populate("participants", "name profileImage")
      .lean();
    if (!convo) return res.status(404).json({ msg: "Conversation not found" });

    const isParticipant = convo.participants.some(
      (p) => String(p._id) === String(req.user._id)
    );
    if (!isParticipant) return res.status(403).json({ msg: "Not authorized" });

    res.json(convo);
  } catch (err) {
    console.error("getConversationById error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
