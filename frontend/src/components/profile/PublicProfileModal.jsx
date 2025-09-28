import { useEffect, useState } from "react";
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
        const res = await fetch(
          `${API_URL}/api/auth/users/${userId}/public`
        );
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative p-6">
        {/* Close button */}
        <button
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-2xl"
          onClick={onClose}
        >
          ✕
        </button>

        {loading ? (
          <p className="text-center mt-10">Loading profile...</p>
        ) : !profile ? (
          <p className="text-center mt-10 text-red-500">
            Could not load profile.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Profile Info */}
            <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
              {/* Header */}
              <div className="flex items-center space-x-4">
                <img
                  src={
                    profile.profileImage?.startsWith("http")
                      ? profile.profileImage
                      : `${API_URL}${profile.profileImage}`
                  }
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover border shadow"
                />
                <div>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-gray-600">{profile.role}</p>
                  {profile.country && (
                    <p className="text-sm text-gray-500">{profile.country}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mt-4 text-gray-700 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Skills / Expertise */}
              {profile.expertise?.length > 0 && (
                <div className="mt-6">
                  <h2 className="font-semibold text-gray-800 mb-2">
                    Skills & Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Focus Areas */}
              {profile.focusAreas?.length > 0 && (
                <div className="mt-6">
                  <h2 className="font-semibold text-gray-800 mb-2">
                    Focus Areas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.focusAreas.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {profile.links?.length > 0 && (
                <div className="mt-6">
                  <h2 className="font-semibold text-gray-800 mb-2">Links</h2>
                  <ul className="space-y-2">
                    {profile.links.map((link, idx) => (
                      <li key={idx}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          🔗 {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recent Tasks Completed */}
              <div className="mt-8">
                <h2 className="font-semibold text-gray-800 mb-2">
                  Recent Tasks Completed
                </h2>
                <ul className="space-y-3">
                  {profile.recentTasks?.length > 0 ? (
                    profile.recentTasks.map((task, idx) => (
                      <li
                        key={idx}
                        className="p-3 border rounded-lg hover:shadow-sm transition"
                      >
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-600">{task.summary}</p>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No recent tasks yet.
                    </p>
                  )}
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN: Share / Actions */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-4">
                  Work With {profile.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Connect to collaborate on projects, research, or freelance
                  tasks.
                </p>
              </div>

              <button
                onClick={handleShare}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md w-full"
              >
                {copied ? "✅ Link Copied!" : "🔗 Share Profile"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
