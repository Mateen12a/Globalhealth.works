// utils/createNotification.js
const Notification = require("../models/Notification");

async function createNotification(userId, type, message, link = null) {
  try {
    const notif = new Notification({
      user: userId,
      type,
      message,
      link,
    });
    await notif.save();
    return notif;
  } catch (err) {
    console.error("Notification creation error:", err);
  }
}

module.exports = createNotification;
