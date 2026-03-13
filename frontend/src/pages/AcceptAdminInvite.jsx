import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Check, X, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const passwordRules = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(p) },
];

function getStrength(password) {
  if (!password) return 0;
  const passed = passwordRules.filter((r) => r.test(password)).length;
  return Math.round((passed / passwordRules.length) * 100);
}

function getStrengthLabel(strength) {
  if (strength <= 20) return { text: "Very Weak", color: "bg-red-500" };
  if (strength <= 40) return { text: "Weak", color: "bg-orange-500" };
  if (strength <= 60) return { text: "Fair", color: "bg-yellow-500" };
  if (strength <= 80) return { text: "Strong", color: "bg-blue-500" };
  return { text: "Very Strong", color: "bg-green-500" };
}

export default function AcceptAdminInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [inviteData, setInviteData] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);
  const strengthInfo = useMemo(() => getStrengthLabel(strength), [strength]);
  const allRulesPassed = strength === 100;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/validate-invite?token=${token}`);
        const data = await res.json();
        if (res.ok && data.valid) {
          setInviteData(data);
          setStatus("valid");
        } else {
          setError(data.msg || "Invalid or expired invitation");
          setStatus("invalid");
        }
      } catch {
        setError("Unable to verify the invitation. Please try again later.");
        setStatus("invalid");
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allRulesPassed) {
      setError("Please ensure your password meets all the requirements below");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/accept-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/admin/login"), 3000);
      } else {
        setError(data.msg || "Failed to set up your account");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/70 text-sm">Verifying your invitation...</p>
        </motion.div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Invitation Unavailable</h2>
          <p className="text-white/60 mb-6 text-sm leading-relaxed">
            {error || "This invitation link is invalid, has expired, or has already been used."}
          </p>
          <p className="text-white/40 text-xs mb-6">
            Please contact your admin team to request a new invitation.
          </p>
          <Link
            to="/admin/login"
            className="inline-block px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors text-sm font-medium"
          >
            Go to Admin Login
          </Link>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-white/60 mb-4 text-sm">
            Your admin account is ready. Redirecting you to the login page...
          </p>
          <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
            <motion.div
              className="h-full bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1E376E] to-[#357FE9] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set Up Your Admin Account</h1>
          <p className="text-white/50 text-sm mt-2">
            Welcome, <span className="text-white/80 font-medium">{inviteData?.firstName} {inviteData?.lastName}</span>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
              <input
                type="email"
                value={inviteData?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 cursor-not-allowed text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Create Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter a strong password"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white/50">Password Strength</span>
                      <span className={`text-xs font-medium ${strength >= 80 ? 'text-green-400' : strength >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {strengthInfo.text}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${strengthInfo.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${strength}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {passwordRules.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <div key={rule.label} className="flex items-center gap-2">
                          {passed ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-white/30" />
                          )}
                          <span className={`text-xs ${passed ? 'text-green-400' : 'text-white/40'}`}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="Re-enter your password"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && (
                <div className="flex items-center gap-2 mt-2">
                  {passwordsMatch ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-green-400">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-red-400">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !allRulesPassed || !passwordsMatch}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1E376E] to-[#357FE9] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                "Activate Account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Already have an account?{" "}
          <Link to="/admin/login" className="text-white/50 hover:text-white/70 underline">
            Log in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
