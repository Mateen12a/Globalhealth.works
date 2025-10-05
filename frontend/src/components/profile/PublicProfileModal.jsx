import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link as LucideLink, X, User, Briefcase, Share2, Star } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;

export default function PublicProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/auth/users/${userId}/public`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

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

  if (!userId) return null;

  return (
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"
        >
          <X />
        </button>

        {loading ? (
          <p className="text-center mt-10 text-gray-500">Loading profile...</p>
        ) : !profile ? (
          <p className="text-center mt-10 text-red-500">
            Could not load profile.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT COLUMN */}
            <div className="bg-white rounded-xl shadow p-6 md:col-span-2 space-y-4">
              {/* Header */}
              <div className="flex items-center space-x-4">
                <div className="relative w-24 h-24">
                  <img
                    src={
                      profile.profileImage?.startsWith("http")
                        ? profile.profileImage
                        : `${API_URL}${profile.profileImage}`
                    }
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#1e3a8a] shadow"
                  />
                  <User className="absolute -bottom-2 -right-2 w-6 h-6 text-[#1e3a8a] bg-white rounded-full p-0.5 shadow" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    {profile.name} <User className="text-[#1e3a8a] w-5 h-5" />
                  </h1>
                  <p className="text-gray-600 flex items-center gap-1">
                    <Briefcase className="w-4 h-4" /> {profile.role === "solutionProvider"
                      ? "Solution Provider"
                      : profile.role === "taskOwner"
                      ? "Task Owner"
                      : profile.role === "admin"
                      ? "Admin"
                      : profile.role}
                  </p>
                  {profile.country && (
                    <p className="text-sm text-gray-500">{profile.country}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              )}

              {/* Skills */}
              {profile.expertise?.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    Skills & Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((item, idx) => (
                      <motion.span
                        key={idx}
                        whileHover={{ scale: 1.1 }}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border flex items-center gap-1"
                      >
                        <Star className="w-4 h-4 text-yellow-500" />
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Focus Areas */}
              {profile.focusAreas?.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    Focus Areas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.focusAreas.map((item, idx) => (
                      <motion.span
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        className="bg-blue-900 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        <Star className="w-4 h-4 text-yellow-400" />
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {profile.links?.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    Links
                  </h2>
                  <ul className="space-y-2">
                    {profile.links.map((link, idx) => (
                      <li key={idx}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-900 hover:underline flex items-center gap-2"
                        >
                          <LucideLink className="w-4 h-4" /> {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recent Tasks */}
              <div>
                <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  Recent Tasks Completed
                </h2>
                <ul className="space-y-3">
                  {profile.recentTasks?.length > 0 ? (
                    profile.recentTasks.map((task, idx) => (
                      <motion.li
                        key={idx}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                        }}
                        className="p-3 border rounded-lg transition-all bg-gray-50"
                      >
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-600">{task.summary}</p>
                      </motion.li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No recent tasks yet.
                    </p>
                  )}
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  Work With {profile.name}{" "}
                  <Briefcase className="text-[#1e3a8a] w-5 h-5" />
                </h3>
                <p className="text-gray-600 text-sm">
                  Connect to collaborate on projects, research, or freelance tasks.
                </p>
              </div>

              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg shadow-md flex items-center justify-center gap-2 w-full transition-all"
              >
                <Share2 className="w-5 h-5" />
                {copied ? "✅ Link Copied!" : "Share Profile"}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
