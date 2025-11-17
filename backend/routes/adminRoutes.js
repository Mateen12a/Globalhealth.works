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
  getStats,
  approveUser,
  rejectUser
} = require("../controllers/adminController");

const router = express.Router();

// Users
router.get("/users", authMiddleware, requireRole("admin"), getAllUsers);
router.put("/approve/:id", authMiddleware, requireRole("admin"), approveUser);
router.put("/reject/:id", authMiddleware, requireRole("admin"), rejectUser);
router.put("/user/:id/suspend", authMiddleware, requireRole("admin"), updateUserStatus);
router.put("/user/:id/activate", authMiddleware, requireRole("admin"), updateUserStatus);





// Tasks
router.get("/tasks", authMiddleware, requireRole("admin"), getAllTasks);
router.patch("/tasks/:id/:action", authMiddleware, requireRole("admin"), updateTaskStatus);
router.delete("/tasks/:id", authMiddleware, requireRole("admin"), deleteTask);
router.get("/stats", authMiddleware, getStats);

module.exports = router;
