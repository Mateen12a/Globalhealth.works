// src/components/NotificationBell.jsx
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;

export default function NotificationBell() {
  const token = localStorage.getItem("token");
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded hover:bg-gray-100"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg max-h-96 overflow-y-auto z-50">
          {notifications.length === 0 ? (
            <p className="p-3 text-gray-500">No notifications</p>
          ) : (
            notifications.map((n) => (
              <a
                key={n._id}
                href={n.link || "#"}
                className={`block p-3 text-sm border-b hover:bg-gray-50 ${
                  !n.read ? "bg-blue-50" : ""
                }`}
              >
                <p>{n.message}</p>
                <span className="block text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
