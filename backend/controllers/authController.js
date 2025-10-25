// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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
      countryCode, // ✅ New
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
      countryCode, // ✅ New
      gender,
      genderSelfDescribe,
      profileImage: "/uploads/default.jpg",
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

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      msg: "User registered successfully",
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


// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
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
    console.log("No or invalid auth header:", authHeader);
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
    const user = await User.findById(id).select(
      "-password -email -isActive -isVerified -lastLogin -oauthProvider"
    );

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("GetPublicProfile error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
