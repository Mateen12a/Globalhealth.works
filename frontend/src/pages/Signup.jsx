// src/pages/SignUp.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import CountrySelect from "../components/CountrySelect";
import logo from "../assets/logo.png";

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

const expertiseNeeds = [
  "Strategy & Planning",
  "Research & Analysis",
  "Design & Creative",
  "Technology & Digital Solutions",
  "Communications & Marketing",
  "Training & Capacity Building",
  "Data & Monitoring",
  "Operations & Management",
];

const focusAreas = [
  "Maternal & Child Health",
  "Infectious Diseases",
  "Non-Communicable Diseases",
  "Mental Health",
  "Health Systems & Policy",
  "Environmental Health",
  "Community Health",
  "Global Health Security",
  "Other",
];

const expertiseOptions = [
  "Delivery & Implementation",
  "Training, Capacity Building & Learning",
  "Data & Evaluation",
  "Digital & Technology Solutions",
  "Program Management & Operations",
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F9FAFB] to-[#EEF2F7] p-6">
        {/* Logo */}
        <Link to="/" className="mb-8">
          <img src={logo} alt="GlobalHealth.Works" className="h-20 w-auto object-contain" />
        </Link>
        <h2 className="text-4xl font-extrabold text-[#1E376E] mb-8">
          Join the Community
        </h2>
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
          <button
            onClick={() => setRole("taskOwner")}
            className="border border-[#357FE9] bg-white shadow-md p-8 rounded-2xl hover:bg-[#357FE9] hover:text-white transition transform hover:scale-[1.02]"
          >
            <h3 className="text-2xl font-semibold">Task Owner</h3>
            <p className="text-sm mt-2 text-gray-600">
              Post health projects & connect with experts.
            </p>
          </button>
          <button
            onClick={() => setRole("solutionProvider")}
            className="border border-[#E96435] bg-white shadow-md p-8 rounded-2xl hover:bg-[#E96435] hover:text-white transition transform hover:scale-[1.02]"
          >
            <h3 className="text-2xl font-semibold">Solution Provider</h3>
            <p className="text-sm mt-2 text-gray-600">
              Work on tasks and showcase your skills.
            </p>
          </button>
        </div>
        <p className="mt-8 text-gray-700">
          Already have an account?{" "}
          <Link to="/login" className="text-[#357FE9] font-semibold hover:underline">
            Log in
          </Link>
        </p>
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
    supportNeeded: "",
    areaOfInterest: "",
    country: "",
    gender: "",
    genderSelfDescribe: "",
    expertise: [],
    focusAreas: [],
    affiliation: [],
    bio: "",
    professionalLink: "",
  });
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const Label = ({ text, required }) => (
    <label className="block font-semibold text-gray-800 mb-1">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMultiSelect = (field, value) => {
    setFormData((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((v) => v !== value)
          : [...prev[field], value],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate(role === "taskOwner" ? "/dashboard/to" : "/dashboard/sp");
      } else {
        alert(data.msg || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-[#F9FAFB] to-[#EEF2F7] py-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-2xl space-y-6 relative"
      >
        <div className="flex items-center space-x-4 mb-4">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center text-gray-600 hover:text-[#357FE9]"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
        </div>

        <h2 className="text-3xl font-bold text-[#1E376E] mb-4">
          {role === "taskOwner" ? "Task Owner" : "Solution Provider"} Registration
        </h2>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* Title */}
          <div className="md:col-span-1">
            <Label text="Title" required />
            <select
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg shadow-sm"
              required
            >
              <option value="">Select</option>
              {titles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* First Name */}
          <div className="md:col-span-2">
            <Label text="First Name" required />
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg shadow-sm"
              required
            />
          </div>

          {/* Last Name */}
          <div className="md:col-span-3">
            <Label text="Last Name" required />
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg shadow-sm"
              required
            />
          </div>
        </div>


        {/* Email & Password */}
        <div>
          <Label text="Email Address" required />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg shadow-sm"
            required
          />
        </div>

        <div>
          <Label text="Password" required />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg shadow-sm"
            required
          />
        </div>

        {/* Task Owner Section */}
        {role === "taskOwner" && (
          <>
            <div>
              <Label text="Phone Number" required />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm"
                required
              />
            </div>

            {/* Organisation Name + Tooltip */}
            <div className="relative">
              <Label text="Organisation Name" required />
              <div className="absolute top-1 right-1">
                <button
                  type="button"
                  onClick={() => setShowTooltip(!showTooltip)}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="text-gray-400 hover:text-[#357FE9]"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
              {showTooltip && (
                <div className="absolute top-8 right-0 bg-gray-800 text-white text-sm rounded-lg shadow-lg p-3 w-64 z-10 animate-fadeIn">
                  Task Owners must work in an organization working in global health.
                  Individual personal projects are not permitted.
                </div>
              )}
              <input
                name="organisationName"
                value={formData.organisationName}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm mt-1"
                required
              />
            </div>

            {/* Organisation Type */}
            <div>
              <Label text="Organisation Type" required />
              <select
                name="organisationType"
                value={formData.organisationType}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm"
                required
              >
                <option value="">Select</option>
                {orgTypes.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            {/* Support Needed */}
            <div>
              <Label text="What kind of support or expertise do you need?" required />
              <select
                name="supportNeeded"
                value={formData.supportNeeded}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm"
                required
              >
                <option value="">Select one</option>
                {expertiseNeeds.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Area of Interest */}
            <div>
              <Label text="Areas of Interest" required />
              <select
                name="areaOfInterest"
                value={formData.areaOfInterest}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg shadow-sm"
                required
              >
                <option value="">Select one</option>
                {focusAreas.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Solution Provider Section */}
        {role === "solutionProvider" && (
          <>
            <div>
              <Label text="Affiliation" required />
              <select
                name="affiliation"
                value={formData.affiliation}
                onChange={(e) =>
                  setFormData({ ...formData, affiliation: [e.target.value] })
                }
                className="w-full border p-3 rounded-lg shadow-sm"
                required
              >
                <option value="">Select your affiliation</option>
                {affiliations.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label text="What kind of support or expertise do you offer?" required />
              <div className="flex flex-wrap gap-2">
                {expertiseOptions.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => handleMultiSelect("expertise", e)}
                    className={`px-3 py-2 rounded-full border text-sm ${
                      formData.expertise.includes(e)
                        ? "bg-[#E96435] text-white border-[#E96435]"
                        : "border-gray-300 text-gray-700 hover:border-[#E96435]"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label text="Tell us about your areas of interest" required />
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((fa) => (
                  <button
                    key={fa}
                    type="button"
                    onClick={() => handleMultiSelect("focusAreas", fa)}
                    className={`px-3 py-2 rounded-full border text-sm ${
                      formData.focusAreas.includes(fa)
                        ? "bg-[#1E376E] text-white border-[#1E376E]"
                        : "border-gray-300 text-gray-700 hover:border-[#1E376E]"
                    }`}
                  >
                    {fa}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Country & Gender */}
        <div>
          <Label text="Country" required />
          <CountrySelect
            value={formData.country}
            onChange={(val) => setFormData({ ...formData, country: val })}
          />
        </div>

        <div>
          <Label text="Gender" required />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg shadow-sm"
            required
          >
            <option value="">Select</option>
            {genders.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {formData.gender === "Prefer to self-describe" && (
            <input
              type="text"
              name="genderSelfDescribe"
              placeholder="Please specify"
              value={formData.genderSelfDescribe}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg shadow-sm mt-2"
            />
          )}
        </div>

        {/* Bio & Links */}
        <div>
          <Label text="Short Bio" />
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full border p-3 rounded-lg shadow-sm"
            placeholder="Tell us briefly about yourself and your experience..."
          />
        </div>

        <div>
          <Label text="Professional Link (LinkedIn, website, etc.)" />
          <input
            type="url"
            name="professionalLink"
            value={formData.professionalLink}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg shadow-sm"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#357FE9] to-[#1E376E] text-white py-3 rounded-lg font-semibold shadow hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
