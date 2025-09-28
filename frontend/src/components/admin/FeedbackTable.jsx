// src/components/admin/FeedbackTable.jsx
import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function FeedbackTable() {
  const token = localStorage.getItem("token");
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/feedback`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setFeedback(data))
      .catch((err) => console.error("Fetch feedback error:", err));
  }, [token]);

  const deleteFeedback = async (id) => {
    const res = await fetch(`${API_URL}/api/admin/feedback/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setFeedback(feedback.filter((f) => f._id !== id));
    }
  };

  return (
    <table className="w-full border-collapse text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">User</th>
          <th className="p-2 text-left">Comment</th>
          <th className="p-2 text-left">Rating</th>
          <th className="p-2"></th>
        </tr>
      </thead>
      <tbody>
        {feedback.map((f) => (
          <tr key={f._id} className="border-b">
            <td className="p-2">{f.user?.name}</td>
            <td className="p-2">{f.comment}</td>
            <td className="p-2">{f.rating}</td>
            <td className="p-2">
              <button
                onClick={() => deleteFeedback(f._id)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
