// src/pages/dashboard/SolutionProviderDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function SolutionProviderDashboard() {
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tasks", {
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

  return (
    <DashboardLayout role="solutionProvider" title="Solution Provider Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Available Tasks</h2>
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-600">No tasks available right now.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-[#357FE9]">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.summary}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{task.status}</span>
                    <span className="px-2 py-1 rounded-full text-xs bg-[#F7B526] text-white">{task.fundingStatus}</span>
                  </div>
                </div>
                <Link to={`/tasks/${task._id}`} className="text-[#1E376E] font-semibold">View & Apply</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
