// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "taskOwner") navigate("/dashboard/to");
        else if (data.user.role === "solutionProvider") navigate("/dashboard/sp");
        else if (data.user.role === "admin") navigate("/dashboard/admin");
        else navigate("/");
      } else {
        alert(data.msg || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9FAFB] to-[#EEF2F7] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-[#1E376E] mb-6">Welcome Back</h2>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9]"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9]"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#357FE9] to-[#1E376E] text-white py-3 rounded-xl font-semibold shadow hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="mt-4 text-gray-600 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#E96435] font-semibold hover:underline">
            Sign up
          </Link>
        </p>
        <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Landing Page
          </Link>
      </form>
    </div>
  );
}
