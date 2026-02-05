// src/components/admin/UsersTable.jsx
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function UsersTable() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    // Check if current user is super admin
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsSuperAdmin(decoded.adminType === "superAdmin");
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }

    fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Fetch users error:", err));
  }, [token]);

  const toggleBlock = async (id) => {
    const res = await fetch(`${API_URL}/api/admin/users/${id}/toggle-block`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setUsers(users.map((u) => (u._id === id ? { ...u, blocked: !u.blocked } : u)));
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`${API_URL}/api/admin/user/${deleteModal._id}/permanent`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(users.filter((u) => u._id !== deleteModal._id));
        setDeleteModal(null);
      } else {
        setDeleteError(data.msg || "Failed to delete user");
      }
    } catch (err) {
      setDeleteError("An error occurred while deleting the user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-64"
        />
      </div>

      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users
            .filter((u) => {
              const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase();
              const email = u.email?.toLowerCase() || "";
              const s = search.toLowerCase();

              return name.includes(s) || email.includes(s);
            })
            .map((u) => (
              <tr key={u._id} className="border-b">
                <td className="p-2"><a href={`/review/${u._id}`}>{u.firstName} {u.lastName}</a></td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 capitalize">{u.role}{u.adminType === "superAdmin" && " (Super)"}</td>
                <td className="p-2">
                  {u.blocked ? (
                    <span className="text-red-600 font-medium">Blocked</span>
                  ) : (
                    <span className="text-green-600 font-medium">Active</span>
                  )}
                </td>
                <td className="p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => toggleBlock(u._id)}
                    className={`px-3 py-1 rounded text-white text-xs ${
                      u.blocked ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {u.blocked ? "Unblock" : "Block"}
                  </button>
                  {isSuperAdmin && u.adminType !== "superAdmin" && (
                    <button
                      onClick={() => setDeleteModal(u)}
                      className="px-3 py-1 rounded bg-red-700 text-white text-xs flex items-center gap-1 hover:bg-red-800"
                      title="Permanently delete user and all their data"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Permanent Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-700">Permanent Deletion</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 mb-2">
                You are about to permanently delete:
              </p>
              <p className="font-semibold text-red-800">
                {deleteModal.firstName} {deleteModal.lastName}
              </p>
              <p className="text-sm text-red-600">{deleteModal.email}</p>
              <p className="text-xs text-red-500 mt-2">
                This will also delete all their tasks, proposals, messages, feedback, and notifications.
              </p>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
