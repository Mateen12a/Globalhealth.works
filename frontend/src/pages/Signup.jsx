import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Info,
  Upload,
  Loader2,
  Users,
  Briefcase,
  CheckCircle,
  Sparkles,
  Globe,
  Shield,
} from "lucide-react";
import CountrySelect from "../components/CountrySelect";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import newLogo from "../assets/new-logo.png";

const API_URL = import.meta.env.VITE_API_URL;

const titles = ["Dr.", "Prof.", "Mr.", "Ms.", "Mrs.", "Mx."];
const orgTypes = [
  "NGO / Non-profit",
  "Academic / Research Institution",
  "Ministry / Department of Health",
  "Other Government Agency",
  "Multilateral Organisation",
  "Private Sector Company",
  "Health Facility / Hospital / Clinic",
  "Faith-Based Organisation",
  "Other",
];
const expertiseOptions = [
  "Delivery & Implementation",
  "Training, Capacity Building & Learning",
  "Data & Evaluation",
  "Digital & Technology Solutions",
  "Programme Management & Operations",
  "Communications & Engagement",
  "Policy & Strategy",
];
const affiliations = [
  "NGO / Non-profit",
  "Academic / Research Institution",
  "Government Agency",
  "UN / Multilateral Organisation",
  "Private Sector Company",
  "Health Facility / Hospital / Clinic",
  "Independent Consultant",
  "Student / Trainee",
  "Faith-Based Organisation",
  "Other",
];
const genders = ["Female", "Male", "Prefer not to say", "Prefer to self-describe"];

export default function Signup() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  if (!role) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80"
              alt="Healthcare collaboration"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E376E]/95 via-[#1E376E]/85 to-[#357FE9]/80" />
          </div>
          
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
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
                  Join the Global<br />
                  <span className="text-[var(--color-accent-light)]">Health Community</span>
                </h2>
                <p className="text-white/70 text-lg max-w-md">
                  Connect with health professionals and organisations making a difference worldwide.
                </p>
              </motion.div>
              
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Global Network</p>
                    <p className="text-white/60 text-xs">Experts from around the world</p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Verified Members</p>
                    <p className="text-white/60 text-xs">Admin-approved accounts only</p>
                  </div>
                </motion.div>
              </div>
            </div>
            
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Global Health Works
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 bg-[var(--color-bg)] relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[var(--color-primary-light)]/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-[var(--color-accent)]/20 to-transparent rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-lg"
          >
            <div className="lg:hidden mb-8 flex justify-center">
              <Link to="/" className="inline-block">
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
                Get Started
              </motion.div>
              <h2 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                Choose Your Role
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                How would you like to participate in our community?
              </p>
            </div>

            <div className="grid gap-4">
              <motion.button
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("taskOwner")}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 text-left group hover:border-[var(--color-primary-light)] hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">Task Owner</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      Post health projects and connect with experts who can help solve your challenges.
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("solutionProvider")}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 text-left group hover:border-[var(--color-accent)] hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">Solution Provider</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      Work on impactful tasks and showcase your global health expertise.
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 text-[var(--color-text-secondary)] text-center"
            >
              Already have an account?{" "}
              <Link to="/login" className="text-[var(--color-accent)] font-semibold hover:underline">
                Log in
              </Link>
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-4 text-center"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] text-sm transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Home
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return <SignupForm role={role} navigate={navigate} goBack={() => setRole(null)} />;
}


function SignupForm({ role, navigate, goBack }) {
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    organisationName: "",
    organisationType: "",
    country: "",
    gender: "",
    genderSelfDescribe: "",
    expertise: [],
    affiliation: [],
    bio: "",
    professionalLink: "",
    resume: null,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMissingTooltip, setShowMissingTooltip] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFormData({ ...formData, resume: e.target.files[0] });
  };

  const handleMultiSelect = (field, value) => {
    setFormData((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists ? prev[field].filter((v) => v !== value) : [...prev[field], value],
      };
    });
  };

  const getPasswordStrength = (password) => {
    const criteria = [/.{8,}/, /[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];
    return criteria.reduce((acc, regex) => acc + (regex.test(password) ? 1 : 0), 0);
  };
  const passwordStrength = getPasswordStrength(formData.password);

  const requiredFields = useMemo(() => {
    const fields = ["title", "firstName", "lastName", "email", "password", "phone", "country", "gender"];
    if (role === "taskOwner") {
      fields.push("organisationName", "organisationType");
    } else if (role === "solutionProvider") {
      fields.push("affiliation");
      if (!formData.resume) fields.push("resume");
      if (formData.expertise.length === 0) fields.push("expertise");
    }
    return fields;
  }, [role, formData]);

  const missingFields = requiredFields.filter((f) => {
    if (f === "expertise") return formData.expertise.length === 0;
    return !formData[f];
  });

  const allFilled = missingFields.length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allFilled) return;

    localStorage.clear(); 
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Registration failed");
        setLoading(false);
        return;
      }

      if (role === "solutionProvider" && formData.resume) {
        const cvForm = new FormData();
        cvForm.append("cv", formData.resume);

        const cvRes = await fetch(`${API_URL}/api/auth/upload-cv`, {
          method: "POST",
          headers: { Authorization: `Bearer ${data.tempToken}` },
          body: cvForm,
        });

        const cvData = await cvRes.json();
        if (cvRes.ok) console.log("CV uploaded:", cvData.url);
        else console.warn("CV upload failed:", cvData.msg);
      }

      delete data.tempToken;
      delete data.user;
      delete data.role;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      setShowSuccessModal(true);

    } catch (err) {
      console.error("Register error:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const Label = ({ text, required }) => (
    <label className="block font-semibold text-[var(--color-text)] mb-2 text-sm">
      {text} {required && <span className="text-[var(--color-accent)]">*</span>}
    </label>
  );

  const inputClass = "w-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] p-3 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)]/20 focus:border-[var(--color-primary-light)] transition-all duration-200 text-sm";

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 fixed left-0 top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={role === "taskOwner" 
              ? "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80"
              : "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80"
            }
            alt="Healthcare"
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 ${
            role === "taskOwner"
              ? "bg-gradient-to-br from-[#1E376E]/95 via-[#1E376E]/85 to-[#357FE9]/80"
              : "bg-gradient-to-br from-[#E96435]/90 via-[#d45428]/85 to-[#F7B526]/80"
          }`} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          <Link to="/" className="inline-block">
            <div className="bg-white rounded-xl p-2 shadow-lg inline-block">
              <img src={newLogo} alt="Global Health Works" className="h-10 w-auto" />
            </div>
          </Link>
          
          <div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
              role === "taskOwner" 
                ? "bg-white/20" 
                : "bg-white/20"
            }`}>
              {role === "taskOwner" ? (
                <Users className="w-8 h-8 text-white" />
              ) : (
                <Briefcase className="w-8 h-8 text-white" />
              )}
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-3">
              {role === "taskOwner" ? "Task Owner" : "Solution Provider"}
              <br />Registration
            </h2>
            <p className="text-white/70 text-lg">
              {role === "taskOwner" 
                ? "Post projects and find experts to solve your global health challenges."
                : "Showcase your expertise and work on impactful health projects worldwide."
              }
            </p>
          </div>
          
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Global Health Works
          </p>
        </div>
      </div>

      <div className="w-full lg:w-3/5 lg:ml-[40%] bg-[var(--color-bg)] min-h-screen overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              
              <div className="lg:hidden">
                <Link to="/">
                  <div className="bg-white rounded-lg p-2 shadow-md inline-block">
                    <img src={newLogo} alt="Global Health Works" className="h-8 w-auto" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="lg:hidden text-center mb-6">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3 ${
                role === "taskOwner" 
                  ? "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)]"
                  : "bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)]"
              }`}>
                {role === "taskOwner" ? (
                  <Users className="w-7 h-7 text-white" />
                ) : (
                  <Briefcase className="w-7 h-7 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                {role === "taskOwner" ? "Task Owner" : "Solution Provider"} Registration
              </h2>
            </div>

            <div className="hidden lg:block mb-2">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">Create Your Account</h2>
              <p className="text-[var(--color-text-secondary)]">Fill in your details to get started</p>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-1">
                  <Label text="Title" required />
                  <select
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select</option>
                    {titles.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label text="First Name" required />
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <Label text="Last Name" required />
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <Label text="Email Address" required />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <Label text="Password" required />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputClass} pr-12`}
                    placeholder="Create a strong password"
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

                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3"
                  >
                    <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: passwordStrength <= 2 ? "25%" : passwordStrength === 3 ? "50%" : passwordStrength === 4 ? "75%" : "100%"
                        }}
                        className={`h-2 rounded-full transition-colors duration-300 ${
                          passwordStrength <= 2
                            ? "bg-red-500"
                            : passwordStrength === 3
                            ? "bg-yellow-400"
                            : passwordStrength === 4
                            ? "bg-green-400"
                            : "bg-green-500"
                        }`}
                      />
                    </div>
                    <p className={`text-xs mt-1.5 ${
                      passwordStrength <= 2 ? "text-red-500" : passwordStrength === 3 ? "text-yellow-500" : "text-green-500"
                    }`}>
                      {passwordStrength <= 2 ? "Weak" : passwordStrength === 3 ? "Fair" : passwordStrength === 4 ? "Strong" : "Very Strong"}
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label text="Phone Number" required />
                  <PhoneInput
                    country={"gb"}
                    value={formData.phone}
                    onChange={(phone) => setFormData({ ...formData, phone })}
                    inputClass="!w-full !border-[var(--color-border)] !bg-[var(--color-bg)] !text-[var(--color-text)] !rounded-xl !py-3"
                    containerClass="phone-input-container"
                    buttonClass="!rounded-l-xl !border-[var(--color-border)] !bg-[var(--color-bg)]"
                  />
                </div>
                <div>
                  <Label text="Country" required />
                  <CountrySelect
                    value={formData.country}
                    onChange={(val) => setFormData({ ...formData, country: val })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <Label text="Gender" required />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select gender</option>
                  {genders.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {formData.gender === "Prefer to self-describe" && (
                  <input
                    name="genderSelfDescribe"
                    value={formData.genderSelfDescribe}
                    onChange={handleChange}
                    className={`${inputClass} mt-2`}
                    placeholder="Please describe"
                  />
                )}
              </div>
            </div>

            {role === "taskOwner" && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-5">
                <h3 className="font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">Organisation Details</h3>
                
                <div>
                  <Label text="Organisation Name" required />
                  <input
                    name="organisationName"
                    value={formData.organisationName}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <Label text="Organisation Type" required />
                  <select
                    name="organisationType"
                    value={formData.organisationType}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select type</option>
                    {orgTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {role === "solutionProvider" && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-5">
                <h3 className="font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">Professional Details</h3>
                
                <div>
                  <Label text="Affiliation" required />
                  <div className="grid grid-cols-2 gap-2">
                    {affiliations.map((a) => (
                      <label
                        key={a}
                        className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm ${
                          formData.affiliation.includes(a)
                            ? "border-[var(--color-primary-light)] bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)]"
                            : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.affiliation.includes(a)}
                          onChange={() => handleMultiSelect("affiliation", a)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          formData.affiliation.includes(a)
                            ? "bg-[var(--color-primary-light)] border-[var(--color-primary-light)]"
                            : "border-[var(--color-border)]"
                        }`}>
                          {formData.affiliation.includes(a) && (
                            <CheckCircle size={12} className="text-white" />
                          )}
                        </div>
                        <span className="text-[var(--color-text)]">{a}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label text="Areas of Expertise" required />
                  <div className="flex flex-wrap gap-2">
                    {expertiseOptions.map((exp) => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => handleMultiSelect("expertise", exp)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          formData.expertise.includes(exp)
                            ? "bg-[var(--color-accent)] text-white"
                            : "bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-accent)]"
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label text="Bio / Summary" />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[100px]`}
                    placeholder="Tell us about your experience and expertise..."
                  />
                </div>

                <div>
                  <Label text="Professional Link (LinkedIn, Portfolio, etc.)" />
                  <input
                    name="professionalLink"
                    value={formData.professionalLink}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <Label text="CV / Resume" required />
                  <label className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    formData.resume 
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary-light)]"
                  }`}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {formData.resume ? (
                      <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle size={20} />
                        <span className="font-medium">{formData.resume.name}</span>
                      </div>
                    ) : (
                      <div className="text-[var(--color-text-secondary)]">
                        <Upload size={24} className="mx-auto mb-2" />
                        <p className="font-medium">Click to upload your CV</p>
                        <p className="text-xs mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div className="relative">
              {!allFilled && (
                <div
                  className="absolute -top-2 right-0"
                  onMouseEnter={() => setShowMissingTooltip(true)}
                  onMouseLeave={() => setShowMissingTooltip(false)}
                >
                  <Info size={18} className="text-[var(--color-text-muted)] cursor-help" />
                  <AnimatePresence>
                    {showMissingTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 top-full mt-2 w-64 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-10"
                      >
                        <p className="text-sm font-semibold text-[var(--color-text)] mb-2">Missing required fields:</p>
                        <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
                          {missingFields.map((f) => (
                            <li key={f} className="capitalize">• {f.replace(/([A-Z])/g, ' $1').trim()}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading || !allFilled}
                whileHover={allFilled ? { scale: 1.01 } : {}}
                whileTap={allFilled ? { scale: 0.99 } : {}}
                className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  allFilled 
                    ? role === "taskOwner"
                      ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:shadow-xl"
                      : "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] hover:shadow-xl"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--color-surface)] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">Registration Successful!</h3>
              <p className="text-[var(--color-text-secondary)] mb-6">
                Your account has been created. An administrator will review and approve your account shortly. You'll receive an email once approved.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:shadow-lg transition-all"
              >
                Go to Login
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
