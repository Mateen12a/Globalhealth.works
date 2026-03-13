import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Mail, User, CheckCircle, X, Shield, Send, Trash2, AlertCircle, RefreshCw, Clock } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminOnboarding() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [resendingId, setResendingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAdmins(data);
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/admin/invite-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to send invitation");
      }

      setSuccess(data.msg || "Invitation sent successfully! They have 48 hours to accept.");
      setFormData({ firstName: "", lastName: "", email: "" });
      fetchAdmins();
      
      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendInvite = async (adminId) => {
    setResendingId(adminId);
    try {
      const res = await fetch(`${API_URL}/api/admin/admins/${adminId}/resend-invite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.msg || "Invitation resent successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.msg || "Failed to resend invitation");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("Failed to resend invitation");
      setTimeout(() => setError(""), 3000);
    } finally {
      setResendingId(null);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/admins/${adminId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchAdmins();
      }
    } catch (err) {
      console.error("Error deleting admin:", err);
    }
  };

  const getAdminStatus = (admin) => {
    if (admin.hasSetupAccount) {
      return { label: "Active", color: "bg-green-100 text-green-700", dot: "bg-green-500" };
    }
    if (admin.inviteTokenExpiry && new Date(admin.inviteTokenExpiry) > new Date()) {
      return { label: "Invite Pending", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" };
    }
    return { label: "Invite Expired", color: "bg-red-100 text-red-700", dot: "bg-red-500" };
  };

  return (
    <DashboardLayout role="admin" title="Admin Management">
      <div className="space-y-6">
        {(success || error) && !showModal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl flex items-start gap-3 ${
              success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}
          >
            {success ? (
              <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${success ? "text-green-600" : "text-red-600"}`}>{success || error}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Admin Team</h2>
            <p className="text-[var(--color-text-secondary)]">Invite and manage platform administrators</p>
          </div>
          <motion.button
            onClick={() => { setShowModal(true); setError(""); setSuccess(""); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus size={18} />
            Invite Admin
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-[var(--color-primary-light)] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : admins.length === 0 ? (
            <div className="p-8 text-center">
              <Shield size={48} className="mx-auto text-[var(--color-text-muted)] mb-4" />
              <p className="text-[var(--color-text-secondary)]">No other admins found. Invite your first team member!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">Admin</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">Joined</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => {
                    const status = getAdminStatus(admin);
                    const isPending = !admin.hasSetupAccount;
                    return (
                      <tr key={admin._id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white font-semibold">
                              {admin.firstName?.[0]}{admin.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text)]">{admin.firstName} {admin.lastName}</p>
                              <p className="text-xs text-[var(--color-text-muted)]">Administrator</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[var(--color-text-secondary)]">{admin.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                          {isPending ? (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Clock size={14} />
                              Awaiting setup
                            </span>
                          ) : admin.createdAt && !isNaN(new Date(admin.createdAt).getTime()) ? (
                            new Date(admin.createdAt).toLocaleDateString()
                          ) : (
                            <span className="text-[var(--color-text-muted)]">&mdash;</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isPending && (
                              <button
                                onClick={() => handleResendInvite(admin._id)}
                                disabled={resendingId === admin._id}
                                className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                title="Resend invitation"
                              >
                                <RefreshCw size={18} className={resendingId === admin._id ? "animate-spin" : ""} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAdmin(admin._id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Remove admin"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--color-text)]">Invite Admin</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">Send an invitation to join as admin</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  <X size={20} className="text-[var(--color-text-secondary)]" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700">
                    The invited person will receive an email with a link to set their password. The invitation expires in 48 hours.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={18} />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
