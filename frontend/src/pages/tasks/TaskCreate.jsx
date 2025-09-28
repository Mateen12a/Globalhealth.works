// src/pages/tasks/TaskCreate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export default function TaskCreate() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    description: "",
    requiredSkills: "",
    focusAreas: "",
    location: "",
    duration: "",
    startDate: "",
    languages: "",
    fundingStatus: "unfunded",
  });

  const [attachments, setAttachments] = useState([]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setAttachments(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      for (const key in formData) {
        payload.append(key, formData[key]);
      }
      // Append files
      for (let i = 0; i < attachments.length; i++) {
        payload.append("attachments", attachments[i]);
      }

      const res = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Task created successfully!");
        navigate("/dashboard/to");
      } else {
        alert(data.msg || "Task creation failed");
      }
    } catch (err) {
      console.error("Task creation error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl"
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold text-[#1E376E] mb-6">
          Create New Task
        </h2>

        <input
          type="text"
          name="title"
          placeholder="Task Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
          required
        />
        <input
          type="text"
          name="summary"
          placeholder="Short Summary"
          value={formData.summary}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
          required
        />
        <textarea
          name="description"
          placeholder="Detailed Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
          rows="4"
          required
        />
        <input
          type="text"
          name="requiredSkills"
          placeholder="Required Skills (comma separated)"
          value={formData.requiredSkills}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        />
        <input
          type="text"
          name="focusAreas"
          placeholder="Focus Areas (comma separated)"
          value={formData.focusAreas}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        />
        <input
          type="text"
          name="duration"
          placeholder="Duration (e.g. 3 months)"
          value={formData.duration}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        />
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        />
        <input
          type="text"
          name="languages"
          placeholder="Languages (comma separated)"
          value={formData.languages}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        />
        <select
          name="fundingStatus"
          value={formData.fundingStatus}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-6"
        >
          <option value="unfunded">Unfunded</option>
          <option value="partially funded">Partially Funded</option>
          <option value="funded">Funded</option>
        </select>

        {/* Attachments */}
        <label className="block mb-2 font-semibold">Attachments</label>
        <input
          type="file"
          name="attachments"
          multiple
          onChange={handleFileChange}
          className="w-full border p-3 rounded mb-6"
        />

        <button
          type="submit"
          className="w-full bg-[#E96435] text-white py-3 rounded-lg font-semibold hover:bg-orange-700"
        >
          Create Task
        </button>
      </form>
    </div>
  );
}
