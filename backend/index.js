// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const SESSION_VERSION = "v2";

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const matchRoutes = require("./routes/matchRoutes");
const messageRoutes = require("./routes/messageRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const reportRoutes = require("./routes/reportRoutes");

const { setSocket } = require("./controllers/messageController");
const messageController = require("./controllers/messageController");
const conversationController = require("./controllers/conversationController");

dotenv.config();

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { msg: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { msg: "Too many login attempts, please try again later" },
});

const app = express();
app.set('trust proxy', 1); // Trust first proxy for rate limiting behind Replit's proxy
const server = http.createServer(app);

// CORS configuration - build allowed origins list
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5000', 'http://localhost:3000'];

// Add Replit production domains
if (process.env.REPLIT_DEV_DOMAIN) {
  allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}
if (process.env.REPLIT_DOMAINS) {
  process.env.REPLIT_DOMAINS.split(',').forEach(d => allowedOrigins.push(`https://${d}`));
}

// Also allow globalhealth.works domain
allowedOrigins.push('https://globalhealth.works');
allowedOrigins.push('https://www.globalhealth.works');

const isProduction = process.env.NODE_ENV === 'production';

// Origin validation function shared by CORS and Socket.IO
const validateOrigin = (origin, callback) => {
  // Allow requests with no origin (mobile apps, curl, Postman, same-origin)
  if (!origin) return callback(null, true);
  
  // Parse the origin to get the hostname for exact matching
  let originHost;
  try {
    const url = new URL(origin);
    originHost = url.host; // e.g., "globalhealth.works" or "localhost:5000"
  } catch (e) {
    // Invalid URL format
    if (isProduction) {
      console.warn(`CORS blocked invalid origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  }
  
  // Check if origin host exactly matches any allowed origin host
  const isAllowed = allowedOrigins.some(allowed => {
    try {
      const allowedUrl = new URL(allowed);
      return originHost === allowedUrl.host;
    } catch (e) {
      // Handle cases where allowed origin is just a hostname
      return originHost === allowed || originHost === allowed.replace(/^https?:\/\//, '');
    }
  });
  
  if (isAllowed) {
    return callback(null, true);
  }
  
  // In development, allow all origins for easier testing
  if (!isProduction) {
    return callback(null, true);
  }
  
  // In production, reject unauthorized origins
  console.warn(`CORS blocked origin: ${origin}`);
  return callback(new Error('Not allowed by CORS'), false);
};

// ✅ Setup Socket.IO with proper CORS
const io = new Server(server, {
  cors: { 
    origin: validateOrigin,
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Inject io to controllers
setSocket(io);
messageController.setSocket(io);
conversationController.setSocket && conversationController.setSocket(io);

app.use(cors({
  origin: validateOrigin,
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for SPA compatibility
  crossOriginEmbedderPolicy: false,
}));

// Compression
app.use(compression());

// General rate limiting for all routes
app.use('/api/', limiter);

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/reports", reportRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve frontend static files in production
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

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

// Health check route
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// Session version endpoint for forced logout on deployment
app.get("/api/auth/session-version", (req, res) => res.json({ version: SESSION_VERSION }));

// Serve frontend for all non-API routes (SPA support)
const fs = require("fs");
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads") || req.path.startsWith("/socket.io")) {
    return next();
  }
  const indexPath = path.join(frontendDist, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send("GlobalHealth.Works API + Socket.IO running");
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ 
    msg: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => console.log(`Server + Socket.IO running on port ${PORT}`));
