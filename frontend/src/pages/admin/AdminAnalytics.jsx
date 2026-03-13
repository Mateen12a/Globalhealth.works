import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";
import {
  TrendingUp, BarChart2, Globe, RefreshCw
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const API_URL = import.meta.env.VITE_API_URL;

const P = {
  primary: "#1E376E", blue: "#357FE9", orange: "#E96435", amber: "#F7B526",
  green: "#34A853",   yellow: "#F59E0B", red: "#EF4444", purple: "#8B5CF6",
  teal: "#14B8A6",    pink: "#EC4899",  indigo: "#6366F1", cyan: "#06B6D4",
};

const PERIODS = [
  { label: "7D",  value: "7d",  full: "Last 7 Days"   },
  { label: "30D", value: "30d", full: "Last 30 Days"  },
  { label: "90D", value: "90d", full: "Last 90 Days"  },
  { label: "6M",  value: "6m",  full: "Last 6 Months" },
  { label: "1Y",  value: "1y",  full: "Last Year"     },
  { label: "All", value: "all", full: "All Time"      },
];

const USER_TYPES = [
  { label: "All", value: "all"              },
  { label: "SPs", value: "solutionProvider" },
  { label: "TOs", value: "taskOwner"        },
];

const STATUS_COLORS = {
  published: P.blue, draft: "#94a3b8",
  "in-progress": P.yellow, completed: P.green, withdrawn: "#fb7185",
};

/* ════════════════════════════════
   Reusable primitives
════════════════════════════════ */

const Glass = ({ children, className = "", accent, tint }) => (
  <div className={`relative rounded-2xl overflow-hidden ${className}`}
    style={{
      background: tint ? tint : "rgba(255,255,255,0.65)",
      backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
      border: "1px solid rgba(255,255,255,0.78)",
      boxShadow: "0 4px 24px rgba(30,55,110,0.08), inset 0 1px 0 rgba(255,255,255,0.92)",
    }}>
    {accent && (
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${accent}00, ${accent}dd, ${accent}00)` }} />
    )}
    {children}
  </div>
);

const CardHeader = ({ title, subtitle, badge, accent = P.primary }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h3 className="text-[13px] font-bold text-[var(--color-text)] leading-tight">{title}</h3>
      {subtitle && <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-tight">{subtitle}</p>}
    </div>
    {badge && (
      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full ml-2 flex-shrink-0"
        style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}22` }}>
        {badge}
      </span>
    )}
  </div>
);

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(15,23,42,0.93)", backdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
      padding: "10px 14px", minWidth: 130, boxShadow: "0 20px 40px rgba(0,0,0,0.28)",
    }}>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{label}</p>
      {payload.map((e, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{e.name}:</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 12, marginLeft: "auto", paddingLeft: 6 }}>{(e.value||0).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const Skeleton = ({ className = "" }) => <div className={`animate-pulse rounded-xl bg-white/40 ${className}`} />;

const ProgressRow = ({ label, value, total, color, rank }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-[11px] font-bold tabular-nums w-4 text-right" style={{ color: `${color}80` }}>{rank}</span>
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-[12px] font-medium text-[var(--color-text)] flex-1 truncate">{label}</span>
      <div className="w-24 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: `${color}12` }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
      <span className="text-[12px] font-bold tabular-nums w-6 text-right" style={{ color }}>{value}</span>
    </div>
  );
};

const FunnelStep = ({ label, value, color, pct, isLast }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl mb-1"
      style={{ background: `${color}0c`, border: `1px solid ${color}15` }}>
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-[12px] text-[var(--color-text-secondary)] flex-1">{label}</span>
      <span className="text-[13px] font-bold" style={{ color }}>{value?.toLocaleString()}</span>
      {pct !== undefined && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
        style={{ background: `${color}15`, color }}>{pct}%</span>}
    </div>
    {!isLast && <div className="w-px h-3 my-0.5" style={{ background: `linear-gradient(${color}40, transparent)` }} />}
  </div>
);

/* ════════════════════════════════
   Hero Showcase Card
════════════════════════════════ */
const HeroShowcase = ({ data, userType, selPeriod }) => {
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const headlineValue = userType === "solutionProvider" ? data.summary?.totalSP
    : userType === "taskOwner" ? data.summary?.totalTO
    : data.summary?.totalUsers;

  const headlineLabel = userType === "solutionProvider" ? "Solution Providers"
    : userType === "taskOwner" ? "Task Owners"
    : "Platform Users";

  const stats = userType === "solutionProvider"
    ? [
        { label: "Registered",     value: data.summary?.totalSP,           note: "Solution Providers" },
        { label: "New This Period", value: data.summary?.newUsersThisPeriod,note: selPeriod?.full },
        { label: "Tasks Available", value: data.summary?.totalTasks,        note: "Published on Platform" },
        { label: "Proposals Sent",  value: data.proposals?.total,           note: "All Submissions" },
      ]
    : userType === "taskOwner"
    ? [
        { label: "Registered",       value: data.summary?.totalTO,           note: "Task Owners" },
        { label: "New This Period",  value: data.summary?.newUsersThisPeriod,note: selPeriod?.full },
        { label: "Tasks Created",    value: data.summary?.totalTasks,        note: "On Platform" },
        { label: "Proposals Received",value: data.proposals?.total,          note: "All Responses" },
      ]
    : [
        { label: "Total Users",    value: data.summary?.totalUsers,          note: "Registered" },
        { label: "Solution Providers",value: data.summary?.totalSP,          note: "On Platform" },
        { label: "Task Owners",    value: data.summary?.totalTO,             note: "On Platform" },
        { label: "Tasks Created",  value: data.summary?.totalTasks,          note: "All Time" },
      ];

  const accentColors = [P.orange, P.blue, P.green, P.purple];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
      <div className="relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #1E376E 45%, #1a4a9e 75%, #1e56c4 100%)",
          boxShadow: "0 24px 64px rgba(30,55,110,0.38), 0 4px 16px rgba(0,0,0,0.18)",
        }}>
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 right-0 w-96 h-96 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #357FE9 0%, transparent 68%)" }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #E96435 0%, transparent 70%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hgrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hgrid)" />
          </svg>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ background: "linear-gradient(135deg, white 0%, transparent 55%)" }} />
        </div>

        <div className="relative z-10 p-5 sm:p-10">
          {/* Branding row */}
          <div className="flex items-start justify-between mb-5 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <BarChart2 size={12} color="white" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase"
                  style={{ color: "rgba(255,255,255,0.55)" }}>
                  Global Health Works
                </span>
              </div>
              <p className="text-[10px] ml-8 tracking-wide hidden sm:block"
                style={{ color: "rgba(255,255,255,0.3)" }}>Platform Analytics Report</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] sm:text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>{dateStr}</p>
              <p className="text-[10px] mt-0.5 hidden sm:block" style={{ color: "rgba(255,255,255,0.3)" }}>{selPeriod?.full}</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-5 sm:mb-8">
            <p className="text-[10px] sm:text-[12px] font-medium tracking-widest uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
              {userType === "all" ? "Total Registered" : userType === "solutionProvider" ? "Total Solution Providers" : "Total Task Owners"}
            </p>
            <div className="flex items-end gap-3 flex-wrap">
              <span className="font-black leading-none"
                style={{ fontSize: "clamp(36px, 7vw, 76px)", color: "#fff", letterSpacing: "-0.03em",
                  textShadow: "0 4px 24px rgba(53,127,233,0.45)" }}>
                {typeof headlineValue === "number" ? headlineValue.toLocaleString() : "—"}
              </span>
              {data.summary?.newUsersThisPeriod > 0 && (
                <div className="mb-1 flex items-center gap-1.5 px-2 py-1 rounded-full"
                  style={{ background: "rgba(52,168,83,0.18)", border: "1px solid rgba(52,168,83,0.3)" }}>
                  <TrendingUp size={10} color="#4ade80" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-green-400">
                    +{data.summary.newUsersThisPeriod.toLocaleString()} {selPeriod?.full?.toLowerCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mb-5 sm:mb-8"
            style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.16), rgba(255,255,255,0.04))" }} />

          {/* 4-stat grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-0 sm:divide-x divide-white/10">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06 }}
                className="sm:px-6 sm:first:pl-0 sm:last:pr-0">
                <div className="h-0.5 w-6 sm:w-8 rounded-full mb-2.5 opacity-80"
                  style={{ background: accentColors[i] }} />
                <p className="font-black leading-none mb-1 tabular-nums"
                  style={{ fontSize: "clamp(20px, 3vw, 34px)", color: "#fff", letterSpacing: "-0.02em" }}>
                  {typeof s.value === "number" ? s.value.toLocaleString() : "—"}
                </p>
                <p className="text-[11px] sm:text-[12px] font-semibold leading-tight" style={{ color: "rgba(255,255,255,0.72)" }}>{s.note}</p>
                <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "rgba(255,255,255,0.32)" }}>{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Footer strip — countries + watermark only */}
          <div className="mt-5 sm:mt-8 pt-4 sm:pt-5 border-t flex flex-wrap items-center gap-2"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {data.countryBreakdown?.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Globe size={11} color="#c084fc" />
                <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {data.countryBreakdown.length} {userType === "solutionProvider" ? "SP" : userType === "taskOwner" ? "TO" : "User"} Countries
                </span>
              </div>
            )}
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.28)" }}>globalhealth.works</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ════════════════════════════════
   Main Component
════════════════════════════════ */
export default function AdminAnalytics() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [period,      setPeriod]      = useState("90d");
  const [userType,    setUserType]    = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);
  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/admin/analytics?period=${period}&userType=${userType}`,
        { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e) { console.error("Analytics fetch error:", e); }
    finally { setLoading(false); }
  }, [period, userType, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const selPeriod = PERIODS.find(p => p.value === period);
  const selType   = USER_TYPES.find(t => t.value === userType);

  const acceptRate   = data?.proposals?.total > 0
    ? Math.round((data.proposals.accepted / data.proposals.total) * 100) : 0;
  const approvalRate = data
    ? Math.round(((data.approvalStatus?.find(s => s.name === "Approved")?.value || 0) /
        Math.max(data.approvalStatus?.reduce((s, d) => s + d.value, 0), 1)) * 100)
    : 0;

  const formatTime = (d) => d
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  /* ─ Background ─ */
  const Bg = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-25"
        style={{ background: `radial-gradient(circle, ${P.blue}22 0%, transparent 70%)` }} />
      <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full opacity-15"
        style={{ background: `radial-gradient(circle, ${P.purple}33 0%, transparent 70%)` }} />
      <svg className="absolute inset-0 w-full h-full opacity-[0.022]" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="bgrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={P.primary} strokeWidth="1"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#bgrid)" />
      </svg>
    </div>
  );

  return (
    <DashboardLayout role="admin" title="Platform Analytics">
      <div className="relative -m-6 min-h-screen"
        style={{ background: "linear-gradient(150deg, #EDF2FB 0%, #E8EDF7 50%, #EEF1FA 100%)" }}>
        <Bg />

        <div className="relative z-10 p-4 sm:p-6 space-y-5">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3">
            {/* Title row */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${P.primary}15`, border: `1px solid ${P.primary}22` }}>
                    <BarChart2 size={15} style={{ color: P.primary }} />
                  </div>
                  <h1 className="text-[17px] sm:text-[19px] font-black tracking-tight" style={{ color: "#0f172a" }}>
                    Platform Analytics
                  </h1>
                </div>
                <p className="text-[11px] sm:text-[12px] text-[var(--color-text-muted)] pl-10">
                  {selPeriod?.full} · {selType?.label === "All" ? "All user types" : selType?.label}
                  {lastUpdated && <span className="hidden sm:inline"> · Updated {formatTime(lastUpdated)}</span>}
                </p>
              </div>
              {/* Refresh — always visible on right */}
              <button onClick={fetchData}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)", color: "#64748b", boxShadow: "0 2px 10px rgba(30,55,110,0.07)" }}>
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Filter controls row — scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {/* User type pills */}
              <div className="flex rounded-xl p-0.5 gap-0.5 flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)", boxShadow: "0 2px 10px rgba(30,55,110,0.07)" }}>
                {USER_TYPES.map(t => {
                  const active = userType === t.value;
                  return (
                    <button key={t.value} onClick={() => setUserType(t.value)}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 whitespace-nowrap"
                      style={active
                        ? { background: P.primary, color: "#fff", boxShadow: `0 2px 8px ${P.primary}38` }
                        : { color: "#64748b" }}>
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Period pills */}
              <div className="flex rounded-xl p-0.5 gap-0.5 flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)", boxShadow: "0 2px 10px rgba(30,55,110,0.07)" }}>
                {PERIODS.map(p => {
                  const active = period === p.value;
                  return (
                    <button key={p.value} onClick={() => setPeriod(p.value)}
                      className="px-2.5 sm:px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 whitespace-nowrap"
                      style={active
                        ? { background: P.orange, color: "#fff", boxShadow: `0 2px 8px ${P.orange}38` }
                        : { color: "#64748b" }}>
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ── Skeleton ── */}
          {loading && (
            <div className="space-y-5">
              <Skeleton className="h-56 sm:h-72 w-full rounded-3xl" />
              <Skeleton className="h-48 sm:h-60 w-full" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0,1,2].map(i => <Skeleton key={i} className="h-48 sm:h-52 w-full" />)}
              </div>
            </div>
          )}

          {!loading && data && (
            <AnimatePresence mode="wait">
              <motion.div key={`${period}-${userType}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }} className="space-y-5">

                {/* ══ 1. HERO ══ */}
                <HeroShowcase data={data} userType={userType} selPeriod={selPeriod} selType={selType} />

                {/* ══ 2. GROWTH CHART ══ */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                  <Glass accent={P.blue}
                    tint="linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(235,244,255,0.7) 100%)"
                    className="p-4 sm:p-6">
                    <CardHeader accent={P.blue}
                      title="Growth Over Time"
                      subtitle={`${userType === "solutionProvider" ? "SP registrations" : userType === "taskOwner" ? "TO registrations" : "Registrations"} & task creation · ${selPeriod?.full}`}
                      badge={`${(data.summary?.newUsersThisPeriod||0)+(data.summary?.newTasksThisPeriod||0)} combined`} />
                    {data.timeline?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={data.timeline} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={P.blue}   stopOpacity={0.18} />
                              <stop offset="100%" stopColor={P.blue} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={P.orange}  stopOpacity={0.18} />
                              <stop offset="100%" stopColor={P.orange} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 4" stroke="rgba(30,55,110,0.05)" vertical={false} />
                          <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<ChartTip />} cursor={{ stroke: "rgba(53,127,233,0.12)", strokeWidth: 1 }} />
                          <Area type="monotone" dataKey="users" name={userType==="solutionProvider"?"SPs":userType==="taskOwner"?"TOs":"Users"}
                            stroke={P.blue} fill="url(#gU)" strokeWidth={2.5} dot={false}
                            activeDot={{ r: 5, strokeWidth: 0, fill: P.blue }} />
                          <Area type="monotone" dataKey="tasks" name="Tasks"
                            stroke={P.orange} fill="url(#gT)" strokeWidth={2.5} dot={false}
                            activeDot={{ r: 5, strokeWidth: 0, fill: P.orange }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-[var(--color-text-muted)] text-sm">No data for this period</div>
                    )}
                    <div className="flex items-center gap-6 mt-3 pt-3 border-t border-blue-100/60">
                      {[
                        { color: P.blue, label: userType==="solutionProvider"?"Solution Providers":userType==="taskOwner"?"Task Owners":"Users", value: data.summary?.newUsersThisPeriod },
                        { color: P.orange, label: "Tasks", value: data.summary?.newTasksThisPeriod }
                      ].map((l, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-5 h-1 rounded-full" style={{ background: l.color }} />
                          <span className="text-[11px] text-[var(--color-text-secondary)]">{l.label}</span>
                          <span className="text-[12px] font-bold tabular-nums" style={{ color: l.color }}>{l.value?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </Glass>
                </motion.div>

                {/* ══ 3. THREE-COL: Distribution / Approval / Funnel ══ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* Role donut */}
                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}>
                    <Glass accent={P.blue}
                      tint="linear-gradient(160deg, rgba(255,255,255,0.68) 0%, rgba(239,246,255,0.68) 100%)"
                      className="p-4 sm:p-5 h-full">
                      <CardHeader accent={P.blue}
                        title={userType === "solutionProvider" ? "SP Distribution" : userType === "taskOwner" ? "TO Distribution" : "User Distribution"}
                        subtitle="Role split · this period" />
                      {data.roleDistribution?.some(d => d.value > 0) ? (
                        <>
                          <ResponsiveContainer width="100%" height={155}>
                            <PieChart>
                              <Pie data={data.roleDistribution} cx="50%" cy="50%"
                                outerRadius={65} innerRadius={36} dataKey="value"
                                strokeWidth={3} stroke="rgba(255,255,255,0.9)" paddingAngle={3}>
                                {data.roleDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                              </Pie>
                              <Tooltip content={({ active, payload }) => active && payload?.length
                                ? <div style={{ background:"rgba(15,23,42,0.93)", border:"1px solid rgba(255,255,255,0.1)",
                                    borderRadius:10, padding:"8px 12px", backdropFilter:"blur(12px)" }}>
                                    <p style={{ color:"#fff", fontSize:13, fontWeight:700 }}>{payload[0].value?.toLocaleString()}</p>
                                    <p style={{ color:"rgba(255,255,255,0.45)", fontSize:11 }}>{payload[0].name}</p>
                                  </div> : null} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="space-y-1.5 mt-2">
                            {data.roleDistribution.map((d, i) => {
                              const total = data.roleDistribution.reduce((s, x) => s + x.value, 0) || 1;
                              return (
                                <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                                  style={{ background: `${d.color}08`, border: `1px solid ${d.color}12` }}>
                                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                                  <span className="text-[12px] text-[var(--color-text-secondary)] flex-1">{d.name}</span>
                                  <span className="text-[12px] font-bold" style={{ color: d.color }}>{d.value}</span>
                                  <span className="text-[10px] font-medium px-1.5 rounded" style={{ background: `${d.color}12`, color: d.color }}>
                                    {Math.round((d.value/total)*100)}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="h-40 flex items-center justify-center text-[var(--color-text-muted)] text-sm">No data</div>
                      )}
                    </Glass>
                  </motion.div>

                  {/* Approval status */}
                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37 }}>
                    <Glass accent={P.green}
                      tint="linear-gradient(160deg, rgba(255,255,255,0.68) 0%, rgba(236,253,245,0.68) 100%)"
                      className="p-4 sm:p-5 h-full">
                      <CardHeader accent={P.green}
                        title="Approval Status"
                        subtitle={`${userType === "solutionProvider" ? "SP" : userType === "taskOwner" ? "TO" : "User"} review breakdown`}
                        badge={`${approvalRate}% approved`} />
                      <div className="space-y-3.5">
                        {data.approvalStatus?.map((item, i) => {
                          const total = data.approvalStatus.reduce((s, d) => s + d.value, 0) || 1;
                          const pct   = Math.round((item.value / total) * 100);
                          return (
                            <div key={i}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                                <span className="text-[12px] font-semibold text-[var(--color-text)] flex-1">{item.name}</span>
                                <span className="text-[14px] font-black tabular-nums" style={{ color: item.color }}>{item.value.toLocaleString()}</span>
                                <span className="text-[10px] font-semibold w-7 text-right" style={{ color: `${item.color}aa` }}>{pct}%</span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden" style={{ background: `${item.color}10` }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                  transition={{ delay: 0.5 + i * 0.1, duration: 0.7, ease: "easeOut" }}
                                  className="h-full rounded-full"
                                  style={{ background: `linear-gradient(90deg, ${item.color}88, ${item.color})` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {approvalRate > 0 && (
                        <div className="mt-5 flex items-center gap-3 pt-4 border-t border-green-100/80">
                          <ResponsiveContainer width={52} height={52}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="56%" outerRadius="100%"
                              data={[{ value: approvalRate, fill: P.green }]} startAngle={90} endAngle={-270}>
                              <RadialBar background={{ fill: `${P.green}10` }} dataKey="value" cornerRadius={4} />
                            </RadialBarChart>
                          </ResponsiveContainer>
                          <div>
                            <p className="text-[20px] font-black leading-none" style={{ color: P.green }}>{approvalRate}%</p>
                            <p className="text-[11px] text-[var(--color-text-muted)]">Overall approval</p>
                          </div>
                        </div>
                      )}
                    </Glass>
                  </motion.div>

                  {/* Proposal funnel */}
                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.41 }}>
                    <Glass accent={P.purple}
                      tint="linear-gradient(160deg, rgba(255,255,255,0.68) 0%, rgba(245,243,255,0.68) 100%)"
                      className="p-4 sm:p-5 h-full">
                      <CardHeader accent={P.purple}
                        title="Proposal Funnel"
                        subtitle={`Conversion pipeline · ${selPeriod?.full}`}
                        badge={acceptRate ? `${acceptRate}% accepted` : undefined} />
                      <div className="mt-1 space-y-0">
                        <FunnelStep label="Submitted"  value={data.proposals?.total}    color={P.purple} pct={100} />
                        <FunnelStep label="Pending"    value={data.proposals?.pending}   color={P.yellow}
                          pct={data.proposals?.total > 0 ? Math.round(data.proposals.pending/data.proposals.total*100) : 0} />
                        <FunnelStep label="Accepted"   value={data.proposals?.accepted}  color={P.green} pct={acceptRate} />
                        <FunnelStep label="Withdrawn"  value={data.proposals?.withdrawn} color="#fb7185"
                          pct={data.proposals?.total > 0 ? Math.round(data.proposals.withdrawn/data.proposals.total*100) : 0} isLast />
                      </div>
                      {data.proposals?.total > 0 && (
                        <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                          style={{ background: `${P.green}0a`, border: `1px solid ${P.green}18` }}>
                          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] flex-1">Acceptance rate</span>
                          <span className="text-[15px] font-black" style={{ color: P.green }}>{acceptRate}%</span>
                        </div>
                      )}
                    </Glass>
                  </motion.div>
                </div>

                {/* ══ 4. BAR CHARTS ══ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                  {/* Task status */}
                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
                    <Glass accent={P.teal}
                      tint="linear-gradient(135deg, rgba(255,255,255,0.68) 0%, rgba(236,253,250,0.68) 100%)"
                      className="p-4 sm:p-5">
                      <CardHeader accent={P.teal}
                        title="Task Status Breakdown"
                        subtitle="Distribution across all task statuses" />
                      {data.taskStatusBreakdown?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={176}>
                          <BarChart data={data.taskStatusBreakdown} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 4" stroke="rgba(20,184,166,0.08)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(20,184,166,0.05)", radius: 6 }} />
                            <Bar dataKey="value" name="Tasks" radius={[6, 6, 2, 2]}>
                              {data.taskStatusBreakdown.map((e, i) => (
                                <Cell key={i} fill={STATUS_COLORS[e.name] || P.blue} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-44 flex items-center justify-center text-[var(--color-text-muted)] text-sm">No data</div>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-teal-100/60">
                        {Object.entries(STATUS_COLORS).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: v }} />
                            <span className="text-[11px] text-[var(--color-text-muted)] capitalize">{k.replace("-", " ")}</span>
                          </div>
                        ))}
                      </div>
                    </Glass>
                  </motion.div>

                  {/* Registration volume */}
                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
                    <Glass accent={P.indigo}
                      tint="linear-gradient(135deg, rgba(255,255,255,0.68) 0%, rgba(238,242,255,0.68) 100%)"
                      className="p-4 sm:p-5">
                      <CardHeader accent={P.indigo}
                        title={userType === "solutionProvider" ? "SP Registration Volume"
                             : userType === "taskOwner"       ? "TO Registration Volume"
                             :                                  "Registration Volume"}
                        subtitle={`Sign-ups over time · ${selPeriod?.full}`}
                        badge={`${data.summary?.newUsersThisPeriod || 0} new`} />
                      {data.timeline?.some(d => d.users > 0) ? (
                        <ResponsiveContainer width="100%" height={176}>
                          <BarChart data={data.timeline} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
                            <defs>
                              <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor={P.indigo} stopOpacity={1} />
                                <stop offset="100%" stopColor={P.indigo} stopOpacity={0.5} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 4" stroke="rgba(99,102,241,0.08)" vertical={false} />
                            <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(99,102,241,0.05)", radius: 6 }} />
                            <Bar dataKey="users" name={userType==="solutionProvider"?"SPs":userType==="taskOwner"?"TOs":"Users"}
                              fill="url(#barG)" radius={[5, 5, 2, 2]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-44 flex items-center justify-center text-[var(--color-text-muted)] text-sm">No registrations in this period</div>
                      )}
                    </Glass>
                  </motion.div>
                </div>

                {/* ══ 5. METRICS STRIP ══ */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.51 }}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Approval Rate",       value: `${approvalRate}%`,                color: P.green,  sub: "Users approved"     },
                      { label: "Proposal Acceptance", value: `${acceptRate}%`,                  color: P.blue,   sub: "Proposals accepted"  },
                      { label: "Total Proposals",     value: data.proposals?.total ?? 0,        color: P.purple, sub: selPeriod?.full       },
                      { label: "Pending Approval",    value: data.approvalStatus?.find(s=>s.name==="Pending")?.value ?? 0,
                        color: P.yellow, sub: "Awaiting review" },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.51 + i * 0.04 }}>
                        <div className="relative overflow-hidden rounded-2xl p-4"
                          style={{
                            background: `linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.5))`,
                            backdropFilter: "blur(16px)", border: `1px solid ${item.color}18`,
                            boxShadow: `0 4px 20px ${item.color}0c, inset 0 1px 0 rgba(255,255,255,0.9)`,
                          }}>
                          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                            style={{ background: item.color }} />
                          <div className="pl-3">
                            <p className="text-[19px] font-black leading-none" style={{ color: item.color }}>
                              {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                            </p>
                            <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] truncate mt-1">{item.label}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)] truncate">{item.sub}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* ══ 6. GEOGRAPHIC + ORG ══ */}
                {(data.countryBreakdown?.length > 0 || data.orgTypeBreakdown?.length > 0) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.countryBreakdown?.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }}>
                        <Glass accent={P.indigo}
                          tint="linear-gradient(145deg, rgba(255,255,255,0.68) 0%, rgba(238,242,255,0.68) 100%)"
                          className="p-4 sm:p-5">
                          <CardHeader accent={P.indigo}
                            title={userType === "solutionProvider" ? "Solution Providers by Country"
                                 : userType === "taskOwner"       ? "Task Owners by Country"
                                 :                                  "Users by Country"}
                            subtitle={userType === "solutionProvider" ? "Top countries · SP registrations"
                                    : userType === "taskOwner"        ? "Top countries · TO registrations"
                                    :                                   "Top countries · all-time registrations"}
                            badge={`${data.countryBreakdown.length} countries`} />
                          <div>
                            {data.countryBreakdown.slice(0, 8).map((item, i) => (
                              <ProgressRow key={i} label={item.name} value={item.value}
                                total={data.countryBreakdown[0]?.value || 1}
                                color={P.indigo} rank={i + 1} />
                            ))}
                          </div>
                        </Glass>
                      </motion.div>
                    )}
                    {data.orgTypeBreakdown?.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}>
                        <Glass accent={P.pink}
                          tint="linear-gradient(145deg, rgba(255,255,255,0.68) 0%, rgba(253,242,248,0.68) 100%)"
                          className="p-4 sm:p-5">
                          <CardHeader accent={P.pink}
                            title="Organization Types"
                            subtitle="Platform breakdown by organization · all-time"
                            badge={`${data.orgTypeBreakdown.length} types`} />
                          <div>
                            {data.orgTypeBreakdown.slice(0, 8).map((item, i) => {
                              const cols = [P.blue, P.orange, P.green, P.purple, P.teal, P.yellow, P.red, P.pink];
                              return (
                                <ProgressRow key={i} label={item.name} value={item.value}
                                  total={data.orgTypeBreakdown[0]?.value || 1}
                                  color={cols[i % cols.length]} rank={i + 1} />
                              );
                            })}
                          </div>
                        </Glass>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ══ 7. PLATFORM HEALTH ══ */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.61 }}>
                  <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5"
                    style={{
                      background: "linear-gradient(135deg, rgba(30,55,110,0.06) 0%, rgba(53,127,233,0.06) 100%)",
                      border: "1px solid rgba(30,55,110,0.1)",
                      backdropFilter: "blur(18px)",
                    }}>
                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, ${P.primary}00, ${P.primary}60, ${P.primary}00)` }} />
                    <CardHeader accent={P.primary}
                      title="Platform Health Summary"
                      subtitle="Computed performance ratios · all-time" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "SP : TO Ratio",   value: data.summary?.totalSP && data.summary?.totalTO ? `${(data.summary.totalSP/Math.max(data.summary.totalTO,1)).toFixed(1)} : 1` : "—", color: P.blue   },
                        { label: "Tasks per User",  value: data.summary?.totalUsers ? (data.summary.totalTasks/Math.max(data.summary.totalUsers,1)).toFixed(1) : "—", color: P.teal   },
                        { label: "Proposals / Task",value: data.summary?.totalTasks && data.proposals?.total ? (data.proposals.total/Math.max(data.summary.totalTasks,1)).toFixed(1) : "—", color: P.purple },
                        { label: "Active Tasks",    value: (data.taskStatusBreakdown?.find(s=>s.name==="in-progress")?.value||0)+(data.taskStatusBreakdown?.find(s=>s.name==="published")?.value||0), color: P.green },
                      ].map((m, i) => (
                        <div key={i} className="rounded-xl p-3.5"
                          style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${m.color}15`,
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }}>
                          <p className="text-[18px] font-black leading-none" style={{ color: m.color }}>{m.value}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-1 leading-tight">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* ══ 8. FOOTER ══ */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                  className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pb-2 text-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: P.green }} />
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Data refreshed in real-time from Database
                      {lastUpdated && <span className="hidden sm:inline"> · {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>}
                    </p>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] hidden sm:block">
                    · Adjust filters to explore growth trends
                  </p>
                </motion.div>

              </motion.div>
            </AnimatePresence>
          )}

          {/* Error */}
          {!loading && !data && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `${P.orange}12`, border: `1px solid ${P.orange}20` }}>
                <BarChart2 size={22} style={{ color: P.orange }} />
              </div>
              <p className="text-sm font-semibold text-[var(--color-text-secondary)]">Failed to load analytics</p>
              <button onClick={fetchData} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: P.primary }}>
                <RefreshCw size={13} /> Try again
              </button>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
