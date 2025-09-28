// routes/adminRoutes.js
const express = require("express");
const { authMiddleware, requireRole } = require("../controllers/authController");
const {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllTasks,
  updateTaskStatus,
  deleteTask,
  getStats
} = require("../controllers/adminController");

const router = express.Router();

// Users
router.get("/users", authMiddleware, requireRole("admin"), getAllUsers);
router.patch("/users/:id/:action", authMiddleware, requireRole("admin"), updateUserStatus);
router.delete("/users/:id", authMiddleware, requireRole("admin"), deleteUser);

// Tasks
router.get("/tasks", authMiddleware, requireRole("admin"), getAllTasks);
router.patch("/tasks/:id/:action", authMiddleware, requireRole("admin"), updateTaskStatus);
router.delete("/tasks/:id", authMiddleware, requireRole("admin"), deleteTask);
router.get("/stats", authMiddleware, getStats);

module.exports = router;
