// src/components/tasks/EditTaskModal.jsx
import { useState } from "react";

export default function EditTaskModal({ task, onClose, onUpdated }) {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    title: task.title,
    summary: task.summary,
    description: task.description,
    requiredSkills: task.requiredSkills?.join(", ") || "",
    focusAreas: task.focusAreas?.join(", ") || "",
    languages: task.languages?.join(", ") || "",
    fundingStatus: task.fundingStatus,
  });

  const [existingAttachments, setExistingAttachments] = useState(task.attachments || []);
  const [newAttachments, setNewAttachments] = useState([]);
  const [removedAttachments, setRemovedAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle input fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new files
  const handleFileChange = (e) => {
    setNewAttachments([...newAttachments, ...Array.from(e.target.files)]);
  };

  // Remove existing file
  const handleRemoveExisting = (file) => {
    setRemovedAttachments([...removedAttachments, file]);
    setExistingAttachments(existingAttachments.filter((f) => f !== file));
  };

  // Remove new file
  const handleRemoveNew = (index) => {
    setNewAttachments(newAttachments.filter((_, i) => i !== index));
  };

  // Check if file is image
  const isImage = (file) => {
    if (typeof file === "string") {
      return file.match(/\.(jpeg|jpg|png|gif|webp)$/i);
    }
    return file.type.startsWith("image/");
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // Append basic fields
      formData.append("title", form.title || "");
      formData.append("summary", form.summary || "");
      formData.append("description", form.description || "");
      formData.append("fundingStatus", form.fundingStatus || "");

      // Safely handle arrays
      const safeArray = (val) =>
        typeof val === "string"
          ? val.split(",").map((s) => s.trim()).filter(Boolean)
          : Array.isArray(val)
          ? val
          : [];

      formData.append("requiredSkills", JSON.stringify(safeArray(form.requiredSkills)));
      formData.append("focusAreas", JSON.stringify(safeArray(form.focusAreas)));
      formData.append("languages", JSON.stringify(safeArray(form.languages)));

      // Add new files
      newAttachments.forEach((file) => {
        formData.append("attachments", file);
      });

      // Track removed files
      removedAttachments.forEach((file) => {
        formData.append("removeAttachments", file);
      });

      // Send request
      const res = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`, // don't add Content-Type, browser sets it for FormData
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        onUpdated(data);
        onClose();
      } else {
        alert(data.msg || "Error updating task");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Something went wrong while updating task");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal container with animation */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh] transform transition-all duration-300 scale-100 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-semibold text-[#1E376E]">Edit Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Title"
          />
          <input
            name="summary"
            value={form.summary}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Summary"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            className="w-full border rounded-lg p-2"
            placeholder="Description"
          />
          <input
            name="requiredSkills"
            value={form.requiredSkills}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Required skills (comma-separated)"
          />
          <input
            name="focusAreas"
            value={form.focusAreas}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Focus areas (comma-separated)"
          />
          <input
            name="languages"
            value={form.languages}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Languages (comma-separated)"
          />
          <input
            name="fundingStatus"
            value={form.fundingStatus}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Funding Status"
          />

          {/* Existing Attachments */}
          {existingAttachments.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-2">Existing Attachments</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {existingAttachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative border rounded-lg p-2 bg-gray-50 flex flex-col items-center hover:shadow-md transition"
                  >
                    {isImage(file) ? (
                      <a href={file} target="_blank" rel="noopener noreferrer">
                        <img
                          src={file}
                          alt="attachment"
                          className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-80"
                        />
                      </a>
                    ) : (
                      <a
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm text-center break-all"
                      >
                        {file.split("/").pop()}
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(file)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Attachments */}
          <div>
            <p className="font-semibold text-gray-700 mb-2">Add Attachments</p>
            <input type="file" multiple onChange={handleFileChange} className="w-full" />
            {newAttachments.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {newAttachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative border rounded-lg p-2 bg-gray-50 flex flex-col items-center hover:shadow-md transition"
                  >
                    {isImage(file) ? (
                      <a
                        href={URL.createObjectURL(file)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt="new-attachment"
                          className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-80"
                        />
                      </a>
                    ) : (
                      <span className="text-sm text-center break-all">{file.name}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveNew(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
