// src/pages/MyProposal.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";

const API_URL = import.meta.env.VITE_API_URL;

export default function MyProposals() {
  const token = localStorage.getItem("token");
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    const fetchMy = async () => {
      try {
        const res = await fetch(`${API_URL}/api/proposals/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setProposals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMy();
  }, [token]);

  const handleWithdraw = async (proposalId) => {
    if (!confirm("Are you sure you want to withdraw this proposal?")) return;
    setWithdrawingId(proposalId);
    try {
      const res = await fetch(`${API_URL}/api/proposals/${proposalId}/withdraw`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProposals(prev => prev.map(x => x._id === proposalId ? { ...x, status: 'withdrawn' } : x));
      } else {
        const d = await res.json();
        alert(d.msg || "Error withdrawing proposal");
      }
    } catch (err) {
      alert("Error withdrawing proposal");
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted':
        return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Accepted' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' };
      case 'withdrawn':
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Withdrawn' };
      default:
        return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending' };
    }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout role="Solution Provider" title="My Proposals">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--color-text-muted)]">Loading proposals...</p>
          </div>
        </div>
      ) : proposals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-bg-tertiary)] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">No Proposals Yet</h3>
          <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
            You haven't submitted any proposals yet. Browse available tasks and apply to get started!
          </p>
          <Link to="/browse-tasks" className="btn-primary inline-flex items-center gap-2">
            Browse Tasks
            <ExternalLink className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {proposals.map(p => {
            const statusConfig = getStatusConfig(p.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <motion.div
                key={p._id}
                variants={item}
                className="card p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${statusConfig.bg} flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/tasks/${p.task?._id}`} 
                          className="text-lg font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors line-clamp-1"
                        >
                          {p.task?.title || 'Task'}
                        </Link>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                          {p.message?.slice(0, 150)}{p.message?.length > 150 ? '...' : ''}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} font-medium`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                          <span className="text-[var(--color-text-muted)]">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:flex-col md:items-end">
                    <Link
                      to={`/tasks/${p.task?._id}`}
                      className="px-4 py-2 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-primary)] text-[var(--color-text)] hover:text-white rounded-lg text-sm font-medium transition-all"
                    >
                      View Task
                    </Link>
                    {p.status === "pending" && (
                      <button
                        onClick={() => handleWithdraw(p._id)}
                        disabled={withdrawingId === p._id}
                        className="px-4 py-2 border border-red-300 hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {withdrawingId === p._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : null}
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </DashboardLayout>
  );
}
