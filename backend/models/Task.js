// models/Task.js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  details: { type: String },
  status: { type: String, enum: ["pending", "reviewed", "resolved", "dismissed"], default: "pending" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date }
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 100 },
    summary: { type: String, required: true },
    description: { type: String, required: true },

    requiredSkills: [{ type: String }],
    focusAreas: [{ type: String }],
    location: { type: String },
    duration: { type: String },
    startDate: { type: Date },

    attachments: [{ type: String }],

    status: {
      type: String,
      enum: ["draft", "published", "in-progress", "completed", "withdrawn"],
      default: "draft",
    },

    // Relationships
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    accepted: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Reports
    reports: [reportSchema],
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
