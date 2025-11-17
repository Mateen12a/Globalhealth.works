// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { sendMail, Templates } = require("../utils/mailer");

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
const admins = await User.find({ role: "admin", isActive: true }).select("email");

// Build admin recipient list (ensure fallbacks)
const adminEmails = [
  ...admins.map((a) => a.email),
  "admin@globalhealth.works",
  "ajidagbamateen12@gmail.com",
];

// Send alert to all admins
await Promise.all(
  adminEmails.map((email) =>
    sendMail(
      email,
      "New User Registration Pending Approval",
      Templates.newUserAdminAlert(user)
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
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.isApproved) {
      return res.status(403).json({
        msg: "Your account is awaiting admin approval. You’ll be notified once approved.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

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
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

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
      "countryCode", // ✅ Added
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
      "cvFile", // ✅ Added
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
      country: user.country,
      profileImage: user.profileImage,
      bio: user.bio,
      expertise: user.expertise || [],
      focusAreas: user.focusAreas || [],
      links: user.links || [],
      recentTasks: user.recentTasks || [],
      isApproved: user.isApproved,
      status: user.status || "active",
      rejectionReason: user.rejectionReason || null,
      approvedBy: user.approvedBy || null,
      // do NOT include email unless isAdmin
      email: isAdmin ? user.email : undefined,
    };

    res.json(publicProfile);
  } catch (err) {
    console.error("GetPublicProfile error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
