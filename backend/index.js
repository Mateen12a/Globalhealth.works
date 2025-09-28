// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http"); // ✅ needed for Socket.io
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const matchRoutes = require("./routes/matchRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { setSocket } = require("./controllers/messageController"); // ✅ inject io
const messageController = require("./controllers/messageController");
const conversationController = require("./controllers/conversationController");
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ create HTTP server for Socket.io

// ✅ setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5174", // your React dev server
    methods: ["GET", "POST"],
  },
});

// ✅ pass io to controller so it can emit from API
setSocket(io);



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
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/conversations", require("./routes/conversationRoutes"));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ✅ Socket.io logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user-specific room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
// inject socket instance
messageController.setSocket(io);
conversationController.setSocket && conversationController.setSocket(io);
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Routes placeholder
app.get("/", (req, res) => res.send("GlobalHealth.Works API running 🚀"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server + Socket.io running on port ${PORT}`));
