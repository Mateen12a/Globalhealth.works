// controllers/taskController.js
const Task = require("../models/Task");
const createNotification = require("../utils/createNotification");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ✅ Multer setup for task attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/tasks/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Allow both attachments and removeAttachments field
exports.uploadTaskAttachments = upload.fields([
  { name: "attachments", maxCount: 5 },
  { name: "removeAttachments" }, // 👈 ensures removeAttachments passes through
]);

// ✅ Create new task (Task Owner only)
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
      languages,
      fundingStatus,
    } = req.body;

    // Handle uploaded files
    const attachments = req.files && req.files.attachments
      ? req.files.attachments.map((f) => `/uploads/tasks/${f.filename}`)
      : [];


    const newTask = new Task({
      title,
      summary,
      description,
      requiredSkills: requiredSkills ? requiredSkills.split(",").map((s) => s.trim()) : [],
      focusAreas: focusAreas ? focusAreas.split(",").map((f) => f.trim()) : [],
      location,
      duration,
      startDate,
      languages: languages ? languages.split(",").map((l) => l.trim()) : [],
      fundingStatus,
      attachments,
      owner: req.user.id,
    });

    await newTask.save();
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
    if (String(task.owner) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not allowed" });
    }
    // 🟢 Defensive log (debug)
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    // 🔹 Update basic fields (Multer parses them into req.body as strings)
    if (req.body.title) task.title = req.body.title;
    if (req.body.summary) task.summary = req.body.summary;
    if (req.body.description) task.description = req.body.description;

    if (req.body.requiredSkills) {
      try {
        task.requiredSkills = JSON.parse(req.body.requiredSkills);
      } catch {
        task.requiredSkills = req.body.requiredSkills.split(",").map((s) => s.trim());
      }
    }

    if (req.body.focusAreas) {
      try {
        task.focusAreas = JSON.parse(req.body.focusAreas);
      } catch {
        task.focusAreas = req.body.focusAreas.split(",").map((s) => s.trim());
      }
    }

    if (req.body.languages) {
      try {
        task.languages = JSON.parse(req.body.languages);
      } catch {
        task.languages = req.body.languages.split(",").map((l) => l.trim());
      }
    }

    if (req.body.fundingStatus) task.fundingStatus = req.body.fundingStatus;

    // 🔹 Handle new attachments
    if (req.files && req.files.attachments) {
      const newFiles = req.files.attachments.map(
        (file) => `/uploads/tasks/${file.filename}`
      );
      task.attachments = [...task.attachments, ...newFiles];
    }

    // 🔹 Handle removed attachments
    if (req.body.removeAttachments) {
      let toRemove = req.body.removeAttachments;

      // Multer gives a string if one, array if many
      if (!Array.isArray(toRemove)) {
        toRemove = [toRemove];
      }

      for (const fileUrl of toRemove) {
        // Remove from DB
        task.attachments = task.attachments.filter((a) => a !== fileUrl);

        // Remove from filesystem
        const filePath = path.join(__dirname, "..", fileUrl.replace(/^\//, ""));
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Failed to delete file:", filePath, err.message);
          } else {
            console.log("Deleted file:", filePath);
          }
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

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "taskOwner") {
      filter.owner = req.user.id;
    }
    // Admin sees all
    const tasks = await Task.find(filter).populate("owner", "name email role");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};



// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("owner", "name email")
      .populate("applicants", "name email expertise");
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Apply to task (Solution Provider)
exports.applyToTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("owner");
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.applicants.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already applied" });
    }

    task.applicants.push(req.user.id);
    await task.save();

    // Notify Task Owner
    await createNotification(
      task.owner._id,
      "application",
      `${req.user.name} applied to your task "${task.title}"`,
      `/tasks/${task._id}`
    );

    res.json({ msg: "Applied successfully", task });
  } catch (err) {
    console.error("Apply error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Accept applicant (Task Owner)
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

    // Notify SP
    await createNotification(
      spId,
      "proposal",
      `You were accepted for task "${task.title}" 🎉`,
      `/tasks/${task._id}`
    );

    res.json({ msg: "Applicant accepted", task });
  } catch (err) {
    console.error("Accept error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Reject applicant (Task Owner)
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

    // Notify SP
    await createNotification(
      spId,
      "proposal",
      `Your application for task "${task.title}" was rejected.`,
      `/tasks/${task._id}`
    );

    res.json({ msg: "Applicant rejected", task });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update status (Task Owner)
exports.updateStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (String(task.owner) !== req.user.id) {
      return res.status(403).json({ msg: "Not your task" });
    }

    task.status = req.body.status;
    await task.save();

    // Notify all applicants of status change
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
    console.error("Status update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get tasks the logged-in SP applied to
exports.getMyApplications = async (req, res) => {
  try {
    const tasks = await Task.find({ applicants: req.user.id })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Get my applications error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
