// src/pages/sp/MyApplications.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
const API_URL = import.meta.env.VITE_API_URL;

export default function MyApplications() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tasks/my-applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setTasks(data);
        } else {
          console.error("Error:", data.msg);
        }
      } catch (err) {
        console.error("Fetch applications error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [token]);

  if (loading) {
    return (
      <DashboardLayout title="My Applications">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          <span className="ml-3 text-[var(--color-text-secondary)]">Loading applications...</span>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusConfig = (status) => {
    switch(status) {
      case "published": return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: Clock };
      case "in-progress": return { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: Clock };
      case "completed": return { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle };
      case "withdrawn": return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: XCircle };
      default: return { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300", icon: Clock };
    }
  };

  return (
    <DashboardLayout title="My Applications">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">My Applications</h1>
            <p className="text-sm text-[var(--color-text-muted)]">{tasks.length} application{tasks.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-12 text-center">
            <div className="w-16 h-16 bg-[var(--color-bg-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">No applications yet</h3>
            <p className="text-[var(--color-text-secondary)] mb-6">You haven't applied to any tasks yet. Browse available tasks to get started.</p>
            <Link
              to="/browse-tasks"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E96435] to-[#FF7A50] text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              Browse Tasks
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {tasks.map((task) => {
              const statusConfig = getStatusConfig(task.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={task._id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:shadow-lg transition-all p-6"
                >
                  <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2 line-clamp-1">
                    {task.title}
                  </h2>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">{task.summary}</p>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {task.status?.replace('-', ' ')}
                  </span>

                  <div className="flex justify-end mt-4 pt-4 border-t border-[var(--color-border)]">
                    <Link
                      to={`/tasks/${task._id}`}
                      className="text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] font-semibold text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
