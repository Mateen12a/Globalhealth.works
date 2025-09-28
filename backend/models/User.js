// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Shared fields
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // only if not using OAuth
    role: {
      type: String,
      enum: ["solutionProvider", "taskOwner", "admin"],
      required: true,
    },
    country: { type: String },
    gender: { type: String },
    profileImage: { type: String }, // avatar or uploaded image
    oauthProvider: { type: String }, // "google", "linkedin", or "local"
    lastLogin: { type: Date },

    // Solution Provider-specific
    affiliation: [{ type: String }], // e.g., NGO, Research, Gov
    expertise: [{ type: String }], // "Digital Solutions", "Policy", etc.
    focusAreas: [{ type: String }], // health taxonomy
    availableForWork: { type: Boolean, default: true },
    portfolio: { type: String }, // CV link / portfolio
    bio: { type: String, maxlength: 1000 },
    links: [{ type: String }], // Optional links (LinkedIn, GitHub, etc.)

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
