// src/pages/admin/AdminTasks.jsx
import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function AdminTasks() {
  const token = localStorage.getItem("token");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [token]);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/tasks/${id}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t._id === id ? { ...t, status: action === "publish" ? "published" : "withdrawn" } : t
          )
        );
      }
    } catch (err) {
      console.error("Task moderation error:", err);
    }
  };

  if (loading) return <p className="p-6">Loading tasks...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Tasks</h1>

      <table className="w-full border">
        <thead className="bg-gray-50">
          <tr>
            <th className="border p-2 text-left">Title</th>
            <th className="border p-2 text-left">Owner</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t._id} className="hover:bg-gray-50">
              <td className="border p-2">{t.title}</td>
              <td className="border p-2">{t.owner?.name}</td>
              <td className="border p-2 capitalize">{t.status}</td>
              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => handleAction(t._id, "publish")}
                  className="px-2 py-1 bg-green-600 text-white rounded"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleAction(t._id, "withdraw")}
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                >
                  Withdraw
                </button>
                <button
                  onClick={() => handleAction(t._id, "delete")}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
