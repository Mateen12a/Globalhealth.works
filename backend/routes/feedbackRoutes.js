// routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../controllers/authController");
const {
  leaveFeedback,
  getFeedbackForUser,
  getFeedbackByUser,
} = require("../controllers/feedbackController");

// Leave feedback (requires login)
router.post("/", authMiddleware, leaveFeedback);

// Get feedback received by a user
router.get("/received/:userId", authMiddleware, getFeedbackForUser);

// Get feedback left by a user
router.get("/given/:userId", authMiddleware, getFeedbackByUser);

module.exports = router;
