// src/pages/dashboard/DashboardRouter.jsx
import { Navigate } from "react-router-dom";

export default function DashboardRouter() {
  const role = localStorage.getItem("role");

  if (role === "taskOwner") {
    return <Navigate to="/dashboard/to" />;
  }
  if (role === "solutionProvider") {
    return <Navigate to="/dashboard/sp" />;
  }
  if (role === "admin") {
    return <Navigate to="/dashboard/admin" />;
  }

  // fallback
  return <Navigate to="/login" />;
}
