const Task = require("../models/Task");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { sendMail, Templates } = require("../utils/mailer");

// === Multer setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/tasks/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

exports.uploadTaskAttachments = upload.fields([
  { name: "attachments", maxCount: 5 },
  { name: "removeAttachments" },
]);

// ✅ Create task
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      summary,
      description,
      requiredSkills,
      focusAreas,
      location,
      duration,
      startDate,
    } = req.body;

    const attachments =
      req.files?.attachments?.map((f) => `/uploads/tasks/${f.filename}`) || [];

    const newTask = new Task({
      title,
      summary,
      description,
      requiredSkills: requiredSkills
        ? requiredSkills.split(",").map((s) => s.trim())
        : [],
      focusAreas: focusAreas
        ? focusAreas.split(",").map((f) => f.trim())
        : [],
      location,
      duration,
      startDate,
      attachments,
      owner: req.user.id,
    });

    await newTask.save();

    // Fetch owner data
    const owner = await User.findById(req.user.id);

    // Send task creation confirmation email to the user
    const userHtml = Templates.taskCreatedUserNotice(owner, newTask);
    await sendMail(owner.email, "Your Task Has Been Created", userHtml);

    // Notify all admins (email + in-app)
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      const html = Templates.newTaskAdminAlert(newTask, owner);
      await sendMail(admin.email, "New Task Submitted", html);
      
      await createNotification(
        admin._id,
        "task",
        `New task "${newTask.title}" posted by ${owner.firstName} ${owner.lastName}`,
        `/dashboard/admin/tasks`,
        { title: "New Task Posted", sendEmail: false }
      );
    }

    res.status(201).json(newTask);
  } catch (err) {
    console.error("Task creation error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    // Authorization
    if (String(task.owner) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not allowed" });
    }

    // === Basic fields ===
    const updatableFields = [
      "title",
      "summary",
      "description",
      "location",
      "duration",
      "startDate",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field]) task[field] = req.body[field];
    });

    // === Array fields ===
    const parseArray = (value) => {
      try {
        return Array.isArray(value)
          ? value
          : JSON.parse(value);
      } catch {
        return value
          ? value.split(",").map((v) => v.trim())
          : [];
      }
    };

    if (req.body.requiredSkills) {
      task.requiredSkills = parseArray(req.body.requiredSkills);
    }
    if (req.body.focusAreas) {
      task.focusAreas = parseArray(req.body.focusAreas);
    }

    // === Handle attachments ===
    if (req.files && req.files.attachments) {
      const newFiles = req.files.attachments.map(
        (file) => `/uploads/tasks/${file.filename}`
      );
      task.attachments = [...task.attachments, ...newFiles];
    }

    if (req.body.removeAttachments) {
      let toRemove = req.body.removeAttachments;
      if (!Array.isArray(toRemove)) toRemove = [toRemove];

      for (const fileUrl of toRemove) {
        task.attachments = task.attachments.filter((a) => a !== fileUrl);

        const filePath = path.join(__dirname, "..", fileUrl.replace(/^\//, ""));
        fs.unlink(filePath, (err) => {
          if (err) console.error("File delete error:", err.message);
        });
      }
    }

    // Mark task as edited
    task.isEdited = true;

    await task.save();
    res.json(task);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Get tasks
exports.getTasks = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "taskOwner") {
      filter = { owner: req.user.id };
    } else if (req.user.role === "solutionProvider") {
      // Solution providers should only see published and in-progress tasks (not withdrawn)
      filter = { status: { $in: ["published", "in-progress"] } };
    }
    const tasks = await Task.find(filter)
      .populate("owner", "firstName lastName email role");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("owner", "firstName lastName email profileImage role")
      .populate("applicants", "firstName lastName email expertise");
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Apply to task
exports.applyToTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("owner");
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.applicants.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already applied" });
    }

    task.applicants.push(req.user.id);
    await task.save();

    await createNotification(
      task.owner._id,
      "application",
      `${req.user.firstName} ${req.user.lastName} applied to your task "${task.title}"`,
      `/tasks/${task._id}`
    );

    res.json({ msg: "Applied successfully", task });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Accept applicant
exports.acceptApplicant = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (String(task.owner) !== req.user.id) {
      return res.status(403).json({ msg: "Not your task" });
    }

    const spId = req.params.spId;
    if (!task.applicants.includes(spId)) {
      return res.status(400).json({ msg: "User did not apply" });
    }

    task.accepted = spId;
    await task.save();

    await createNotification(
      spId,
      "proposal",
      `You were accepted for task "${task.title}" 🎉`,
      `/tasks/${task._id}`
    );

    res.json({ msg: "Applicant accepted", task });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Reject applicant
exports.rejectApplicant = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (String(task.owner) !== req.user.id) {
      return res.status(403).json({ msg: "Not your task" });
    }

    const spId = req.params.spId;
    if (!task.applicants.includes(spId)) {
      return res.status(400).json({ msg: "User did not apply" });
    }

    task.applicants = task.applicants.filter((id) => String(id) !== spId);
    await task.save();

    await createNotification(
      spId,
      "proposal",
      `Your application for task "${task.title}" was rejected.`,
      `/tasks/${task._id}`
    );

    res.json({ msg: "Applicant rejected", task });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Update status
exports.updateStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (String(task.owner) !== req.user.id) {
      return res.status(403).json({ msg: "Not your task" });
    }

    task.status = req.body.status;
    await task.save();

    for (const spId of task.applicants) {
      await createNotification(
        spId,
        "system",
        `Task "${task.title}" status changed to ${req.body.status}.`,
        `/tasks/${task._id}`
      );
    }

    res.json({ msg: "Status updated", task });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get my applications
exports.getMyApplications = async (req, res) => {
  try {
    const Proposal = require('../models/Proposal');
    
    // Find all proposals by this user
    const proposals = await Proposal.find({ fromUser: req.user.id })
      .populate({
        path: 'task',
        populate: { path: 'owner', select: 'firstName lastName email profileImage' }
      })
      .sort({ createdAt: -1 });
    
    // Transform to include proposal info with task
    const applications = proposals
      .filter(p => p.task) // Filter out proposals for deleted tasks
      .map(p => ({
        _id: p.task._id,
        title: p.task.title,
        summary: p.task.summary,
        status: p.task.status,
        owner: p.task.owner,
        createdAt: p.task.createdAt,
        proposal: {
          _id: p._id,
          status: p.status,
          message: p.message,
          proposedBudget: p.proposedBudget,
          proposedDuration: p.proposedDuration,
          createdAt: p.createdAt
        }
      }));
    
    res.json(applications);
  } catch (err) {
    console.error("getMyApplications error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Report a task
exports.reportTask = async (req, res) => {
  try {
    const { reason, details } = req.body;
    
    if (!reason) {
      return res.status(400).json({ msg: "Report reason is required" });
    }
    
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });
    
    // Check if user already reported
    const alreadyReported = task.reports.some(
      r => r.reportedBy.toString() === req.user.id
    );
    if (alreadyReported) {
      return res.status(400).json({ msg: "You have already reported this task" });
    }
    
    task.reports.push({
      reportedBy: req.user.id,
      reason,
      details: details || ""
    });
    task.isReported = true;
    await task.save();
    
    // Notify admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        "system",
        `Task "${task.title}" has been reported for: ${reason}`,
        `/dashboard/admin/tasks`,
        { title: "Task Reported", sendEmail: true }
      );
    }
    
    res.json({ msg: "Task reported successfully" });
  } catch (err) {
    console.error("Report task error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Mark task as complete (both owner and provider must mark)
exports.markComplete = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("owner", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email");
    
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.status !== "in-progress") {
      return res.status(400).json({ msg: "Task must be in-progress to mark complete" });
    }

    const hasAssignedProvider = (task.assignedTo && task.assignedTo.length > 0) || task.accepted;
    if (!hasAssignedProvider) {
      return res.status(400).json({ msg: "No solution provider is assigned to this task yet" });
    }

    const userId = req.user.id;
    const isOwner = String(task.owner._id) === userId;
    const isAssignedProvider = task.assignedTo.some(sp => String(sp._id) === userId) || String(task.accepted) === userId;

    if (!isOwner && !isAssignedProvider) {
      return res.status(403).json({ msg: "Only task owner or assigned solution provider can mark as complete" });
    }

    // Set the appropriate completion timestamp
    if (isOwner) {
      if (task.ownerCompletedAt) {
        return res.status(400).json({ msg: "You have already marked this task as complete" });
      }
      task.ownerCompletedAt = new Date();
    } else if (isAssignedProvider) {
      if (task.providerCompletedAt) {
        return res.status(400).json({ msg: "You have already marked this task as complete" });
      }
      task.providerCompletedAt = new Date();
    }

    // Check if both have marked complete
    if (task.ownerCompletedAt && task.providerCompletedAt) {
      task.status = "completed";
      
      // Notify both parties that task is fully completed
      await createNotification(
        task.owner._id,
        "task",
        `Task "${task.title}" has been marked as completed by both parties! 🎉`,
        `/tasks/${task._id}`,
        { title: "Task Completed", sendEmail: true }
      );
      
      for (const provider of task.assignedTo) {
        await createNotification(
          provider._id,
          "task",
          `Task "${task.title}" has been marked as completed by both parties! 🎉`,
          `/tasks/${task._id}`,
          { title: "Task Completed", sendEmail: true }
        );
      }
    } else {
      // Notify the other party that one side has marked complete
      if (isOwner) {
        for (const provider of task.assignedTo) {
          await createNotification(
            provider._id,
            "task",
            `Task owner has marked "${task.title}" as complete. Please confirm completion.`,
            `/tasks/${task._id}`,
            { title: "Awaiting Your Confirmation", sendEmail: true }
          );
        }
      } else {
        await createNotification(
          task.owner._id,
          "task",
          `Solution provider has marked "${task.title}" as complete. Please confirm completion.`,
          `/tasks/${task._id}`,
          { title: "Awaiting Your Confirmation", sendEmail: true }
        );
      }
    }

    await task.save();
    res.json({ msg: "Task marked as complete", task });
  } catch (err) {
    console.error("Mark complete error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Withdraw task (owner only)
exports.withdrawTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "firstName lastName email");
    
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (String(task.owner) !== req.user.id) {
      return res.status(403).json({ msg: "Only task owner can withdraw the task" });
    }

    if (task.status === "withdrawn") {
      return res.status(400).json({ msg: "Task is already withdrawn" });
    }

    if (task.status === "completed") {
      return res.status(400).json({ msg: "Cannot withdraw a completed task" });
    }

    task.status = "withdrawn";
    await task.save();

    // Notify assigned solution providers
    for (const provider of task.assignedTo) {
      await createNotification(
        provider._id,
        "task",
        `Task "${task.title}" has been withdrawn by the owner.`,
        `/tasks/${task._id}`,
        { title: "Task Withdrawn", sendEmail: true }
      );
    }

    // Also notify applicants who haven't been assigned
    for (const applicantId of task.applicants) {
      const isAssigned = task.assignedTo.some(sp => String(sp._id) === String(applicantId));
      if (!isAssigned) {
        await createNotification(
          applicantId,
          "task",
          `Task "${task.title}" has been withdrawn by the owner.`,
          `/tasks/${task._id}`,
          { title: "Task Withdrawn", sendEmail: false }
        );
      }
    }

    res.json({ msg: "Task withdrawn successfully", task });
  } catch (err) {
    console.error("Withdraw task error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
