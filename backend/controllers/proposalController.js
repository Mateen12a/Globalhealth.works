// controllers/proposalController.js
const Proposal = require("../models/Proposal");
const Task = require("../models/Task");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// Create a proposal (multipart/form-data if attachments)
exports.createProposal = async (req, res) => {
  try {
    const { task: taskId, message, proposedBudget, proposedDuration } = req.body;
    const fromUserId = req.user.id;

    if (!taskId || !message) return res.status(400).json({ msg: "task and message required" });

    const task = await Task.findById(taskId).populate("owner");
    if (!task) return res.status(404).json({ msg: "Task not found" });

    // Do not allow owner to apply to own task
    if (task.owner._id.toString() === fromUserId) {
      return res.status(400).json({ msg: "Task owners cannot apply to their own tasks" });
    }

    // files handling (multer placed files in req.files)
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const f of req.files) {
        attachments.push(`/uploads/proposals/${f.filename}`);
      }
    }

    const proposal = new Proposal({
      task: taskId,
      fromUser: fromUserId,
      toUser: task.owner._id,
      message,
      attachments,
      proposedBudget: proposedBudget ? Number(proposedBudget) : undefined,
      proposedDuration,
    });

    await proposal.save();

    // Optional: push applicant to task.applicants array if you want
    // task.applicants.push(fromUserId);
    // await task.save();

    // TODO: trigger notification to task.owner (in-app / email)
    res.status(201).json({ msg: "Proposal submitted", proposal });
  } catch (err) {
    console.error("createProposal error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get proposals for a task (task owner only)
exports.getProposalsForTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.owner.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const proposals = await Proposal.find({ task: taskId })
      .populate("fromUser", "name email profileImage expertise")
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (err) {
    console.error("getProposalsForTask error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get proposals submitted by current user (SP)
exports.getMyProposals = async (req, res) => {
  try {
    const userId = req.user.id;
    const proposals = await Proposal.find({ fromUser: userId })
      .populate("task", "title summary status")
      .populate("toUser", "name email profileImage")
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (err) {
    console.error("getMyProposals error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Owner accepts or rejects a proposal
exports.updateProposalStatus = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { action } = req.body; // "accept" or "reject"
    const userId = req.user.id;

    const proposal = await Proposal.findById(proposalId).populate("task");
    if (!proposal) return res.status(404).json({ msg: "Proposal not found" });

    // Only task owner can accept/reject
    if (proposal.toUser.toString() !== userId && proposal.task.owner.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (!["accept", "reject"].includes(action)) return res.status(400).json({ msg: "Invalid action" });

    proposal.status = action === "accept" ? "accepted" : "rejected";
    await proposal.save();

    // If accepted -> optionally assign the task to this SP
    if (proposal.status === "accepted") {
      const task = await Task.findById(proposal.task._id);
      task.assignedTo = task.assignedTo || [];
      if (!task.assignedTo.includes(proposal.fromUser)) {
        task.assignedTo.push(proposal.fromUser);
      }
      task.status = "in-progress";
      await task.save();
    }

    // TODO: send notification to applicant
    res.json({ msg: `Proposal ${proposal.status}`, proposal });
  } catch (err) {
    console.error("updateProposalStatus error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Applicant withdraws their proposal
exports.withdrawProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const userId = req.user.id;
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ msg: "Proposal not found" });

    if (proposal.fromUser.toString() !== userId) return res.status(403).json({ msg: "Not authorized" });

    proposal.status = "withdrawn";
    await proposal.save();

    res.json({ msg: "Proposal withdrawn", proposal });
  } catch (err) {
    console.error("withdrawProposal error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getProposal = async (req, res) => {
  try {

    const taskId = req.params.id;
    const userId = req.user.id;
    const proposal = await Proposal.findOne({ task: taskId, fromUser: userId }).lean();
    if (!proposal) return res.status(404).json({ msg: "Proposal not found" });
    res.json(proposal);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};