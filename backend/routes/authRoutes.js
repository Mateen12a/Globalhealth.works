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
  uploadCV,
  getPublicProfile,
  forgotPassword,
  resendVerificationCode,
  resetPassword,
} = require("../controllers/authController");

const uploadAvatarFile = multer({ storage: multer.memoryStorage() });

const uploadCVFile = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Only PDF, DOC, or DOCX files are allowed"));
    }
    cb(null, true);
  },
});

// Routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/resend-code", resendVerificationCode);
router.post("/reset-password", resetPassword);

// Token validation endpoint (lightweight - just checks if token is valid)
router.get("/validate", authMiddleware, (req, res) => {
  res.json({ valid: true, userId: req.userId });
});

// Profile routes
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);

// Uploads
router.post("/upload-avatar", authMiddleware, uploadAvatarFile.single("avatar"), uploadAvatar);
router.post("/upload-cv", authMiddleware, uploadCVFile.single("cv"), uploadCV); // ✅ New CV route
router.patch("/reset-avatar", authMiddleware, resetAvatar);

// Public profile
router.get("/users/:id/public", getPublicProfile);
router.get("/admin/review/:id", getPublicProfile);


module.exports = router;
