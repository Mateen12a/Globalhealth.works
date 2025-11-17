const Task = require("../models/Task");
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

    // 🔥 Send task creation confirmation email to the user
    const userHtml = Templates.taskCreatedUserNotice(owner, newTask);
    await sendMail(owner.email, "Your Task Has Been Created", userHtml);

    // 🔥 Notify all admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      const html = Templates.newTaskAdminAlert(newTask, owner);
      await sendMail(admin.email, "New Task Submitted", html);
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
    const filter = req.user.role === "taskOwner" ? { owner: req.user.id } : {};
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

// ✅ Get my applications
exports.getMyApplications = async (req, res) => {
  try {
    const tasks = await Task.find({ applicants: req.user.id })
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
