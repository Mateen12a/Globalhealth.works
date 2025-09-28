// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import PrivateRoute from "./utils/PrivateRoute";
import ProfileSettings from "./pages/ProfileSettings";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import TaskOwnerDashboard from "./pages/dashboard/TaskOwnerDashboard";
import SolutionProviderDashboard from "./pages/dashboard/SolutionProviderDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TaskCreate from "./pages/tasks/TaskCreate";
import TaskDetails from "./pages/tasks/TaskDetails";
import MyApplications from "./pages/sp/MyApplications";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTasks from "./pages/admin/AdminTasks";
import InboxPage from "./pages/messages/InboxPage";
import ChatPage from "./pages/messages/ChatPage";
import PublicProfile from "./pages/PublicProfile";




import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      {/* <Route path="/dashboard" element={ <PrivateRoute> <Dashboard /> </PrivateRoute>} /> */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<DashboardRouter />} />
      <Route path="/dashboard/to" element={<TaskOwnerDashboard />} />
      <Route path="/dashboard/sp" element={<SolutionProviderDashboard />} />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      <Route path="/tasks/create" element={<TaskCreate />} />
      <Route path="/tasks/:id" element={<TaskDetails />} />
      <Route path="/my-applications" element={<MyApplications />} />
      <Route path="/profile" element={ <PrivateRoute> <ProfileSettings /> </PrivateRoute> } />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/tasks" element={<AdminTasks />} />
      <Route path="/inbox" element={<InboxPage />} />
      <Route path="/chat/:conversationId" element={<ChatPage />} />
      <Route path="/profile/:id" element={<PublicProfile />} />

    </Routes>
  </BrowserRouter>
);
