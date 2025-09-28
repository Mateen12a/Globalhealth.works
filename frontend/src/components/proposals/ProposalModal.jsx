// src/components/proposals/ProposalModal.jsx
import { useState } from "react";
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
        alert("Proposal submitted");
        onSubmitted && onSubmitted(data.proposal);
        onClose && onClose();
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

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form onSubmit={submit} className="bg-white p-6 rounded-lg w-full max-w-xl">
        <h3 className="text-xl font-semibold mb-3">Submit a Proposal</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Cover message for the task (what you'll deliver, approach)"
          className="w-full border p-3 rounded mb-3"
          rows={6}
          required
        />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="number"
            min="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Proposed budget (USD)"
            className="border p-2 rounded"
          />
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Proposed duration (e.g., 4 weeks)"
            className="border p-2 rounded"
          />
        </div>
        <div className="mb-3">
          <label className="inline-block mb-1">Attachments (optional)</label>
          <input type="file" multiple onChange={handleFiles} />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-[#357FE9] text-white">
            {loading ? "Submitting..." : "Submit Proposal"}
          </button>
        </div>
      </form>
    </div>
  );
}
