// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../controllers/authController");
const {
  createTask,
  getTasks,
  getTask,
  applyToTask,
  updateTask,
  updateStatus,   // ✅ corrected
  getMyApplications,
  uploadTaskAttachments
} = require("../controllers/taskController");

// Task Owner: create
router.post("/", authMiddleware, uploadTaskAttachments, createTask);

// All users: list tasks
router.get("/", authMiddleware, getTasks);

// Solution Provider: view their applications
router.get("/my-applications", authMiddleware, getMyApplications);

// Single task
router.get("/:id", authMiddleware, getTask);

// Solution Provider: apply
router.post("/:id/apply", authMiddleware, applyToTask);

// Task Owner: update task
router.put("/:id", authMiddleware, uploadTaskAttachments, updateTask );

// Task Owner: update status
router.patch("/:id/status", authMiddleware, updateStatus);

module.exports = router;
