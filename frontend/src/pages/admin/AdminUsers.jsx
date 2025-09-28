// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function AdminUsers() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, status: action } : u))
        );
      }
    } catch (err) {
      console.error("User moderation error:", err);
    }
  };

  const filteredUsers =
    filter === "all" ? users : users.filter((u) => u.role === filter);

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Users</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All</option>
          <option value="solutionProvider">Solution Providers</option>
          <option value="taskOwner">Task Owners</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-50">
          <tr>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Role</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50">
              <td className="border p-2">{u.name}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2 capitalize">{u.role}</td>
              <td className="border p-2">{u.status || "active"}</td>
              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => handleAction(u._id, "suspend")}
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                >
                  Suspend
                </button>
                <button
                  onClick={() => handleAction(u._id, "delete")}
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
