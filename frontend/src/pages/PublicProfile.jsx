import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/users/${id}/public`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [id]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/profile/${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (!profile) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <p className="mt-4 text-gray-700 leading-relaxed">{profile.bio}</p>
        )}

        {/* Skills / Expertise */}
        {profile.expertise?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold text-gray-800 mb-2">Skills & Expertise</h2>
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
            <h2 className="font-semibold text-gray-800 mb-2">Focus Areas</h2>
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
          <h2 className="font-semibold text-gray-800 mb-2">Recent Tasks Completed</h2>
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
              <p className="text-sm text-gray-500 italic">No recent tasks yet.</p>
            )}
          </ul>
        </div>
      </div>

      {/* RIGHT COLUMN: Share / Actions */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold mb-4">Work With {profile.name}</h3>
          <p className="text-gray-600 text-sm mb-6">
            Connect to collaborate on projects, research, or freelance tasks.
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
  );
}
