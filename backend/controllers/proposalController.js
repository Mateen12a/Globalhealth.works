// controllers/proposalController.js
const Proposal = require("../models/Proposal");
const Task = require("../models/Task");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");
const { sendMail, Templates } = require("../utils/mailer");
const createNotification = require("../utils/createNotification");

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

    // After saving the proposal
    try {
      const taskOwner = task.owner; // already populated
      const applicant = await User.findById(fromUserId).lean();

      // Email to task owner
      if (taskOwner.email) {
        const htmlOwner = Templates.proposalSubmitted(taskOwner, applicant, task, proposal);
        await sendMail(taskOwner.email, `New proposal for your task "${task.title}"`, htmlOwner);
      }

      // Email to applicant (solution provider)
      if (applicant.email) {
        const htmlApplicant = Templates.proposalSubmissionConfirmation(applicant, task, proposal);
        await sendMail(applicant.email, `Your proposal for "${task.title}" was submitted`, htmlApplicant);
      }

      // In-app notification for task owner
      await createNotification(
        taskOwner._id,
        "proposal",
        `${applicant.firstName} ${applicant.lastName} submitted a proposal for your task "${task.title}"`,
        `/tasks/${task._id}`,
        { title: "New Proposal Received", sendEmail: false }
      );

      // In-app notification for applicant
      await createNotification(
        fromUserId,
        "proposal",
        `Your proposal for "${task.title}" has been submitted successfully.`,
        `/my-proposals`,
        { title: "Proposal Submitted", sendEmail: false }
      );
    } catch (emailErr) {
      console.warn("Proposal email failed:", emailErr);
    }
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

    // Get the applicant user
    const applicant = await User.findById(proposal.fromUser);
    const taskId = proposal.task._id || proposal.task;
    const taskData = await Task.findById(taskId);
    if (!taskData) return res.status(404).json({ msg: "Task not found" });

    // If accepted -> optionally assign the task to this SP
    if (proposal.status === "accepted") {
      taskData.assignedTo = taskData.assignedTo || [];
      if (!taskData.assignedTo.includes(proposal.fromUser)) {
        taskData.assignedTo.push(proposal.fromUser);
      }
      taskData.status = "in-progress";
      await taskData.save();

      // Send email and in-app notification to applicant
      if (applicant) {
        await sendMail(
          applicant.email,
          `Your proposal for "${taskData.title}" has been accepted!`,
          Templates.proposalAccepted(applicant, taskData)
        );

        await createNotification(
          applicant._id,
          "proposal",
          `Congratulations! Your proposal for "${taskData.title}" has been accepted.`,
          `/tasks/${taskData._id}`,
          { title: "Proposal Accepted", sendEmail: false }
        );
      }
    } else {
      // Rejected - send email and in-app notification
      if (applicant) {
        await sendMail(
          applicant.email,
          `Update on your proposal for "${taskData.title}"`,
          Templates.proposalRejected(applicant, taskData)
        );

        await createNotification(
          applicant._id,
          "proposal",
          `Your proposal for "${taskData.title}" was not selected. Keep applying to other tasks!`,
          `/browse-tasks`,
          { title: "Proposal Update", sendEmail: false }
        );
      }
    }

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