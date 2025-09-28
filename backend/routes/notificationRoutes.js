// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../controllers/authController");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getNotifications);
router.patch("/:id/read", authMiddleware, markAsRead);
router.patch("/read-all", authMiddleware, markAllAsRead);

module.exports = router;
