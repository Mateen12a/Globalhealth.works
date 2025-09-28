// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import UsersTable from "../../components/admin/UsersTable";
import TasksTable from "../../components/admin/TasksTable";
import FeedbackTable from "../../components/admin/FeedbackTable";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [stats, setStats] = useState({ users: 0, tasks: 0, feedback: 0 });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Stats fetch error:", err));
  }, [token]);

  return (
    <DashboardLayout role="admin" title="Admin Dashboard">
      <div className="flex flex-col">
        {/* Stats cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-3xl font-bold text-[#1E376E]">{stats.users}</h2>
            <p className="text-gray-600 mt-2">Total Users</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-3xl font-bold text-[#357FE9]">{stats.tasks}</h2>
            <p className="text-gray-600 mt-2">Total Tasks</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-3xl font-bold text-[#F59E0B]">{stats.feedback}</h2>
            <p className="text-gray-600 mt-2">Total Feedback</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {["users", "tasks", "feedback"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab
                  ? "border-b-2 border-[#1E376E] text-[#1E376E]"
                  : "text-gray-500 hover:text-[#1E376E]"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === "users" && <UsersTable />}
          {activeTab === "tasks" && <TasksTable />}
          {activeTab === "feedback" && <FeedbackTable />}
        </div>
      </div>
    </DashboardLayout>
  );
}
