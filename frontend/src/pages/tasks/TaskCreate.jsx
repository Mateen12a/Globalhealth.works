// src/pages/TaskCreate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// Dropdown options (from feedback updates)
const expertiseOptions = [
  "Delivery & Implementation",
  "Training, Capacity Building & Learning",
  "Data & Evaluation",
  "Digital & Technology Solutions",
  "Program Management & Operations",
  "Communications & Engagement",
  "Policy & Strategy",
];

const focusAreas = [
  "Maternal & Child Health",
  "Infectious Diseases",
  "Non-Communicable Diseases",
  "Mental Health",
  "Health Systems & Policy",
  "Environmental Health",
  "Community Health",
  "Global Health Security",
];

export default function TaskCreate() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    description: "",
    requiredSkills: "",
    focusAreas: "",
    duration: "",
    startDate: "",
  });

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  const Label = ({ text, required }) => (
    <label className="block font-semibold text-gray-800 mb-1">
      {text}{" "}
      {required ? (
        <span className="text-red-500">*</span>
      ) : (
        <span className="text-gray-400 text-sm">(optional)</span>
      )}
    </label>
  );

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => setAttachments(e.target.files);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      for (const key in formData) payload.append(key, formData[key]);
      for (let i = 0; i < attachments.length; i++) {
        payload.append("attachments", attachments[i]);
      }

      const res = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Task created successfully!");
        navigate("/dashboard/to");
      } else {
        alert(data.msg || "Task creation failed");
      }
    } catch (err) {
      console.error("Task creation error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9FAFB] to-[#EEF2F7] py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-2xl space-y-6"
        encType="multipart/form-data"
      >
        {/* Back button */}
        <div className="flex items-center mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-[#1E376E] transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
        </div>

        <h2 className="text-3xl font-bold text-[#1E376E] mb-2">
          Create New Task
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Provide clear and detailed information to help solution providers
          understand your task and contribute effectively.
        </p>

        {/* Title */}
        <div>
          <Label text="Task Title" required />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9] outline-none"
            placeholder="e.g. Strengthening community health systems"
            required
          />
        </div>

        {/* Summary */}
        <div>
          <Label text="Short Summary" required />
          <input
            type="text"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9]"
            placeholder="Brief overview of the task"
            required
          />
        </div>

        {/* Description */}
        <div>
          <Label text="Detailed Description" required />
          <textarea
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9]"
            placeholder="Provide full details of your task including objectives, expected outcomes, and context"
            required
          />
        </div>

        {/* Expertise / Support Needed */}
        <div>
          <Label text="Support Needed / Expertise" required />
          <select
            name="requiredSkills"
            value={formData.requiredSkills}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9]"
            required
          >
            <option value="">Select area of expertise</option>
            {expertiseOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Focus Area */}
        <div>
          <Label text="Area of Interest" required />
          <select
            name="focusAreas"
            value={formData.focusAreas}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9]"
            required
          >
            <option value="">Select area of interest</option>
            {focusAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <Label text="How long should this take?" required />
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9]"
            placeholder="e.g. 3 months"
            required
          />
        </div>

        {/* Start Date */}
        <div>
          <Label text="Expected Start Date" />
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9]"
          />
        </div>

        {/* Attachments */}
        <div>
          <Label text="Attachments" />
          <input
            type="file"
            name="attachments"
            multiple
            onChange={handleFileChange}
            className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9] cursor-pointer"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload PDFs, images, or documents (max 10MB each).
          </p>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#E96435] to-[#FF7A50] text-white py-3 rounded-lg font-semibold shadow hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Creating Task..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
