// routes/conversationRoutes.js
// path: routes/conversationRoutes.js
const express = require("express");
const { authMiddleware } = require("../controllers/authController");
const conversationController = require("../controllers/conversationController");
const messageController = require("../controllers/messageController");

const router = express.Router();

router.post("/start", authMiddleware, conversationController.startConversation);
router.get("/", authMiddleware, conversationController.getConversations);
router.get("/:conversationId", authMiddleware, conversationController.getConversationById);

// Conversation messages (paginated)
router.get("/:conversationId/messages", authMiddleware, messageController.getMessagesByConversation);

// mark conversation read
router.patch("/:conversationId/read", authMiddleware, messageController.markConversationRead);

module.exports = router;
