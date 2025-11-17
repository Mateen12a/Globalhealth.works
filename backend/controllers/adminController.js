// controllers/adminController.js
const User = require("../models/User");
const Task = require("../models/Task");
const Feedback = require("../models/Feedback")
const { sendMail, Templates } = require("../utils/mailer");

// === USERS ===

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").populate("approvedBy", "firstName lastName email");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Approve a user
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.isApproved) return res.status(400).json({ msg: "User already approved" });

    user.isApproved = true;
    user.approvedBy = adminId;
    await user.save();

    await sendMail(user.email, "Your Account Has Been Approved", Templates.userApprovalNotice(user));
    await sendMail(req.user.email, "User Account Approved", Templates.approvalConfirmedAdminNotice(req.user, user));




    // Optional: send email to user (to be added with ZohoMail)
    console.log(`User ${user.email} approved by admin ${adminId}`);

    res.json({ msg: "User approved successfully", user });
  } catch (err) {
    console.error("Approve user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Suspend/Delete user
exports.updateUserStatus = async (req, res) => {
  const { id, action } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (action === "suspend") {
      user.status = "suspended";
      await user.save();
      return res.json({ msg: "User suspended", user });
    }

    if (action === "activate") {
      user.status = "active";
      await user.save();
      return res.json({ msg: "User activated", user });
    }

    return res.status(400).json({ msg: "Invalid action" });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Optionally: also remove tasks by this user
    await Task.deleteMany({ owner: req.params.id });

    res.json({ msg: "User and related tasks deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ msg: "Rejection reason is required" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Save reason to user
    user.rejectionReason = reason;
    user.isApproved = false;
    await user.save();

    // Send emails
    await sendMail(
      user.email,
      "Your Account Could Not Be Approved",
      Templates.rejectionNotice(user, reason)
    );

    await sendMail(
      req.user.email,
      "User Account Rejected",
      Templates.rejectionConfirmedAdminNotice(req.user, user, reason)
    );

    console.log(`User ${user.email} rejected by admin ${adminId}. Reason: ${reason}`);

    res.json({ msg: "User rejected successfully", reason });
  } catch (err) {
    console.error("Reject user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


// === TASKS ===

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("owner", "name email role")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update task status (publish/withdraw)
exports.updateTaskStatus = async (req, res) => {
  const { id, action } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (action === "publish") task.status = "published";
    else if (action === "withdraw") task.status = "withdrawn";
    else return res.status(400).json({ msg: "Invalid action" });

    await task.save();
    res.json({ msg: `Task ${action}ed`, task });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    res.json({ msg: "Task deleted" });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const tasks = await Task.countDocuments();
    const feedback = await Feedback.countDocuments();

    res.json({ users, tasks, feedback });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};