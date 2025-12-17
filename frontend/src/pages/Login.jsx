import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Loader2, Globe, Sparkles } from "lucide-react";
import newLogo from "../assets/new-logo.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
        
        // Store onboarding status for first-time users
        const showOnboarding = data.user.isFirstLogin && !data.user.onboardingCompleted && !data.user.onboardingSkipped;
        if (showOnboarding) {
          localStorage.setItem("showOnboarding", "true");
        }

        if (data.user.role === "taskOwner") navigate("/dashboard/to");
        else if (data.user.role === "solutionProvider") navigate("/dashboard/sp");
        else if (data.user.role === "admin") navigate("/dashboard/admin");
        else navigate("/");
      } else {
        setError(data.msg || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 fixed left-0 top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80"
            alt="Healthcare professionals"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E376E]/95 via-[#1E376E]/85 to-[#357FE9]/80" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="inline-block">
            <div className="bg-white rounded-xl p-3 shadow-lg inline-block">
              <img src={newLogo} alt="Global Health Works" className="h-16 w-auto" />
            </div>
          </Link>
          
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold leading-tight mb-4">
                Welcome back to<br />
                <span className="text-[var(--color-accent-light)]">Global Health Works</span>
              </h2>
              <p className="text-white/70 text-lg max-w-md">
                Continue your journey in making a difference in global health.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-5 max-w-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Globe size={24} />
              </div>
              <div>
                <p className="font-semibold">Trusted Worldwide</p>
                <p className="text-white/60 text-sm">Connect with experts globally</p>
              </div>
            </motion.div>
          </div>
          
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Global Health Works
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 lg:ml-[50%] flex items-center justify-center p-6 bg-[var(--color-bg)] min-h-screen">
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[var(--color-primary-light)]/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[var(--color-accent)]/20 to-transparent rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <div className="bg-white rounded-xl p-3 shadow-lg inline-block">
                <img src={newLogo} alt="Global Health Works" className="h-14 w-auto" />
              </div>
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)] text-sm font-medium mb-4"
            >
              <Sparkles size={16} />
              Welcome Back
            </motion.div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">Sign in to your account</h1>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-primary-light)] focus:ring-2 focus:ring-[var(--color-primary-light)]/20 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-primary-light)] focus:ring-2 focus:ring-[var(--color-primary-light)]/20 transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] hover:from-[var(--color-primary)] hover:to-[var(--color-primary-light)] text-white font-semibold py-4 rounded-xl shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[var(--color-text-secondary)]">
                Don't have an account?{" "}
                <Link to="/signup" className="text-[var(--color-accent)] font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
