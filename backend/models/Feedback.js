// models/Feedback.js
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    strengths: { type: String },
    improvementAreas: { type: String },
    testimonial: { type: String },
    privateNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);

