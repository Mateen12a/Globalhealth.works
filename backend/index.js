// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const matchRoutes = require("./routes/matchRoutes");
const messageRoutes = require("./routes/messageRoutes");
const conversationRoutes = require("./routes/conversationRoutes");

const { setSocket } = require("./controllers/messageController");
const messageController = require("./controllers/messageController");
const conversationController = require("./controllers/conversationController");

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Inject io to controllers
setSocket(io);
messageController.setSocket(io);
conversationController.setSocket && conversationController.setSocket(io);

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== SOCKET.IO EVENTS ====================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user-specific room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  // Join conversation room
  socket.on("joinConversation", (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`User joined conversation room: conversation:${conversationId}`);
  });

  // Typing indicators
  socket.on("typing", ({ conversationId, from, name }) => {
    socket.to(`conversation:${conversationId}`).emit("typing", { conversationId, from, name });
  });

  socket.on("stopTyping", ({ conversationId, from }) => {
    socket.to(`conversation:${conversationId}`).emit("stopTyping", { conversationId, from });
  });

  // New message
  socket.on("message:new", async (msg) => {
    try {
      const { conversationId, text, attachments, replyTo, senderId } = msg;
      const newMessage = await messageController.createMessageSocket({
        conversationId,
        senderId,
        text,
        attachments,
        replyTo,
      });

      // Emit to all in conversation
      io.to(`conversation:${conversationId}`).emit("message:new", newMessage);

      // Emit to participants' personal rooms for Inbox updates
      newMessage.participants?.forEach((user) => {
        io.to(user._id.toString()).emit("inbox:update", newMessage);
      });
    } catch (err) {
      console.error("Error sending new message:", err);
    }
  });

  // Message seen
  socket.on("message:seen", async ({ conversationId, messageId, userId }) => {
    try {
      await messageController.markMessageSeen(messageId, userId);
      io.to(`conversation:${conversationId}`).emit("message:seen", { messageId, userId });
    } catch (err) {
      console.error("Error marking message as seen:", err);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ==================== MONGO ====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Health check routes
app.get("/", (req, res) => res.send("GlobalHealth.Works API + Socket.IO running 🚀"));
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => console.log(`Server + Socket.IO running on port ${PORT}`));
