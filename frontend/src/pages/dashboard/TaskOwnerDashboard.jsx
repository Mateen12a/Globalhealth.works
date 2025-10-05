// src/pages/dashboard/TaskOwnerDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DashboardStats from "../../components/dashboard/DashboardStats";

const API_URL = import.meta.env.VITE_API_URL;

export default function TaskOwnerDashboard() {
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tasks?owner=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    fetchTasks();
  }, [token]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter(
    (t) => t.status === "in progress" || t.status === "ongoing"
  ).length;
  const active = tasks.filter((t) => t.status === "published").length;

  const stats = [
    { label: "Total Tasks", value: total, color: "text-[#357FE9]", type: "total" },
    { label: "In Progress", value: inProgress, color: "text-[#F7B526]", type: "inProgress" },
    { label: "Completed", value: completed, color: "text-[#34A853]", type: "completed" },
    { label: "Active", value: active, color: "text-[#E96435]", type: "active" },
  ];

  const recentTasks = tasks.slice(0, 3);
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <DashboardLayout role="Task Owner" title="Dashboard">
      {/* Stat Summary */}
      <DashboardStats stats={stats} />

      {/* Main Section */}
      <div className="space-y-8">
        {/* Top actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#1E376E]">
            My Active Tasks
          </h2>
          <Link
            to="/tasks/create"
            className="bg-[#E96435] text-white px-5 py-2 rounded-lg shadow hover:bg-orange-700 transition"
          >
            + Create New Task
          </Link>
        </div>

        {/* Task list */}
        {tasks.length === 0 ? (
          <p className="text-gray-600">No tasks created yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-[#357FE9]">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {task.summary}
                    </p>
                  </div>
                  <Link
                    to={`/tasks/${task._id}`}
                    className="text-[#1E376E] text-sm font-medium hover:underline"
                  >
                    View
                  </Link>
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    {task.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs bg-[#F7B526] text-white">
                    {task.fundingStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent completed tasks */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-[#1E376E] mb-4">
            Recent Tasks Completed
          </h3>
          {completedTasks.length === 0 ? (
            <p className="text-gray-500">No completed tasks yet.</p>
          ) : (
            <ul className="grid md:grid-cols-2 gap-4">
              {recentTasks.map((t) => (
                <li
                  key={t._id}
                  className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                >
                  <h4 className="font-semibold text-[#357FE9]">{t.title}</h4>
                  <p className="text-sm text-gray-600">{t.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
