// controllers/feedbackController.js
const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const Task = require("../models/Task");

// Leave feedback
exports.leaveFeedback = async (req, res) => {
  try {
    const {
      taskId,
      toUser,
      rating,
      strengths,
      improvementAreas,
      testimonial,
      privateNotes,
    } = req.body;

    if (!taskId || !toUser || !rating) {
      return res.status(400).json({ msg: "Task, recipient, and rating are required" });
    }

    // ✅ Ensure feedback is only left after task completion
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }
    if (task.status !== "completed") {
      return res.status(400).json({ msg: "Feedback can only be left after task completion" });
    }

    const feedback = new Feedback({
      taskId,
      fromUser: req.user.id,
      toUser,
      rating,
      strengths,
      improvementAreas,
      testimonial,
      privateNotes,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    console.error("Leave feedback error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get feedback for a user (e.g., show on profile)
exports.getFeedbackForUser = async (req, res) => {
  try {
    const feedback = await Feedback.find({ toUser: req.params.userId })
      .populate("fromUser", "name role profileImage")
      .populate("taskId", "title status");

    res.json(feedback);
  } catch (err) {
    console.error("Get feedback error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get feedback left BY a user (optional, useful for TO/SP dashboards)
exports.getFeedbackByUser = async (req, res) => {
  try {
    const feedback = await Feedback.find({ fromUser: req.params.userId })
      .populate("toUser", "name role profileImage")
      .populate("taskId", "title status");

    res.json(feedback);
  } catch (err) {
    console.error("Get feedback by user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
