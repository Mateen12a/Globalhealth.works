// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { 
      type: String, 
      enum: ["application", "proposal", "message", "system"], 
      required: true 
    },
    message: { type: String, required: true },
    link: { type: String }, // e.g. "/tasks/123"
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
