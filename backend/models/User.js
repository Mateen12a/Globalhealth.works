// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Shared fields
    title: { type: String }, // Dr., Mr., Ms. etc.
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // only if not using OAuth
    role: {
      type: String,
      enum: ["solutionProvider", "taskOwner", "admin"],
      required: true,
    },
    country: { type: String },
    gender: { type: String },
    genderSelfDescribe: { type: String },
    profileImage: { type: String, default: "/uploads/default.jpg" },
    oauthProvider: { type: String }, // "google", "linkedin", or "local"
    lastLogin: { type: Date },

    // Solution Provider-specific
    affiliation: [{ type: String }], // e.g., NGO, Research, Gov
    expertise: [{ type: String }], // "Digital Solutions", "Policy", etc.
    focusAreas: [{ type: String }], // health taxonomy
    availableForWork: { type: Boolean, default: true },
    professionalLink: { type: String }, // LinkedIn, CV, portfolio
    bio: { type: String, maxlength: 1000 },

    // Task Owner-specific
    phone: { type: String },
    organisationName: { type: String },
    organisationType: { type: String },
    supportNeeded: [{ type: String }], // expertise they want
    postedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    status: { type: String, default: "active" },

    // Admin / system-specific
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false }, // for future email verification
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
