// src/pages/dashboard/SolutionProviderTasks.jsx
import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DashboardStats from "../../components/dashboard/DashboardStats";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function SolutionProviderTasks() {
  const [tasks, setTasks] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");

  /** 🔹 Fetch tasks and user profile */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, profileRes] = await Promise.all([
          fetch(`${API_URL}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (tasksRes.ok) setTasks(await tasksRes.json());
        if (profileRes.ok) setUserProfile(await profileRes.json());
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [token]);

  /** 🔹 Filter tasks by status */
  const availableTasks = tasks.filter((t) => t.status === "published");
  const inProgressTasks = tasks.filter((t) => ["in progress", "ongoing"].includes(t.status));
  const completedTasks = tasks.filter((t) => t.status === "completed");

  /** 🔹 Match tasks to solution provider based on skills/interests */
  const matchedTasks = useMemo(() => {
    if (!userProfile) return [];
    return availableTasks.filter((task) => {
      const userSkills = userProfile.skills || [];
      const userInterests = userProfile.interests || [];
      const taskSkills = task.requiredSkills || [];
      const taskCategory = task.category || "";

      const skillMatch = taskSkills.some((s) => userSkills.includes(s));
      const interestMatch = userInterests.includes(taskCategory);

      return skillMatch || interestMatch;
    });
  }, [availableTasks, userProfile]);

  /** 🔹 Stats for dashboard */
  const stats = [
    { label: "Available Tasks", value: availableTasks.length, color: "text-[#357FE9]" },
    { label: "Matched Tasks", value: matchedTasks.length, color: "text-[#6A5ACD]" },
    { label: "In Progress", value: inProgressTasks.length, color: "text-[#F7B526]" },
    { label: "Completed", value: completedTasks.length, color: "text-[#34A853]" },
  ];

  /** 🔹 Filtered tasks for search */
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return availableTasks;
    return availableTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, availableTasks]);

  return (
    <DashboardLayout role="Solution Provider" title="Dashboard">
      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Search */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-[#1E376E]">Find Tasks</h2>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Matched tasks highlight */}
      {matchedTasks.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-[#6A5ACD] mb-3">Recommended for You</h3>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {matchedTasks.map((task) => (
              <TaskCard key={task._id} task={task} highlight />
            ))}
          </div>
        </div>
      )}

      {/* Available Tasks */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold text-[#357FE9] mb-3">All Available Tasks</h3>
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500">No tasks match your search or criteria.</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Recently Completed */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold text-[#34A853] mb-4">Recently Completed Tasks</h3>
        {completedTasks.slice(0, 3).length === 0 ? (
          <p className="text-gray-500">No recent completions yet.</p>
        ) : (
          <ul className="grid md:grid-cols-2 gap-4">
            {completedTasks.slice(0, 3).map((t) => (
              <li
                key={t._id}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <h4 className="font-semibold text-[#34A853]">{t.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{t.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}

/** 🔹 Task Card Component */
function TaskCard({ task, highlight }) {
  return (
    <div
      className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition p-5 ${
        highlight ? "ring-2 ring-purple-300" : ""
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-semibold ${highlight ? "text-purple-600" : "text-[#357FE9]"}`}>
            {task.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3">{task.summary}</p>
        </div>
        <Link
          to={`/tasks/${task._id}`}
          className="text-[#1E376E] text-sm font-medium hover:underline"
        >
          View & Apply
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
          {task.status}
        </span>
        {task.requiredSkills?.map((s) => (
          <span
            key={s}
            className="px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-600"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
