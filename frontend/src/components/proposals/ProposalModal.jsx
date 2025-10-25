// src/components/proposals/ProposalModal.jsx
import { useState } from "react";
import {
  FileText,
  DollarSign,
  Clock,
  Paperclip,
  X,
  Send,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProposalModal({ taskId, onClose, onSubmitted }) {
  const token = localStorage.getItem("token");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!message) return alert("Please add a cover message");

    setLoading(true);
    try {
      const form = new FormData();
      form.append("task", taskId);
      form.append("message", message);
      if (budget) form.append("proposedBudget", budget);
      if (duration) form.append("proposedDuration", duration);
      files.forEach((f) => form.append("attachments", f));

      const res = await fetch(`${API_URL}/api/proposals`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Proposal submitted successfully!");
        onSubmitted?.(data.proposal);
        onClose?.();
      } else {
        alert(data.msg || "Could not submit proposal");
      }
    } catch (err) {
      console.error("Proposal submit error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const Label = ({ text, required }) => (
    <label className="block font-semibold text-gray-800 mb-1">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 animate-fadeIn">
      <form
        onSubmit={submit}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h2 className="text-2xl font-bold text-[#1E376E] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#357FE9]" /> Submit Proposal
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Cover Message */}
          <div>
            <Label text="Cover Message" required />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain your understanding of the task, your approach, and what you’ll deliver."
              className="w-full border p-4 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9] outline-none resize-none"
              rows={6}
              required
            />
          </div>

          {/* Budget & Duration */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* <div>
              <Label text="Proposed Budget (USD)" />
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Enter your proposed budget"
                  className="w-full border pl-9 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9] outline-none"
                />
              </div>
            </div> */}
            <div>
              <Label text="Proposed Duration" />
              <div className="relative">
                <Clock className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 4 weeks, 2 months"
                  className="w-full border pl-9 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <Label text="Attachments (optional)" />
            <div className="relative border-2 border-dashed rounded-xl p-5 text-center hover:border-[#357FE9] transition">
              <Paperclip className="w-6 h-6 text-[#357FE9] mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag & drop files here, or click to browse
              </p>
              <input
                type="file"
                multiple
                onChange={handleFiles}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            {files.length > 0 && (
              <ul className="mt-3 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border">
                {files.map((file, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFiles(files.filter((_, i) => i !== idx))
                      }
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 w-full sm:w-auto bg-gradient-to-r from-[#E96435] to-[#FF7A50] text-white font-semibold rounded-lg shadow hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
