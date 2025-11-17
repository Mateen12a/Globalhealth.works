// src/pages/tasks/TaskDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Layers,
  Target,
  FileText,
  Edit3,
  Paperclip,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";
import ProposalModal from "../../components/proposals/ProposalModal";
import FeedbackForm from "../../components/FeedbackForm";
import FeedbackList from "../../components/FeedbackList";
import EditTaskModal from "../../components/tasks/EditTaskModal";
import PublicProfileModal from "../../components/profile/PublicProfileModal";
import { Briefcase } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL;

export default function TaskDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  let currentUserId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      currentUserId = decoded.id || decoded._id;
    } catch (err) {
      console.error("Token decode error:", err);
    }
  }

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [myProposal, setMyProposal] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState(null);

  // === Fetch Task ===
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setTask(data);
      } catch (err) {
        console.error("Error fetching task:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, token]);

  // === Fetch Proposals ===
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        if (["taskOwner", "admin"].includes(role)) {
          const res = await fetch(`${API_URL}/api/proposals/task/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && Array.isArray(data)) setProposals(data);
        } else if (role === "solutionProvider") {
          const res = await fetch(`${API_URL}/api/proposals/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data && data._id) setMyProposal(data);
        }
      } catch (err) {
        console.error("Error fetching proposals:", err);
      }
    };
    fetchProposals();
  }, [id, token, role]);

  // === Update Task Status ===
  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setTask(data.task);
        alert(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // === Handle Proposal Accept/Reject ===
  const handleProposalAction = async (proposalId, action) => {
    try {
      const res = await fetch(`${API_URL}/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setProposals((prev) =>
          prev.map((p) =>
            p._id === proposalId ? { ...p, status: data.proposal.status } : p
          )
        );
        alert(`Proposal ${action}ed`);
      } else {
        alert(data.msg || "Error updating proposal");
      }
    } catch (err) {
      console.error(`${action} error:`, err);
    }
  };

  // === Start or continue conversation (SIMPLIFIED) ===
  const startConversation = async (toUserId, taskId = null, proposalId = null) => {
      try {
        // 🚨 SIMPLIFICATION: Directly call the backend's "find or create" endpoint.
        // The backend should return the existing or newly created conversation.
        const res = await fetch(`${API_URL}/api/conversations/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ toUserId, taskId, proposalId }),
        });

        const data = await res.json();
        if (res.ok) {
          // The server is expected to return the new/existing conversation object with a primary key, usually _id
          navigate(`/chat/${data._id}`);
        } else {
          alert(data.msg || "Error starting conversation");
        }
      } catch (err) {
        console.error("Conversation error:", err);
        alert("Could not start conversation.");
      }
    };

  if (loading) return <p className="text-center p-8">Loading...</p>;
  if (!task) return <p className="text-center p-8">Task not found</p>;

  // Helper to format roles
const formatRole = (role) => {
  if (!role) return "";
  switch (role) {
    case "taskOwner":
      return "Task Owner";
    case "solutionProvider":
      return "Solution Provider";
    case "admin":
      return "Admin";
    default:
      return role;
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#EEF2F7] p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1E376E]">{task.title}</h1>
            <p className="text-gray-600 mt-1">{task.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {role === "taskOwner" && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#357FE9] to-[#1E376E] text-white rounded-lg text-sm hover:opacity-90"
              >
                <Edit3 className="w-4 h-4" /> Edit Task
              </button>
            )}
          </div>
        </div>

        {role === "admin" && (
          <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16">
                    <img
                      src={task.owner.profileImage?.startsWith("http") ? task.owner.profileImage : `${API_URL}${task.owner.profileImage}`}
                      alt={`${task.owner.firstName} ${task.owner.lastName}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#1e3a8a] shadow"
                    />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      {task.owner.firstName} {task.owner.lastName}
                    </h1>

                    <p className="text-gray-600 flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> {formatRole(task.owner.role)}
                    </p>
                  </div>
          </div>
        )}
        {/* Description */}
        <div className="border-t border-gray-100 pt-5 mb-6">
          <h2 className="text-xl font-semibold text-[#357FE9] flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-[#357FE9]" /> Description
          </h2>
          <p className="text-gray-700 leading-relaxed">{task.description}</p>
        </div>

        {/* Task Meta */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            { icon: Layers, label: "Required Expertise", val: task.requiredSkills?.join(", ") },
            { icon: Target, label: "Focus Area", val: task.focusAreas?.join(", ") },
            { icon: Clock, label: "Duration", val: task.duration || "Not specified" },
            { icon: CalendarDays, label: "Expected Start Date", val: task.startDate ? new Date(task.startDate).toLocaleDateString() : "Not specified" },
          ].map((info, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-sm transition">
              <div className="flex items-center gap-2 text-[#1E376E] font-semibold mb-1">
                <info.icon className="w-4 h-4 text-[#E96435]" /> {info.label}
              </div>
              <p className="text-gray-700 text-sm">{info.val}</p>
            </div>
          ))}
        </div>

        {/* Attachments */}
        {task.attachments?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#1E376E] flex items-center gap-2 mb-3">
              <Paperclip className="w-5 h-5 text-[#E96435]" /> Attachments
            </h2>
            <div className="space-y-2">
              {task.attachments.map((a, i) => {
                const fileUrl = a.startsWith("http") ? a : `${API_URL}${a}`;
                const fileName = a.split("/").pop();
                return (
                  <a
                    key={i}
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition"
                  >
                    <span className="truncate text-sm text-gray-700">{fileName}</span>
                    <span className="text-sm text-[#357FE9] font-medium">View →</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Status */}
      <div className="bg-gray-50 border p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-[#1E376E] mb-2">Task Status</h3>
        <p className="mb-4">
          Current status:{" "}
          <span
            className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{
              backgroundColor:
                task.status === "published"
                  ? "#357FE933"
                  : task.status === "in-progress"
                  ? "#F7B52633"
                  : task.status === "completed"
                  ? "#16a34a33"
                  : task.status === "withdrawn"
                  ? "#ef444433"
                  : "#e5e7eb",
              color:
                task.status === "published"
                  ? "#357FE9"
                  : task.status === "in-progress"
                  ? "#F7B526"
                  : task.status === "completed"
                  ? "#16a34a"
                  : task.status === "withdrawn"
                  ? "#ef4444"
                  : "#374151",
            }}
          >
            {task.status}
          </span>
        </p>

        {role === "taskOwner" && (
          <select
            value={task.status}
            onChange={(e) => updateStatus(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        )}
      </div>

        {/* ✅ Proposals Section */}
        {(role === "taskOwner" || role === "admin") && (
          <div className="border-t pt-6 mb-8">
            <h3 className="text-xl font-semibold text-[#1E376E] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#357FE9]" /> Submitted Proposals
            </h3>
            {proposals.length === 0 ? (
              <p className="text-gray-600 text-sm">No proposals submitted yet.</p>
            ) : (
              <ul className="space-y-4">
                {proposals.map((p) => (
                  <li key={p._id} className="p-4 bg-gray-50 rounded-lg border hover:shadow transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[#1E376E]">
                          {p.fromUser?.firstName} {p.fromUser?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{p.message}</p>
                        {p.attachments?.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-600">Attachments:</span>
                            <ul className="list-disc ml-5">
                              {p.attachments.map((a, i) => (
                                <li key={i}>
                                  <a
                                    href={a.startsWith("http") ? a : `${API_URL}${a}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#357FE9] underline text-sm"
                                  >
                                    View
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <div className="text-xs text-gray-500">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startConversation(p.fromUser?._id, task?._id, p._id)}
                            className="flex items-center gap-1 px-3 py-1 bg-[#1E376E] text-white rounded text-xs hover:bg-[#142851]"
                          >
                            <MessageSquare className="w-3 h-3" /> Message
                          </button>
                          <button
                            onClick={() => setViewingProfileId(p.fromUser?._id)}
                            className="
                              text-xs font-medium 
                              text-white 
                              bg-gradient-to-r from-[#1f416f] to-[#1ba0a0] 
                              px-3 py-1.5 
                              rounded-lg 
                              shadow-sm 
                              hover:shadow-md 
                              hover:scale-105 
                              transition-all duration-200 ease-in-out
                            "
                          >
                            View Profile
                          </button>

                        </div>
                        {p.status === "pending" && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleProposalAction(p._id, "accept")}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                              <CheckCircle className="w-3 h-3" /> Accept
                            </button>
                            <button
                              onClick={() => handleProposalAction(p._id, "reject")}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        )}
                        <span className="text-xs font-semibold capitalize mt-1 text-gray-700">
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ✅ SP Actions */}
        {role === "solutionProvider" && (
          <div className="mt-6">
            {myProposal?.status === "accepted" ? (
              <p className="text-green-600 font-semibold text-center">
                ✅ You’ve been accepted for this task!
              </p>
            ) : myProposal ? (
              <button
                disabled
                className="w-full bg-gray-200 text-gray-600 py-3 rounded-lg cursor-not-allowed"
              >
                Proposal already submitted
              </button>
            ) : (
              <button
                onClick={() => setShowProposalModal(true)}
                className="w-full bg-gradient-to-r from-[#E96435] to-[#FF7A50] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Submit Proposal
              </button>
            )}
          </div>
        )}

        {/* ✅ Feedback Section */}
        {task.status === "completed" && (
          <div className="mt-10 border-t pt-6">
            <h2 className="text-xl font-semibold text-[#1E376E] mb-4">
              Feedback
            </h2>
            {(role === "taskOwner" || role === "solutionProvider" || role === "admin") && (
              <FeedbackForm taskId={task._id} />
            )}
            <FeedbackList userId={task.createdBy?._id} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showProposalModal && (
        <ProposalModal
          taskId={id}
          onClose={() => setShowProposalModal(false)}
          onSubmitted={(newProposal) => {
            setProposals((prev) => [...prev, newProposal]);
            setMyProposal(newProposal);
            setShowProposalModal(false);
          }}
        />
      )}
      {showEditModal && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updatedTask) => setTask(updatedTask)}
        />
      )}
      {viewingProfileId && (
        <PublicProfileModal
          userId={viewingProfileId}
          onClose={() => setViewingProfileId(null)}
        />
      )}
    </div>
  );
}
