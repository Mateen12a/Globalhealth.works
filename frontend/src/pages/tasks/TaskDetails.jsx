// src/pages/tasks/TaskDetails.jsx
import { useEffect, useState, } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProposalModal from "../../components/proposals/ProposalModal";
import FeedbackForm from "../../components/FeedbackForm";
import FeedbackList from "../../components/FeedbackList";
import EditTaskModal from "../../components/tasks/EditTaskModal"; // we'll create this
import PublicProfileModal from "../../components/profile/PublicProfileModal";
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
          currentUserId = decoded.id || decoded._id; // depending on how backend encodes it
        } catch (err) {
          console.error("Failed to decode token:", err);
        }
      }


  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [proposal, setProposal] = useState([]);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState(null);

  // fetch task
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

  // fetch proposal
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await fetch(`${API_URL}/api/proposals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setProposal(data);
      } catch (err) {
        console.error("Error fetching task:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id, token]);

  // fetch proposals if owner
  useEffect(() => {
    if (role === "taskOwner") {
      const fetchProposals = async () => {
        try {
          const res = await fetch(
            `${API_URL}/api/proposals/task/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await res.json();
          if (res.ok) setProposals(data);
        } catch (err) {
          console.error("Error fetching proposals:", err);
        }
      };
      fetchProposals();
    }
  }, [id, role, token]);

  // update task status
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
      } else {
        alert(data.msg || "Error updating status");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // accept/reject proposal
  const handleProposalAction = async (proposalId, action) => {
    try {
      const res = await fetch(
        `${API_URL}/api/proposals/${proposalId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );
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

const startConversation = async (toUserId, taskId = null, proposalId = null) => {
  try {
    // 1. Check existing conversations first
    const res1 = await fetch(`${API_URL}/api/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const existing = await res1.json();

    if (res1.ok && Array.isArray(existing)) {
      const match = existing.find(
        (c) =>
          c.otherUser?._id === toUserId &&
          (taskId ? c.taskId === taskId : true) &&
          (proposalId ? c.proposalId === proposalId : true)
      );

      if (match) {
        navigate(`/chat/${match.conversationId}`);
        return;
      }
    }

    // 2. Otherwise, create a new conversation
    const res2 = await fetch(`${API_URL}/api/conversations/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ toUserId, taskId, proposalId }),
    });

    const data2 = await res2.json();
    if (res2.ok) {
      navigate(`/chat/${data2._id}`); // ✅ backend returns full convo object
    } else {
      alert(data2.msg || "Error starting conversation");
    }
  } catch (err) {
    console.error("Error starting/reusing conversation:", err);
    alert("Could not start conversation. Try again.");
  }
};




  if (loading) return <p className="p-6">Loading...</p>;
  if (!task) return <p className="p-6">Task not found</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">        
        <h1 className="text-3xl font-bold text-[#1E376E]">{task.title}</h1>
        
        <div className="flex gap-2">
          <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          ← Back
        </button>
        
        {role === "taskOwner" && (
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800"
          >
            Edit Task
          </button>
        )}
        </div>
      </div>


      <p className="text-gray-600 mb-6">{task.summary}</p>

      {/* Description */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#357FE9] mb-2">
          Description
        </h2>
        <p className="text-gray-700">{task.description}</p>
      </div>

      {/* Meta info */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow p-4 rounded-lg">
          <h3 className="font-semibold">Required Skills</h3>
          <p className="text-sm text-gray-600">
            {task.requiredSkills?.join(", ") || "Not specified"}
          </p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg">
          <h3 className="font-semibold">Focus Areas</h3>
          <p className="text-sm text-gray-600">
            {task.focusAreas?.join(", ") || "Not specified"}
          </p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg">
          <h3 className="font-semibold">Languages</h3>
          <p className="text-sm text-gray-600">
            {task.languages?.join(", ") || "Not specified"}
          </p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg">
          <h3 className="font-semibold">Funding Status</h3>
          <p className="text-sm text-gray-600">{task.fundingStatus}</p>
        </div>
      </div>

            {/* Attachments */}
          {task.attachments?.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-[#357FE9] mb-3">
                Attachments
              </h2>
              <ul className="space-y-2">
                {task.attachments.map((a, i) => {
                  const fileUrl = a.startsWith("http")
                    ? a
                    : `${API_URL}${a}`;
                  const fileName = a.split("/").pop();
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {/* File Icon */}
                        <svg
                          className="w-6 h-6 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 7v10M17 7v10M3 17h18"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">{fileName}</span>
                      </div>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm px-3 py-1 rounded bg-[#357FE9] text-white hover:bg-blue-700"
                      >
                        View
                      </a>
                    </li>
                  );
                })}
              </ul>
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

      {/* SP: Apply */}
      {role === "solutionProvider" && (
        proposal.status === "accepted" ? (
          <p className="text-green-600 font-semibold">
            ✅ You’ve been accepted. Start working!
          </p>
        ) : proposals?.some((p) => p.fromUser._id === currentUserId) ? (
          <button
            disabled
            className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed"
          >
            Proposal already submitted
          </button>
        ) : (
          <button
            onClick={() => setShowProposalModal(true)}
            className="bg-[#E96435] text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Submit Proposal
          </button>
        )
      )}


      {/* TO: Proposals */}
      {role === "taskOwner" && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#1E376E] mb-4">
            Proposals
          </h2>
          {proposals.length === 0 ? (
            <p className="text-gray-600">No proposals yet.</p>
          ) : (
            <ul className="space-y-4">
              {proposals.map((p) => (
                <li
                  key={p._id}
                  className="bg-white p-4 rounded shadow flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={
                            p.fromUser.profileImage
                              ? p.fromUser.profileImage.startsWith("http")
                                ? p.fromUser.profileImage
                                : `${API_URL}${p.fromUser.profileImage}`
                              : "/uploads/default.jpg"
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold">{p.fromUser.name}</div>
                          <button
                            className="text-blue-600 text-sm hover:underline"
                            onClick={() => setViewingProfileId(p.fromUser._id)}
                          >
                            View Profile
                          </button>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-gray-700">{p.message}</p>

                    {p.attachments?.length > 0 && (
                      <div className="mt-2">
                        <small>Attachments:</small>
                        <ul className="list-disc ml-5">
                          {p.attachments.map((a) => (
                            <li key={a}>
                              <a
                                target="_blank"
                                rel="noreferrer"
                                href={
                                  a.startsWith("http")
                                    ? a
                                    : `${API_URL}${a}`
                                }
                                className="text-[#357FE9] underline"
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
                    <div className="text-sm text-gray-500">
                      {new Date(p.createdAt).toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startConversation(p.fromUser._id, task?._id, p._id)} 
                        className="px-3 py-1 bg-[#1E376E] text-white rounded hover:bg-[#142851] text-sm"
                      >
                        Message
                      </button>


                      {p.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleProposalAction(p._id, "accept")
                            }
                            className="px-3 py-1 bg-green-600 text-white rounded"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleProposalAction(p._id, "reject")
                            }
                            className="px-3 py-1 bg-red-600 text-white rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <div className="text-sm font-semibold">{p.status}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* Feedback Section */}
      {task.status === "completed" && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[#1E376E] mb-4">
            Feedback
          </h2>

          {/* Show feedback form depending on role */}
          {role === "taskOwner" &&
            proposals.some((p) => p.status === "accepted") && (
              <FeedbackForm
                taskId={task._id}
                toUser={proposals.find((p) => p.status === "accepted")?.fromUser?._id}
                onFeedbackSubmitted={() => alert("Feedback submitted")}
              />
            )}

          {role === "solutionProvider" && (
            <FeedbackForm
              taskId={task._id}
              toUser={task.createdBy?._id}
              onFeedbackSubmitted={() => alert("Feedback submitted")}
            />
          )}

          {/* Show received feedback for this user */}
          <div className="mt-8">
           <FeedbackList
              userId={role === "taskOwner" ? task.createdBy : task.assignedTo}
            />

          </div>
        </div>
      )}

      {/* Proposal Modal */}
      {showProposalModal && (
        <ProposalModal
          taskId={id}
          onClose={() => setShowProposalModal(false)}
          onSubmitted={(newProposal) => {
            // add new proposal to state
            setProposals((prev) => [...prev, newProposal]);
            setProposal(newProposal); // optional, if you need single proposal
            setShowProposalModal(false); // close modal
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updatedTask) => setTask(updatedTask)}
        />
      )}
      {/* 🔹 Inline Modal */}
      {viewingProfileId && (
        <PublicProfileModal
          userId={viewingProfileId}
          onClose={() => setViewingProfileId(null)}
        />
      )}
    </div>
  );
}
