// src/pages/sp/MyApplications.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function MyApplications() {
  const token = localStorage.getItem("token");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tasks/my-applications", {
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

  if (loading) return <p className="p-6">Loading applications...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1E376E] mb-6">My Applications</h1>

      {tasks.length === 0 ? (
        <p className="text-gray-600">You haven’t applied to any tasks yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white border rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <h2 className="text-xl font-semibold text-[#357FE9] mb-2">
                {task.title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{task.summary}</p>

              {/* Status badge */}
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4"
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

              <div className="flex justify-between items-center mt-4">
                <Link
                  to={`/tasks/${task._id}`}
                  className="text-[#E96435] hover:underline font-semibold"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
