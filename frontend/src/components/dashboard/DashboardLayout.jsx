import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, LogOut, User, Grid, Clipboard, Users, Settings, X,
  MessageSquare, PlusCircle, FolderOpen, BarChart2, ChevronLeft, ChevronRight,
} from "lucide-react";
import NotificationBell from "../NotificationBell";
import logo from "../../assets/logo.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function DashboardLayout({ children, role: propRole, title }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [collapsed,        setCollapsed]        = useState(() => {
    try { return localStorage.getItem("sidebar-collapsed") === "true"; } catch { return false; }
  });
  const [unreadCount,        setUnreadCount]        = useState(0);
  const [applicationsCount,  setApplicationsCount]  = useState(0);
  const [availableTasksCount,setAvailableTasksCount]= useState(0);
  const [user,               setUser]               = useState(null);

  const token      = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const localRole  = propRole || localStorage.getItem("role") || storedUser.role || "user";

  const normalizeRole = (r) => {
    if (!r) return "User";
    const lower = r.toLowerCase();
    if (lower.includes("task"))     return "Task Owner";
    if (lower.includes("solution")) return "Solution Provider";
    if (lower.includes("admin"))    return "Admin";
    return "User";
  };

  const role = normalizeRole(localRole);

  const getFirstName = (u) =>
    u?.firstName || u?.first_name || u?.name?.split(" ")[0] || "User";

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem("sidebar-collapsed", String(next)); } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (!token) { navigate("/login", { replace: true }); return; }

    const pathname = location.pathname.toLowerCase();
    if (role === "Task Owner") {
      if (pathname.includes("/dashboard/sp") || pathname.includes("/dashboard/admin") || pathname.includes("/admin/"))
        { navigate("/dashboard/to", { replace: true }); return; }
    } else if (role === "Solution Provider") {
      if (pathname.includes("/dashboard/to") || pathname.includes("/dashboard/admin") || pathname.includes("/admin/"))
        { navigate("/dashboard/sp", { replace: true }); return; }
    } else if (role === "Admin") {
      if (pathname.includes("/dashboard/to") || pathname.includes("/dashboard/sp"))
        { navigate("/dashboard/admin", { replace: true }); return; }
    }

    fetch(`${API_URL}/api/messages/unread/count`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setUnreadCount(d.unreadCount || d.count || 0)).catch(() => setUnreadCount(0));

    if (role === "Solution Provider") {
      fetch(`${API_URL}/api/proposals/my-stats`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setApplicationsCount(d.applied || 0)).catch(() => setApplicationsCount(0));
      fetch(`${API_URL}/api/tasks/available-count`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setAvailableTasksCount(d.count || 0)).catch(() => setAvailableTasksCount(0));
    }

    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, [token, location.pathname, role, navigate]);

  const logout = () => {
    ["token", "role", "user"].forEach(k => localStorage.removeItem(k));
    navigate("/login", { replace: true });
  };

  const roleLinks =
    role === "Admin"
      ? [
          { to: "/dashboard/admin", label: "Overview",      icon: Grid         },
          { to: "/admin/users",     label: "Manage Users",  icon: Users        },
          { to: "/admin/tasks",     label: "Manage Tasks",  icon: Clipboard    },
          { to: "/admin/proposals", label: "Proposals",     icon: FolderOpen   },
          { to: "/admin/analytics", label: "Analytics",     icon: BarChart2    },
          { to: "/messages",        label: "Messages",      icon: MessageSquare},
          { to: "/settings",        label: "Settings",      icon: Settings     },
        ]
      : role === "Task Owner"
      ? [
          { to: "/dashboard/to",    label: "My Tasks",      icon: FolderOpen   },
          { to: "/tasks/create",    label: "Create Task",   icon: PlusCircle   },
          { to: "/messages",        label: "Messages",      icon: MessageSquare},
          { to: "/profile",         label: "Profile",       icon: User         },
          { to: "/settings",        label: "Settings",      icon: Settings     },
        ]
      : [
          { to: "/dashboard/sp",    label: "Available Tasks",   icon: Clipboard    },
          { to: "/browse-tasks",    label: "Browse All Tasks",  icon: FolderOpen   },
          { to: "/my-applications", label: "My Applications",   icon: Users        },
          { to: "/messages",        label: "Messages",          icon: MessageSquare},
          { to: "/profile",         label: "Profile",           icon: User         },
          { to: "/settings",        label: "Settings",          icon: Settings     },
        ];

  /* ── Shared sidebar content ── */
  const SidebarContent = ({ forceExpanded = false }) => {
    const isCollapsed = !forceExpanded && collapsed;
    return (
      <div
        className="flex flex-col bg-[var(--color-surface)] h-full border-r border-[var(--color-border)] relative"
        style={{ width: isCollapsed ? 64 : 256, transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)" }}
      >
        {/* Logo / close */}
        <div className={`flex items-center border-b border-[var(--color-border)] ${isCollapsed ? "justify-center py-4" : "justify-between px-5 py-4"}`}>
          {!isCollapsed && (
            <Link to="/" className="block flex-1 mr-2">
              <div className="bg-white rounded-xl px-3 py-2 inline-block">
                <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
              </div>
            </Link>
          )}
          {/* Mobile close */}
          {forceExpanded && (
            <button onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors">
              <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
            </button>
          )}
          {/* Collapsed logo icon */}
          {isCollapsed && (
            <Link to="/">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
                <span className="text-white font-black text-sm">G</span>
              </div>
            </Link>
          )}
        </div>

        {/* User tag */}
        {!isCollapsed && (
          <div className="mx-3 mt-4 mb-2 px-3 py-2.5 rounded-xl bg-[var(--color-bg-secondary)]">
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">{role}</p>
            <p className="text-sm font-semibold text-[var(--color-text)] mt-0.5 truncate">
              {user?.title ? `${user.title} ${getFirstName(user)}` : getFirstName(user)}
            </p>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center mt-4 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white font-bold text-sm">
              {getFirstName(user)?.[0]?.toUpperCase() || "?"}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className={`flex-1 space-y-0.5 overflow-y-auto ${isCollapsed ? "px-2 mt-2" : "px-3 mt-1"}`}>
          {roleLinks.map((l) => {
            const Icon   = l.icon;
            const active = location.pathname === l.to;
            /* badge value */
            const badge = l.to === "/messages"        && unreadCount        > 0 ? unreadCount
                        : l.to === "/my-applications" && applicationsCount  > 0 ? applicationsCount
                        : l.to === "/dashboard/sp"    && availableTasksCount> 0 ? availableTasksCount
                        : null;

            return (
              <div key={l.to} className="relative group">
                <Link
                  to={l.to}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? l.label : undefined}
                  className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150
                    ${isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"}
                    ${active
                      ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white shadow-md"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
                    }`}
                >
                  <div className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : ""}`} />
                    {!isCollapsed && <span>{l.label}</span>}
                  </div>
                  {!isCollapsed && badge && (
                    <span className={`text-white text-xs font-bold px-2 py-0.5 rounded-full
                      ${active ? "bg-white/30" : l.to === "/dashboard/sp" ? "bg-green-500" : "bg-[var(--color-accent)]"}`}>
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </Link>

                {/* Collapsed tooltip label */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                    bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg whitespace-nowrap
                    opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50"
                    style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
                    {l.label}
                    {badge && <span className="ml-1.5 bg-[var(--color-accent)] text-white px-1.5 py-0.5 rounded-full text-[10px]">{badge > 99 ? "99+" : badge}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className={`border-t border-[var(--color-border)] ${isCollapsed ? "px-2 py-3" : "px-3 py-4"}`}>
          <div className="relative group">
            <button
              onClick={logout}
              title={isCollapsed ? "Log out" : undefined}
              className={`flex items-center rounded-xl text-sm font-medium hover:bg-red-50 text-red-500 transition-colors w-full
                ${isCollapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"}`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Log out</span>}
            </button>
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg whitespace-nowrap
                opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Log out
              </div>
            )}
          </div>
        </div>

        {/* Desktop collapse toggle — pinned at bottom edge */}
        {!forceExpanded && (
          <button
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center
              bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md
              hover:bg-[var(--color-bg-secondary)] transition-all z-20 hidden md:flex"
          >
            {collapsed
              ? <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
              : <ChevronLeft  className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
            }
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">

      {/* Desktop sidebar — animated width */}
      <motion.aside
        className="hidden md:flex flex-shrink-0 relative"
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full z-50">
              <SidebarContent forceExpanded />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors">
              <Menu className="w-5 h-5 text-[var(--color-text-secondary)]" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text)]">{title}</h1>
              <p className="text-xs text-[var(--color-text-muted)] hidden sm:block">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-[var(--color-border)]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white font-semibold">
                {getFirstName(user)?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {user?.title ? `${user.title} ${getFirstName(user)}` : getFirstName(user)}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
