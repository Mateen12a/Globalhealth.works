// routes/proposalRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  createProposal,
  getProposalsForTask,
  getMyProposals,
  getMyProposalStats,
  updateProposalStatus,
  withdrawProposal,
  getProposal,
} = require("../controllers/proposalController");
const { authMiddleware } = require("../controllers/authController");

// ensure uploads/proposals exists
const uploadsDir = path.join(__dirname, "..", "uploads", "proposals");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit per file

// Create proposal (SP). Accept up to 5 attachments named 'attachments'
router.post("/", authMiddleware, upload.array("attachments", 5), createProposal);

// Get proposals for a task (owner)
router.get("/task/:taskId", authMiddleware, getProposalsForTask);
// Get my proposals (SP) - must come before /:id route
router.get("/mine", authMiddleware, getMyProposals);

// Get my proposal stats (SP dashboard)
router.get("/my-stats", authMiddleware, getMyProposalStats);

router.get("/:id", authMiddleware, getProposal);

// Owner accept/reject a proposal
router.patch("/:proposalId/status", authMiddleware, updateProposalStatus);

// Applicant withdraw
router.patch("/:proposalId/withdraw", authMiddleware, withdrawProposal);

module.exports = router;
