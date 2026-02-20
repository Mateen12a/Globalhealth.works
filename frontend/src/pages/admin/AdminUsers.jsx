import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, CheckCircle, XCircle, AlertTriangle, Eye, Loader2, X, UserCheck, UserX, Shield, RefreshCw, Trash2 } from "lucide-react";
import PublicProfileModal from "../../components/profile/PublicProfileModal";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const API_URL = import.meta.env.VITE_API_URL;

function Spinner({ size = 16 }) {
  return (
    <Loader2
      className="animate-spin text-[var(--color-primary-light)]"
      style={{ width: size, height: size }}
    />
  );
}

function RejectModal({ open, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--color-surface)] rounded-2xl p-6 w-full max-w-md shadow-xl border border-[var(--color-border)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Reject User</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Please provide a reason for rejecting this user. They will be notified via email.
          </p>

          <textarea
            rows={4}
            className="w-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent resize-none"
            placeholder="Reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors font-medium"
              onClick={onClose}
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!reason.trim() || loading}
              className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onSubmit(reason)}
            >
              {loading && <Spinner size={16} />}
              {loading ? "Rejecting..." : "Reject User"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ChangeRoleModal({ open, onClose, onSubmit, loading, user }) {
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    if (user && open) {
      setNewRole(user.role || "");
    }
  }, [user, open]);

  if (!open || !user) return null;

  const roles = [
    { value: "solutionProvider", label: "Solution Provider" },
    { value: "taskOwner", label: "Task Owner" },
    { value: "admin", label: "Admin" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--color-surface)] rounded-2xl p-6 w-full max-w-md shadow-xl border border-[var(--color-border)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Change User Role</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">
              Change role for <strong className="text-[var(--color-text)]">{user.firstName} {user.lastName}</strong>
            </p>
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
              Only Super Admins can change user roles. This action is logged.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Current Role: <span className="text-[var(--color-primary-light)]">{user.role}</span>
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors font-medium"
              onClick={onClose}
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={newRole === user.role || loading}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onSubmit(newRole)}
            >
              {loading && <Spinner size={16} />}
              {loading ? "Changing..." : "Change Role"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AdminUsers({ embedded = false }) {
  const { userId: urlUserId } = useParams();
  const token = localStorage.getItem("token");
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const isSuperAdmin = currentUser.adminType === "superAdmin";
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedUserId, setHighlightedUserId] = useState(null);
  const highlightedRef = useRef(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectUserId, setRejectUserId] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            const updated = { ...JSON.parse(localStorage.getItem("user") || "{}"), adminType: data.adminType || null };
            localStorage.setItem("user", JSON.stringify(updated));
            setCurrentUser(updated);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data);
          if (urlUserId) {
            setSelectedProfile(urlUserId);
            setHighlightedUserId(urlUserId);
          }
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token, urlUserId]);

  useEffect(() => {
    if (highlightedUserId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      const timer = setTimeout(() => setHighlightedUserId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedUserId, loading]);

  const openRejectModal = (id) => {
    setRejectUserId(id);
    setRejectModalOpen(true);
  };

  const openRoleModal = (user) => {
    setRoleChangeUser(user);
    setRoleModalOpen(true);
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
              ? { ...u, isApproved: false, rejectionReason: reason, rejectedBy: { firstName: currentUser.firstName, lastName: currentUser.lastName, email: currentUser.email } }
              : u
          )
        );
        setRejectModalOpen(false);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.msg || "Rejection failed");
      }
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setRejectLoading(false);
    }
  };

  const submitRoleChange = async (newRole) => {
    if (!roleChangeUser) return;
    
    try {
      setRoleChangeLoading(true);

      const res = await fetch(`${API_URL}/api/admin/user/${roleChangeUser._id}/change-role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === roleChangeUser._id
              ? { ...u, role: newRole }
              : u
          )
        );
        setRoleModalOpen(false);
        alert(`Role changed successfully to ${newRole}`);
      } else {
        alert(data.msg || "Role change failed");
      }
    } catch (err) {
      console.error("Role change error:", err);
      alert("Failed to change role");
    } finally {
      setRoleChangeLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteModal) return;
    try {
      setDeleting(true);
      setDeleteError("");
      const res = await fetch(`${API_URL}/api/admin/user/${deleteModal._id}/permanent`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== deleteModal._id));
        setDeleteModal(null);
      } else {
        setDeleteError(data.msg || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError("Failed to delete user");
    } finally {
      setDeleting(false);
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

  const filteredUsers = users
    .filter((u) => filter === "all" || u.role === filter)
    .filter((u) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        u.firstName?.toLowerCase().includes(query) ||
        u.lastName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      );
    });

  const StatusBadge = ({ user }) => {
    if (user.status === "suspended")
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          <XCircle className="w-3.5 h-3.5" />
          Suspended
        </span>
      );

    if (user.rejectionReason)
      return (
        <div className="group relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full cursor-help">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
          <div className="hidden group-hover:block absolute z-50 left-0 top-full mt-1 w-64 p-3 bg-white border border-red-200 rounded-xl shadow-lg text-xs">
            <p className="font-semibold text-red-700 mb-1">Rejection Reason:</p>
            <p className="text-red-600">{user.rejectionReason}</p>
            {user.rejectedBy && (
              <p className="text-red-500 mt-1">
                By: {user.rejectedBy.firstName} {user.rejectedBy.lastName}
              </p>
            )}
          </div>
        </div>
      );

    if (user.isApproved)
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
          <CheckCircle className="w-3.5 h-3.5" />
          Approved
        </span>
      );

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
        <AlertTriangle className="w-3.5 h-3.5" />
        Pending
      </span>
    );
  };

  const RoleBadge = ({ role }) => {
    const config = {
      admin: { color: "bg-purple-100 text-purple-700", icon: Shield },
      taskOwner: { color: "bg-blue-100 text-blue-700", icon: null },
      solutionProvider: { color: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]", icon: null },
    };
    const { color } = config[role] || { color: "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]" };
    
    const displayRole = role === "taskOwner" ? "Task Owner" : role === "solutionProvider" ? "Solution Provider" : role;
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${color}`}>
        {displayRole}
      </span>
    );
  };

  const LoadingState = () => (
    <div className="flex items-center justify-center py-12 gap-3 text-[var(--color-text-secondary)]">
      <Spinner size={24} /> Loading users...
    </div>
  );

  const UsersContent = () => (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="solutionProvider">Solution Providers</option>
            <option value="taskOwner">Task Owners</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full">
          <thead className="bg-[var(--color-bg-secondary)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--color-border)]">
            {filteredUsers.map((u) => (
              <motion.tr
                key={u._id}
                ref={u._id === highlightedUserId ? highlightedRef : null}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`hover:bg-[var(--color-bg-secondary)] transition-colors ${u._id === highlightedUserId ? "bg-amber-50 ring-2 ring-amber-400" : ""}`}
              >
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedProfile(u._id)}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white font-semibold text-sm">
                      {u.firstName?.[0]?.toUpperCase() || u.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary-light)] transition-colors">
                        {u.firstName} {u.lastName}
                      </p>
                    </div>
                  </button>
                </td>

                <td className="px-4 py-3 text-[var(--color-text-secondary)] text-sm">{u.email}</td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4 py-3"><StatusBadge user={u} /></td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedProfile(u._id)}
                      className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] transition-colors"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {isSuperAdmin && u._id !== currentUser.id && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openRoleModal(u)}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-purple-700 transition-colors"
                        title="Change Role (Super Admin only)"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Role
                      </motion.button>
                    )}

                    {!u.isApproved && !u.rejectionReason && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => approveUser(u._id)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-emerald-700 transition-colors"
                        disabled={actionLoading[u._id] === "approve"}
                      >
                        {actionLoading[u._id] === "approve" ? (
                          <Spinner size={12} />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                        {actionLoading[u._id] === "approve" ? "..." : "Approve"}
                      </motion.button>
                    )}

                    {!u.rejectionReason && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openRejectModal(u._id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-red-700 transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Reject
                      </motion.button>
                    )}

                    {u.status !== "suspended" ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => moderateStatus(u._id, "suspend")}
                        className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-amber-700 transition-colors"
                        disabled={actionLoading[u._id] === "suspend"}
                      >
                        {actionLoading[u._id] === "suspend" && <Spinner size={12} />}
                        {actionLoading[u._id] === "suspend" ? "..." : "Suspend"}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => moderateStatus(u._id, "activate")}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
                        disabled={actionLoading[u._id] === "activate"}
                      >
                        {actionLoading[u._id] === "activate" && <Spinner size={12} />}
                        {actionLoading[u._id] === "activate" ? "..." : "Activate"}
                      </motion.button>
                    )}

                    {isSuperAdmin && u._id !== currentUser.id && u.adminType !== "superAdmin" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setDeleteModal(u); setDeleteError(""); }}
                        className="px-3 py-1.5 bg-red-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-red-900 transition-colors"
                        title="Permanently delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </motion.button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          No users found matching your criteria.
        </div>
      )}

      <RejectModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={submitRejection}
        loading={rejectLoading}
      />

      <ChangeRoleModal
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        onSubmit={submitRoleChange}
        loading={roleChangeLoading}
        user={roleChangeUser}
      />

      {selectedProfile && (
        <PublicProfileModal
          userId={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          currentUser={{ role: "admin" }}
        />
      )}

      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[var(--color-surface)] rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-700">Permanent Deletion</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">This action cannot be undone</p>
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
                  All tasks, proposals, messages, and data will be removed.
                </p>
              </div>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-700">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModal(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePermanentDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-red-700 text-white font-medium hover:bg-red-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {deleting ? <Spinner size={14} /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (embedded) {
    return loading ? <LoadingState /> : <UsersContent />;
  }

  return (
    <DashboardLayout role="Admin" title="Manage Users">
      {loading ? <LoadingState /> : <UsersContent />}
    </DashboardLayout>
  );
}
