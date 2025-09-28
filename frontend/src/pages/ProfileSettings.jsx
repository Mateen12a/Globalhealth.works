// src/pages/ProfileSettings.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { UploadCloud, RotateCcw } from "lucide-react";
import CountrySelect from "../components/CountrySelect";
import FeedbackList from "../components/FeedbackList";


const BASE_URL = "http://localhost:5000";

export default function ProfileSettings() {
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [user, setUser] = useState({
    name: "",
    email: "",
    country: "",
    gender: "",
    bio: "",
    portfolio: "",
    profileImage: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUser(data);
      } catch (err) {
        setUser({
          name: storedUser.name || "",
          email: storedUser.email || "",
          country: storedUser.country || "",
          gender: storedUser.gender || "",
          bio: storedUser.bio || "",
          portfolio: storedUser.portfolio || "",
          profileImage: storedUser.profileImage || "",
        });
      }
    };
    fetchProfile();
  }, [token, storedUser]);

  const handleChange = (e) =>
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImage = (e) => {
    setImageFile(e.target.files[0]);
    if (e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setUser((prev) => ({ ...prev, profileImage: url }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let avatarUrl = user.profileImage;

      if (imageFile) {
        const form = new FormData();
        form.append("avatar", imageFile);
        const resUpload = await fetch(`${BASE_URL}/api/auth/upload-avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        const uploadData = await resUpload.json();
        if (resUpload.ok) avatarUrl = uploadData.url;
      }

      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...user, profileImage: avatarUrl }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
        alert("Profile updated successfully");
      } else {
        alert(data.msg || "Could not update profile");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleResetAvatar = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-avatar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, profileImage: data.profileImage }));
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, profileImage: data.profileImage })
        );
        alert("Avatar reset to default");
      } else {
        alert(data.msg || "Could not reset avatar");
      }
    } catch (err) {
      console.error("Reset avatar error:", err);
      alert("Something went wrong");
    }
  };

  const role =
    localStorage.getItem("role") || storedUser.role || "solutionProvider";

  const getImageUrl = (img) => {
    if (!img) return "";
    return img.startsWith("http") ? img : `${BASE_URL}${img}`;
  };

  return (
    <DashboardLayout role={role} title="Profile & Settings">
      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow">
        <div className="flex gap-6">
          {/* Avatar section */}
          <div className="w-48 flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border">
              {user.profileImage ? (
                <img
                  src={getImageUrl(user.profileImage)}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400">No image</div>
              )}
            </div>

            {/* Upload button */}
            <label className="mt-3 inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded border hover:bg-gray-50">
              <UploadCloud className="w-4 h-4" /> Upload image
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />
            </label>

            {/* Reset button */}
            <button
              type="button"
              onClick={handleResetAvatar}
              className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded border text-sm text-gray-600 hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4" /> Reset to default
            </button>
          </div>

          {/* Profile form */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Full name</label>
              <input
                name="name"
                value={user.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                name="email"
                value={user.email}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                disabled
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Country</label>
              <CountrySelect
                value={user.country}
                onChange={(val) => setUser((prev) => ({ ...prev, country: val }))}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Gender</label>
              <input
                name="gender"
                value={user.gender}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">Short bio</label>
              <textarea
                name="bio"
                value={user.bio}
                onChange={handleChange}
                rows={4}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">Portfolio / CV link</label>
              <input
                name="portfolio"
                value={user.portfolio}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="mt-6 flex justify-end">
          <button
            className="bg-[#1E376E] text-white px-6 py-2 rounded-lg shadow hover:opacity-90"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>

      
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[#1E376E] mb-4">My Feedback</h2>
        <FeedbackList userId={localStorage.getItem("userId")} />
      </section>  
    </DashboardLayout>

  );
}
