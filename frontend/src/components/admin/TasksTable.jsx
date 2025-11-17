// src/components/admin/TaskTable.jsx
import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function TasksTable() {
  const token = localStorage.getItem("token");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch(`${API_URL}/api/admin/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Fetch tasks error:", err));
  }, [token]);

  const updateStatus = async (id, status) => {
    const res = await fetch(`${API_URL}/api/admin/tasks/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setTasks(tasks.map((t) => (t._id === id ? { ...t, status } : t)));
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Owner</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks
            .filter((t) => filter === "all" || t.status === filter)
            .map((t) => (
              <tr key={t._id} className="border-b">
                <td className="p-2"><a href={`/tasks/${t._id}`} target="_blank" rel="noopener noreferrer">{t.title}</a></td>
                <td className="p-2">{t.owner?.name}</td>
                <td className="p-2">{t.status}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => updateStatus(t._id, "withdrawn")}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
