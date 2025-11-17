const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Shared fields
    title: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["solutionProvider", "taskOwner", "admin"],
      required: true,
    },
    country: { type: String },
    countryCode: { type: String },
    gender: { type: String },
    genderSelfDescribe: { type: String },
    profileImage: { type: String, default: "/uploads/default.jpg" },
    oauthProvider: { type: String },
    lastLogin: { type: Date },

    // Solution Provider-specific
    affiliation: [{ type: String }],
    expertise: [{ type: String }],
    focusAreas: [{ type: String }],
    availableForWork: { type: Boolean, default: true },
    professionalLink: { type: String },
    bio: { type: String, maxlength: 1000 },
    cvFile: { type: String },

    // Task Owner-specific
    phone: { type: String },
    organisationName: { type: String },
    organisationType: { type: String },
    supportNeeded: [{ type: String }],
    postedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    status: { type: String, default: "active" },

    // Admin / system-specific
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },

    // ✅ New approval fields
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
