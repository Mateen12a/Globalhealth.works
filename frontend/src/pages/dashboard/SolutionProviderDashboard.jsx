// src/pages/dashboard/SolutionProviderDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DashboardStats from "../../components/dashboard/DashboardStats";

const API_URL = import.meta.env.VITE_API_URL;

export default function SolutionProviderDashboard() {
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tasks`, {
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

  const available = tasks.filter((t) => t.status === "published");
  const completed = tasks.filter((t) => t.status === "completed");
  const inProgress = tasks.filter(
    (t) => t.status === "in progress" || t.status === "ongoing"
  );

  const stats = [
    { label: "Available Tasks", value: available.length, color: "text-[#357FE9]", type: "total" },
    { label: "In Progress", value: inProgress.length, color: "text-[#F7B526]", type: "inProgress" },
    { label: "Completed", value: completed.length, color: "text-[#34A853]", type: "completed" },
    { label: "Applied", value: 0, color: "text-[#E96435]", type: "active" }, // future enhancement
  ];

  const recentCompleted = completed.slice(0, 3);

  return (
    <DashboardLayout role="Solution Provider" title="Dashboard">
      {/* Stats */}
      <DashboardStats stats={stats} />

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-[#1E376E]">Available Tasks</h2>

        {available.length === 0 ? (
          <p className="text-gray-600">No tasks available right now.</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {available.map((task) => (
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
                    View & Apply
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

        <div className="mt-10">
          <h3 className="text-xl font-semibold text-[#1E376E] mb-4">
            Recently Completed Tasks
          </h3>
          {recentCompleted.length === 0 ? (
            <p className="text-gray-500">No recent completions yet.</p>
          ) : (
            <ul className="grid md:grid-cols-2 gap-4">
              {recentCompleted.map((t) => (
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
