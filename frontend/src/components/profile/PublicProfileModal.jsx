// src/components/PublicProfileModal.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link as LucideLink, X, User, Briefcase, Share2, Star, Mail, Phone, Globe, Building } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// Helper to format roles
const formatRole = (role) => {
  if (!role) return "";
  switch (role) {
    case "taskOwner":
      return "Task Owner";
    case "solutionProvider":
      return "Solution Provider";
    case "admin":
      return "Admin";
    default:
      return role;
  }
};

// Reject modal subcomponent
function RejectModal({ open, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 z-50"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Reject User</h3>
        <p className="text-sm text-gray-600 mb-3">
          Provide a short reason that will be emailed to the user.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          placeholder="Reason for rejection (required)"
          className="w-full border rounded-lg p-3 text-sm focus:outline-none"
        />
        <div className="mt-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            disabled={loading || !reason.trim()}
          >
            {loading ? "Rejecting..." : "Reject user"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PublicProfileModal({ userId, onClose, currentUser }) {
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [forbiddenMsg, setForbiddenMsg] = useState(null);

  const isAdmin = currentUser?.role === "admin";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setForbiddenMsg(null);
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/auth/users/${userId}/public`, { headers });

        if (res.status === 403) {
          const err = await res.json().catch(() => ({}));
          setForbiddenMsg(err.msg || "Profile not available");
          setProfile(null);
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfile(null);
        setForbiddenMsg("Could not load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, token]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/profile/${userId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.name}'s Profile`,
          text: "Check out this profile!",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  const refreshProfile = async () => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${userId}/public`, { headers });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("refresh error", err);
    }
  };

  const approveUser = async () => {
    if (!confirm("Approve this user?")) return;
    try {
      setAdminActionLoading(true);
      const res = await fetch(`${API_URL}/api/admin/approve/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Approve failed");
      await refreshProfile();
      alert("User approved");
    } catch (err) {
      console.error(err);
      alert("Could not approve user");
    } finally {
      setAdminActionLoading(false);
    }
  };

  const submitRejection = async (reason) => {
    try {
      setRejectLoading(true);
      const res = await fetch(`${API_URL}/api/admin/reject/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.msg || "Reject failed");
      }
      await refreshProfile();
      setShowRejectModal(false);
      alert("User rejected and notified");
    } catch (err) {
      console.error("Reject error", err);
      alert(err.message || "Could not reject user");
    } finally {
      setRejectLoading(false);
    }
  };

  const updateStatus = async (action) => {
    try {
      setAdminActionLoading(true);
      const route = action === "suspend" ? "suspend" : "activate";
      const res = await fetch(`${API_URL}/api/admin/user/${userId}/${route}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Status update failed");
      await refreshProfile();
      alert(`User ${route}ed`);
    } catch (err) {
      console.error(err);
      alert("Could not update status");
    } finally {
      setAdminActionLoading(false);
    }
  };

  const StatusLabel = ({ small = false }) => {
    if (!profile) return null;
    if (profile.status === "suspended")
      return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${small ? "text-xs" : ""} bg-red-100 text-red-700`}>Suspended</span>;
    if (profile.rejectionReason)
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-200 text-red-800">Rejected</span>;
    if (profile.isApproved)
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Approved</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>;
  };

  if (!userId) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative p-6"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl">
            <X />
          </button>

          {loading ? (
            <motion.div
              className="flex justify-center items-center h-64"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <User className="w-12 h-12 text-gray-400 animate-spin" />
            </motion.div>
          ) : forbiddenMsg ? (
            <div className="p-8 text-center">
              <p className="text-red-600 font-semibold mb-2">{forbiddenMsg}</p>
              <p className="text-sm text-gray-600">If you believe this is an error contact an administrator.</p>
            </div>
          ) : !profile ? (
            <p className="text-center mt-10 text-red-500">Could not load profile.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* LEFT */}
              <div className="bg-white rounded-xl shadow p-6 md:col-span-2 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative w-24 h-24">
                    <img
                      src={profile.profileImage?.startsWith("http") ? profile.profileImage : `${API_URL}${profile.profileImage}`}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#1e3a8a] shadow"
                    />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      {profile.firstName} {profile.lastName}
                    </h1>

                    <p className="text-gray-600 flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> {formatRole(profile.role)}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <StatusLabel />
                      {profile.approvedBy && (
                        <div className="text-xs text-gray-600">
                          Approved by {profile.approvedBy.firstName} {profile.approvedBy.lastName}
                        </div>
                      )}
                      {profile.rejectionReason && (
                        <div className="text-xs text-gray-600">Reason: {profile.rejectionReason}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 space-y-2 text-gray-700">
                  {profile.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {profile.email}
                    </p>
                  )}
                  {profile.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {profile.countryCode} {profile.phone}
                    </p>
                  )}
                  {profile.country && (
                    <p className="flex items-center gap-2">
                      <Globe className="w-4 h-4" /> {profile.country}
                    </p>
                  )}
                  {profile.organisationName && (
                    <p className="flex items-center gap-2">
                      <Building className="w-4 h-4" /> {profile.organisationName} ({profile.organisationType})
                    </p>
                  )}
                </div>

                {profile.bio && <p className="text-gray-700 leading-relaxed mt-2">{profile.bio}</p>}

                {profile.expertise?.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-gray-800 mb-2 mt-4">Skills & Expertise</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.expertise.map((item, idx) => (
                        <motion.span key={idx} whileHover={{ scale: 1.1 }} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" /> {item}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.focusAreas?.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-gray-800 mb-2 mt-4">Focus Areas</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.focusAreas.map((item, idx) => (
                        <motion.span key={idx} whileHover={{ scale: 1.05 }} className="bg-blue-900 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" /> {item}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.links?.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-gray-800 mb-2 mt-4">Links</h2>
                    <ul className="space-y-2">
                      {profile.links.map((link, idx) => (
                        <li key={idx}>
                          <a href={link} target="_blank" rel="noreferrer" className="text-blue-900 hover:underline flex items-center gap-2">
                            <LucideLink className="w-4 h-4" /> {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div className="bg-white rounded-xl shadow p-6 flex flex-col space-y-6">
                {isAdmin && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Admin Actions</h3>

                    {!profile.isApproved && !profile.rejectionReason && (
                      <button
                        onClick={approveUser}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
                        disabled={adminActionLoading}
                      >
                        {adminActionLoading ? "Approving..." : "Approve User"}
                      </button>
                    )}

                    {!profile.rejectionReason && (
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700"
                        disabled={rejectLoading}
                      >
                        Reject User
                      </button>
                    )}

                    {profile.status !== "suspended" ? (
                      <button
                        onClick={() => updateStatus("suspend")}
                        className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-700"
                        disabled={adminActionLoading}
                      >
                        Suspend User
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus("activate")}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
                        disabled={adminActionLoading}
                      >
                        Activate User
                      </button>
                    )}
                  </div>
                )}

                <motion.button onClick={handleShare} whileHover={{ scale: 1.05 }} className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg shadow-md flex items-center justify-center gap-2 w-full">
                  <Share2 className="w-5 h-5" /> {copied ? "Link Copied!" : "Share Profile"}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      <RejectModal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSubmit={submitRejection}
        loading={rejectLoading}
      />
    </>
  );
}
