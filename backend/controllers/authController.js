// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { sendMail, Templates } = require("../utils/mailer");
const createNotification = require("../utils/createNotification");

// Register
exports.register = async (req, res) => {
  try {
    const {
      title,
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      countryCode,
      organisationName,
      organisationType,
      country,
      gender,
      genderSelfDescribe,
      expertise,
      focusAreas,
      affiliation,
      bio,
      professionalLink,
      supportNeeded,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        msg: "First name, last name, email, password, and role are required",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      title,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      country,
      countryCode,
      gender,
      genderSelfDescribe,
      profileImage: "/uploads/default.jpg",
      isApproved: false, // Wait for admin approval
    });

    if (role === "taskOwner") {
      user.phone = phone;
      user.organisationName = organisationName;
      user.organisationType = organisationType;
      user.supportNeeded = supportNeeded || [];
    }

    if (role === "solutionProvider") {
      user.affiliation = affiliation || [];
      user.expertise = expertise || [];
      user.focusAreas = focusAreas || [];
      user.bio = bio;
      user.professionalLink = professionalLink;
    }

    await user.save();
    // Notify admin of new registration
    await sendMail(
      user.email,
      "Welcome to GlobalHealth.Works",
      Templates.welcomePending(user)
    );

    // Get all active admins
const admins = await User.find({ role: "admin", isActive: true }).select("email _id firstName lastName");

// Build admin recipient list (ensure fallbacks from env)
const fallbackAdminEmails = process.env.ADMIN_NOTIFICATION_EMAILS 
  ? process.env.ADMIN_NOTIFICATION_EMAILS.split(',').map(e => e.trim())
  : [];
const adminEmails = [
  ...admins.map((a) => a.email),
  ...fallbackAdminEmails,
];

// Send alert email to all admins
await Promise.all(
  adminEmails.map((email) =>
    sendMail(
      email,
      "New User Registration Pending Approval",
      Templates.newUserAdminAlert(user)
    )
  )
);

// Create in-app notifications for all admins
const roleDisplay = role === "solutionProvider" ? "Solution Provider" : "Task Owner";
await Promise.all(
  admins.map((admin) =>
    createNotification(
      admin._id,
      "system",
      `New ${roleDisplay} registration: ${user.firstName} ${user.lastName} (${user.email}) requires your approval.`,
      `/admin/users/${user._id}`,
      {
        title: "New User Registration",
        sendEmail: false,
      }
    )
  )
);



    // Optional: send admin notification email here later with ZohoMail
    console.log(`New ${role} registration pending approval: ${email}`);

    // Generate **temporary token for CV upload** (short expiry)
    let tempToken = null;
    if (role === "solutionProvider") {
      tempToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5m" });
    }

    // Send response to frontend
    res.status(201).json({
      msg: "Registration successful. Your account is pending admin approval.",
      tempToken,
      user: {
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


// ✅ Upload CV
exports.uploadCV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const user = await User.findById(req.user.id);
    if (user.cvFile && fs.existsSync(path.join(__dirname, "..", user.cvFile))) {
      fs.unlinkSync(path.join(__dirname, "..", user.cvFile));
    }

    const fileUrl = `/uploads/cv/${req.file.filename}`;
    user.cvFile = fileUrl;
    await user.save();

    res.json({ msg: "CV uploaded successfully", url: fileUrl });
  } catch (err) {
    console.error("UploadCV error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Upload CV without token
exports.uploadCVPublic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    // Optionally link CV to a pending user email
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ msg: "Email is required to link CV" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // If user does not exist yet, just save CV with temp name or store separately
      return res.status(200).json({
        msg: "CV uploaded successfully. Link it after registration.",
        url: `/uploads/cv/${req.file.filename}`,
      });
    }

    // If user exists (maybe registered already), attach CV
    if (user.cvFile && fs.existsSync(path.join(__dirname, "..", user.cvFile))) {
      fs.unlinkSync(path.join(__dirname, "..", user.cvFile));
    }

    const fileUrl = `/uploads/cv/${req.file.filename}`;
    user.cvFile = fileUrl;
    await user.save();

    res.json({ msg: "CV uploaded successfully", url: fileUrl });
  } catch (err) {
    console.error("UploadCVPublic error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


// Login
exports.login = async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.isApproved) {
      // Track pending approval login attempts and send reminder emails (max 2)
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Initialize pendingApprovalAttempts if not present
      if (!user.pendingApprovalAttempts) {
        user.pendingApprovalAttempts = { count: 0, emailsSent: 0, lastAttempt: null };
      }

      // Reset counter if last attempt was more than 24 hours ago
      if (user.pendingApprovalAttempts.lastAttempt && 
          new Date(user.pendingApprovalAttempts.lastAttempt) < twentyFourHoursAgo) {
        user.pendingApprovalAttempts.count = 0;
        user.pendingApprovalAttempts.emailsSent = 0;
      }

      // Increment attempt count and update last attempt time
      user.pendingApprovalAttempts.count += 1;
      user.pendingApprovalAttempts.lastAttempt = now;

      // Send reminder emails if we haven't sent 2 yet within 24 hours
      if (user.pendingApprovalAttempts.emailsSent < 2) {
        const attemptNumber = user.pendingApprovalAttempts.emailsSent + 1;
        
        try {
          // Send reminder to user
          await sendMail(
            user.email,
            "Account Approval Reminder",
            Templates.pendingApprovalReminderUser(user, attemptNumber)
          );

          // Send reminder to all admins
          const admins = await User.find({ role: "admin", isActive: true }).select("email");
          const fallbackAdminEmails = process.env.ADMIN_NOTIFICATION_EMAILS 
            ? process.env.ADMIN_NOTIFICATION_EMAILS.split(',').map(e => e.trim())
            : [];
          const adminEmails = [
            ...admins.map((a) => a.email),
            ...fallbackAdminEmails,
          ];
          
          await Promise.all(
            adminEmails.map((adminEmail) =>
              sendMail(
                adminEmail,
                `User Awaiting Approval: ${user.firstName} ${user.lastName}`,
                Templates.pendingApprovalReminderAdmin(user, attemptNumber)
              )
            )
          );

          user.pendingApprovalAttempts.emailsSent += 1;
          console.log(`Sent pending approval reminder #${attemptNumber} for user ${user.email}`);
        } catch (emailErr) {
          console.warn("Failed to send pending approval reminder:", emailErr);
        }
      }

      await user.save();

      return res.status(403).json({
        msg: "To maintain the integrity of our network and ensure the security of all memebers, our team manually reviews every new account. Your application is currently in the queue and will be finalized shortly. We appreciate your patience in helping us keep Global Health Works as a trusted space.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        msg: "Your account has been suspended. Please contact support for assistance.",
      });
    }

    // Device tracking for new device login notification
    const userAgent = req.headers['user-agent'] || '';
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown';
    const currentDevice = {
      browser: extractBrowser(userAgent),
      device: extractDevice(userAgent),
      ip: clientIp.split(',')[0].trim(),
      deviceId: deviceInfo?.deviceId || generateDeviceId(userAgent, clientIp)
    };

    // Check if this is a new device
    const isNewDevice = !user.knownDevices?.some(d => d.deviceId === currentDevice.deviceId);

    if (isNewDevice && user.knownDevices?.length > 0) {
      try {
        await sendMail(
          user.email,
          "New Login Detected",
          Templates.newDeviceLogin(user, currentDevice)
        );
        await createNotification(
          user._id,
          "system",
          `New login detected from ${currentDevice.browser} on ${currentDevice.device}. If this wasn't you, please secure your account.`,
          "/settings",
          { title: "New Login Alert", sendEmail: false }
        );
      } catch (emailErr) {
        console.warn("New device email failed:", emailErr);
      }
    }

    // Add or update device in known devices
    if (isNewDevice) {
      if (!user.knownDevices) user.knownDevices = [];
      user.knownDevices.push({
        ...currentDevice,
        lastUsed: new Date(),
        addedAt: new Date()
      });
    } else if (user.knownDevices) {
      const deviceIndex = user.knownDevices.findIndex(d => d.deviceId === currentDevice.deviceId);
      if (deviceIndex >= 0) {
        user.knownDevices[deviceIndex].lastUsed = new Date();
        user.knownDevices[deviceIndex].ip = currentDevice.ip;
      }
    }

    const tokenPayload = {
      id: user._id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      adminType: user.adminType || null
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const isFirstLogin = user.isFirstLogin === true;

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        title: user.title,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.title ? user.title + " " : ""}${user.firstName} ${user.lastName}`,
        role: user.role,
        adminType: user.adminType || null,
        email: user.email,
        profileImage: user.profileImage,
        isFirstLogin,
        onboardingCompleted: user.onboardingCompleted || false,
        onboardingSkipped: user.onboardingSkipped || false,
      },
    });

    // Reset isFirstLogin AFTER responding (so client gets the true value)
    if (isFirstLogin) {
      user.isFirstLogin = false;
      await user.save();
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Helper functions for device detection
function extractBrowser(userAgent) {
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Microsoft Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown Browser';
}

function extractDevice(userAgent) {
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android Device';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Mac')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux';
  return 'Unknown Device';
}

function generateDeviceId(userAgent, ip) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(userAgent + ip).digest('hex').substring(0, 16);
}

// Middleware
exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

exports.requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ msg: "Access denied" });
    }
    next();
  };
};

// GET /me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// PUT /me
exports.updateMe = async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      "title",
      "firstName",
      "lastName",
      "country",
      "countryCode",
      "gender",
      "genderSelfDescribe",
      "bio",
      "professionalLink",
      "organisationName",
      "organisationType",
      "phone",
      "supportNeeded",
      "affiliation",
      "expertise",
      "focusAreas",
      "profileImage",
      "cvFile",
      "onboardingCompleted",
      "onboardingSkipped",
    ];

    const filtered = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) filtered[key] = updates[key];
    });

    const user = await User.findByIdAndUpdate(req.user.id, filtered, {
      new: true,
    }).select("-password");

    res.json(user);
  } catch (err) {
    console.error("UpdateMe error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const user = await User.findById(req.user.id);

    if (user.profileImage && user.profileImage !== "/uploads/default.jpg") {
      const oldPath = path.join(__dirname, "..", user.profileImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    user.profileImage = fileUrl;
    await user.save();

    res.json({ msg: "Profile image updated", url: fileUrl, user });
  } catch (err) {
    console.error("UploadAvatar error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Reset avatar
exports.resetAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.profileImage && user.profileImage !== "/uploads/default.jpg") {
      const oldPath = path.join(__dirname, "..", user.profileImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.profileImage = "/uploads/default.jpg";
    await user.save();

    res.json({ msg: "Avatar reset to default", profileImage: user.profileImage });
  } catch (err) {
    console.error("ResetAvatar error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Public profile
exports.getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // find user and include approvedBy basic info
    const user = await User.findById(id)
      .select("-password -oauthProvider -lastLogin")
      .populate("approvedBy", "firstName lastName email");

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Check requester - allow admins to see everything
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let requester = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const jwt = require("jsonwebtoken");
        requester = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        requester = null; // invalid token -> treat as public viewer
      }
    }

    const isAdmin = requester && requester.role === "admin";
    const isSuperAdmin = requester && requester.adminType === "superAdmin";

    // Restrict admins from viewing their own profile (except super admins)
    if (isAdmin && !isSuperAdmin && requester.id === id) {
      return res.status(403).json({ msg: "Admins cannot view their own profile. Contact a super admin if needed." });
    }

    // If not admin, only allow when approved and not suspended
    if (!isAdmin) {
      if (!user.isApproved) {
        return res.status(403).json({ msg: "Profile not available" });
      }
      if (user.status === "suspended") {
        return res.status(403).json({ msg: "Profile not available" });
      }
    }

    // send safe public profile fields
    const publicProfile = {
      id: user._id,
      title: user.title,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.title ? user.title + " " : ""}${user.firstName} ${user.lastName}`,
      role: user.role,
      adminType: user.adminType || null,
      country: user.country,
      countryCode: user.countryCode,
      profileImage: user.profileImage,
      bio: user.bio,
      expertise: user.expertise || [],
      focusAreas: user.focusAreas || [],
      affiliation: user.affiliation || [],
      links: user.links || [],
      recentTasks: user.recentTasks || [],
      isApproved: user.isApproved,
      status: user.status || "active",
      rejectionReason: user.rejectionReason || null,
      approvedBy: user.approvedBy || null,
      createdAt: user.createdAt,
      gender: isAdmin ? user.gender : undefined,
      phone: isAdmin ? user.phone : undefined,
      email: isAdmin ? user.email : undefined,
      organisationName: user.organisationName,
      organisationType: user.organisationType,
      professionalLink: user.professionalLink,
      cvFile: isAdmin ? user.cvFile : undefined,
    };

    res.json(publicProfile);
  } catch (err) {
    console.error("GetPublicProfile error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
