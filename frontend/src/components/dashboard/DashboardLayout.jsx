// src/components/dashboard/DashboardLayout.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  LogOut,
  User,
  Grid,
  Clipboard,
  Users,
  Settings,
  X,
} from "lucide-react";
import NotificationBell from "../NotificationBell";
import logo from "../../assets/logo.png";

export default function DashboardLayout({ children, role, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/messages/unread/count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.count || 0))
      .catch((err) => console.error("Unread fetch error:", err));
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Sidebar links
  const roleLinks =
    role === "admin"
      ? [
          { to: "/dashboard/admin", label: "Overview", icon: Grid },
          { to: "/admin/users", label: "Manage Users", icon: Users },
          { to: "/admin/tasks", label: "Manage Tasks", icon: Clipboard },
          { to: "/messages/inbox", label: "Messages", icon: User },
          { to: "/profile", label: "Settings", icon: Settings },
        ]
      : role === "taskOwner"
      ? [
          { to: "/dashboard/to", label: "My Tasks", icon: Clipboard },
          { to: "/tasks/create", label: "Create Task", icon: Clipboard },
          { to: "/messages/inbox", label: "Messages", icon: User },
          { to: "/profile", label: "Settings", icon: Settings },
        ]
      : [
          { to: "/dashboard/sp", label: "Available Tasks", icon: Clipboard },
          { to: "/my-applications", label: "My Applications", icon: Users },
          { to: "/messages/inbox", label: "Messages", icon: User },
          { to: "/profile", label: "Settings", icon: Settings },
        ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col bg-white border-r w-64 p-6">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
        </div>

        {/* Nav Links */}
        <nav className="space-y-2 flex-1">
          {roleLinks.map((l) => {
            const Icon = l.icon;
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-[#F6F9FF] text-[#1E376E] shadow-sm"
                    : "text-gray-600 hover:bg-[#F6F9FF]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#1E376E]" />
                  <span>{l.label}</span>
                </div>
                {l.to === "/messages/inbox" && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 text-red-600 mt-8"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </aside>

      {/* Sidebar (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Panel */}
          <div className="relative flex flex-col bg-white w-64 p-6 z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 p-2 rounded hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex justify-center mb-10">
              <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
            </div>
            <nav className="space-y-2 flex-1">
              {roleLinks.map((l) => {
                const Icon = l.icon;
                const active = location.pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                      active
                        ? "bg-[#F6F9FF] text-[#1E376E] shadow-sm"
                        : "text-gray-600 hover:bg-[#F6F9FF]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-[#1E376E]" />
                      <span>{l.label}</span>
                    </div>
                    {l.to === "/messages/inbox" && unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 text-red-600 mt-8"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded hover:bg-gray-100"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-[#1E376E]">{title}</h1>
          </div>
          <div className="flex items-center gap-6">
            <NotificationBell />
            <div className="text-sm text-gray-600">
              Role: <span className="font-semibold">{role}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
