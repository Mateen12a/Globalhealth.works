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

const API_URL = import.meta.env.VITE_API_URL;

/**
 * DashboardLayout.jsx
 * Handles dynamic role-based sidebar navigation, layout consistency,
 * and responsive sidebar behavior for all roles.
 */
export default function DashboardLayout({ children, role: propRole, title }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const localRole = propRole || localStorage.getItem("role") || storedUser.role || "user";

  /** 🔹 Normalize role labels */
  const normalizeRole = (r) => {
    if (!r) return "User";
    const lower = r.toLowerCase();
    if (lower.includes("task")) return "Task Owner";
    if (lower.includes("solution")) return "Solution Provider";
    if (lower.includes("admin")) return "Admin";
    return "User";
  };

  const role = normalizeRole(localRole);

  /** 🔹 Derive first name for greeting */
  const getFirstName = (u) =>
    u?.firstName || u?.first_name || u?.name?.split(" ")[0] || "User";

  /** 🔹 Fetch unread count + ensure access control */
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Redirect cross-dashboard access
    const pathname = location.pathname.toLowerCase();
    if (role === "Task Owner" && pathname.includes("/dashboard/sp"))
      navigate("/dashboard/to", { replace: true });
    else if (role === "Solution Provider" && pathname.includes("/dashboard/to"))
      navigate("/dashboard/sp", { replace: true });

    // Fetch unread messages
    fetch(`${API_URL}/api/messages/unread/count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.count || 0))
      .catch(() => setUnreadCount(0));

    // Load user
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, [token, location.pathname, role, navigate]);

  /** 🔹 Logout */
  const logout = () => {
    ["token", "role", "user"].forEach((k) => localStorage.removeItem(k));
    navigate("/login", { replace: true });
  };

  /** 🔹 Role-based sidebar links */
  const roleLinks =
    role === "Admin"
      ? [
          { to: "/dashboard/admin", label: "Overview", icon: Grid },
          { to: "/admin/users", label: "Manage Users", icon: Users },
          { to: "/admin/tasks", label: "Manage Tasks", icon: Clipboard },
          { to: "/inbox", label: "Messages", icon: User },
          { to: "/profile", label: "Settings", icon: Settings },
        ]
      : role === "Task Owner"
      ? [
          { to: "/dashboard/to", label: "My Tasks", icon: Clipboard },
          { to: "/tasks/create", label: "Create Task", icon: Clipboard },
          { to: "/inbox", label: "Messages", icon: User },
          { to: "/profile", label: "Settings", icon: Settings },
        ]
      : [
          { to: "/dashboard/sp", label: "Available Tasks", icon: Clipboard },
          { to: "/my-applications", label: "My Applications", icon: Users },
          { to: "/inbox", label: "Messages", icon: User },
          { to: "/profile", label: "Settings", icon: Settings },
        ];

  /** 🔹 Sidebar Component */
  const SidebarContent = () => (
    <div className="flex flex-col bg-white h-full border-r w-64 p-6">
      <div className="flex justify-center mb-6">
        <img src={logo} alt="Logo" className="h-14 w-auto object-contain" />
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1.5 rounded hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
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
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 text-red-600 mt-8 transition"
      >
        <LogOut className="w-5 h-5" />
        <span>Log out</span>
      </button>
    </div>
  );

  /** 🔹 Final Layout */
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div
            className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main Content */}
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
            <div className="text-right">
              <p className="text-sm font-semibold text-[#1E376E]">
                Welcome,{" "}
                {user?.title ? `${user.title} ${getFirstName(user)}` : getFirstName(user)}
              </p>
              <p className="text-xs text-gray-500 italic">{role}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
