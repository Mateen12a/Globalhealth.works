// routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../controllers/authController");
const {
  leaveFeedback,
  getFeedbackForUser,
  getFeedbackByUser,
  getFeedbackForTask,
  checkFeedbackForTask,
  reportFeedback,
  getReportedFeedback,
  reviewFeedbackReport,
  deleteFeedback,
} = require("../controllers/feedbackController");

// Leave feedback (requires login)
router.post("/", authMiddleware, leaveFeedback);

// Get feedback received by a user
router.get("/received/:userId", authMiddleware, getFeedbackForUser);

// Get feedback left by a user
router.get("/given/:userId", authMiddleware, getFeedbackByUser);

// Get feedback for a specific task
router.get("/task/:taskId", authMiddleware, getFeedbackForTask);

// Check if current user has submitted feedback for a task
router.get("/check/:taskId", authMiddleware, checkFeedbackForTask);

// Report feedback
router.post("/:id/report", authMiddleware, reportFeedback);

// Admin: Get all reported feedback
router.get("/reported", authMiddleware, requireRole("admin"), getReportedFeedback);

// Admin: Review feedback report
router.patch("/:id/review-report", authMiddleware, requireRole("admin"), reviewFeedbackReport);

// Admin: Delete feedback
router.delete("/:id", authMiddleware, requireRole("admin"), deleteFeedback);

module.exports = router;
