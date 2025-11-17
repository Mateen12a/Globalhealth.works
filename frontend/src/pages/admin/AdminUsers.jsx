// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from "react";
import PublicProfileModal from "../../components/profile/PublicProfileModal";

const API_URL = import.meta.env.VITE_API_URL;

function Spinner({ size = 16 }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
      style={{ width: size, height: size }}
    />
  );
}

// Small reject modal
function RejectModal({ open, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-2">Reject User</h2>
        <p className="text-sm text-gray-600 mb-3">
          Enter a reason for rejecting this user.
        </p>

        <textarea
          rows={4}
          className="w-full border rounded-lg p-3 text-sm"
          placeholder="Reason for rejection"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            disabled={loading}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            disabled={!reason.trim() || loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            onClick={() => onSubmit(reason)}
          >
            {loading && <Spinner size={14} />}
            {loading ? "Rejecting..." : "Reject User"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectUserId, setRejectUserId] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState({}); // each button loading
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
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

  const openRejectModal = (id) => {
    setRejectUserId(id);
    setRejectModalOpen(true);
  };

  const submitRejection = async (reason) => {
    try {
      setRejectLoading(true);

      const res = await fetch(`${API_URL}/api/admin/reject/${rejectUserId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === rejectUserId
              ? { ...u, isApproved: false, rejectionReason: reason }
              : u
          )
        );
        alert("User rejected");
        setRejectModalOpen(false);
      } else {
        alert("Rejection failed");
      }
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setRejectLoading(false);
    }
  };

  const approveUser = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: "approve" }));
    try {
      const res = await fetch(`${API_URL}/api/admin/approve/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id ? { ...u, isApproved: true, rejectionReason: null } : u
          )
        );
      }
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const moderateStatus = async (id, action) => {
    setActionLoading((prev) => ({ ...prev, [id]: action }));
    const route = action === "activate" ? "activate" : "suspend";

    try {
      const res = await fetch(`${API_URL}/api/admin/user/${id}/${route}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id
              ? { ...u, status: route === "suspend" ? "suspended" : "active" }
              : u
          )
        );
      }
    } catch (err) {
      console.error("Status change failed:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const filteredUsers =
    filter === "all" ? users : users.filter((u) => u.role === filter);

  const StatusLabel = ({ user }) => {
    if (user.status === "suspended")
      return (
        <span className="px-3 py-1 text-xs bg-red-200 text-red-700 rounded-full">
          Suspended
        </span>
      );

    if (user.rejectionReason)
      return (
        <span className="px-3 py-1 text-xs bg-red-300 text-red-800 rounded-full">
          Rejected
        </span>
      );

    if (user.isApproved)
      return (
        <span className="px-3 py-1 text-xs bg-green-200 text-green-800 rounded-full">
          Approved
        </span>
      );

    return (
      <span className="px-3 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full">
        Pending
      </span>
    );
  };

  if (loading)
    return (
      <div className="p-6 flex items-center gap-3 text-gray-600">
        <Spinner size={22} /> Loading users...
      </div>
    );

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
              {/* Name clickable */}
              <td
                className="border p-2 text-blue-700 cursor-pointer underline"
                onClick={() => setSelectedProfile(u._id)}
              >
                {u.firstName} {u.lastName}
              </td>

              <td className="border p-2">{u.email}</td>
              <td className="border p-2 capitalize">{u.role}</td>

              <td className="border p-2">
                <StatusLabel user={u} />
              </td>

              <td className="border p-2 flex gap-2 flex-wrap">
                {!u.isApproved && !u.rejectionReason && (
                  <button
                    onClick={() => approveUser(u._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center gap-2"
                    disabled={actionLoading[u._id] === "approve"}
                  >
                    {actionLoading[u._id] === "approve" && (
                      <Spinner size={12} />
                    )}
                    {actionLoading[u._id] === "approve"
                      ? "Approving..."
                      : "Approve"}
                  </button>
                )}

                {!u.rejectionReason && (
                  <button
                    onClick={() => openRejectModal(u._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    Reject
                  </button>
                )}

                {u.status !== "suspended" ? (
                  <button
                    onClick={() => moderateStatus(u._id, "suspend")}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm flex items-center gap-2"
                    disabled={actionLoading[u._id] === "suspend"}
                  >
                    {actionLoading[u._id] === "suspend" && (
                      <Spinner size={12} />
                    )}
                    {actionLoading[u._id] === "suspend"
                      ? "Suspending..."
                      : "Suspend"}
                  </button>
                ) : (
                  <button
                    onClick={() => moderateStatus(u._id, "activate")}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center gap-2"
                    disabled={actionLoading[u._id] === "activate"}
                  >
                    {actionLoading[u._id] === "activate" && (
                      <Spinner size={12} />
                    )}
                    {actionLoading[u._id] === "activate"
                      ? "Activating..."
                      : "Activate"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <RejectModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={submitRejection}
        loading={rejectLoading}
      />

      {/* PUBLIC PROFILE MODAL */}
      {selectedProfile && (
        <PublicProfileModal
          userId={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          currentUser={{ role: "admin" }}
        />
      )}
    </div>
  );
}
