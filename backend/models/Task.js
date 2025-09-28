// models/Task.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  summary: { type: String, required: true },
  description: { type: String, required: true },

  requiredSkills: [{ type: String }],
  focusAreas: [{ type: String }], // health topics taxonomy
  location: { type: String },
  duration: { type: String },
  startDate: { type: Date },
  languages: [{ type: String }],
  fundingStatus: { type: String, enum: ["funded", "partially funded", "unfunded"], default: "unfunded" },

  attachments: [{ type: String }], // file URLs
  status: {
    type: String,
    enum: ["draft", "published", "in-progress", "completed", "withdrawn"],
    default: "draft"
  },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
