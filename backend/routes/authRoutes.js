// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  register,
  login,
  authMiddleware,
  getMe,
  updateMe,
  uploadAvatar,
  resetAvatar,
  getPublicProfile
} = require("../controllers/authController");

// File upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure "uploads" folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1695674.png
  },
});
const upload = multer({ storage });

// Auth routes
router.post("/register", register);
router.post("/login", login);

// Profile routes
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.post("/upload-avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
router.patch("/reset-avatar", authMiddleware, resetAvatar); // ✅ reset to default
// Public profile route (no auth needed)
router.get("/users/:id/public", getPublicProfile);

module.exports = router;
