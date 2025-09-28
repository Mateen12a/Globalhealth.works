// src/pages/SignUp.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CountrySelect from "../components/CountrySelect";
const API_URL = import.meta.env.VITE_API_URL;

// Shared options
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

const expertiseOptions = [
  "Delivery & Implementation",
  "Training, Capacity Building & Learning",
  "Data & Evaluation",
  "Digital & Technology Solutions",
  "Program Management & Operations",
  "Communications & Engagement",
  "Policy & Strategy",
];

const focusAreas = [
  "Communicable Disease Prevention & Control",
  "Non-Communicable Diseases & Chronic Conditions",
  "Maternal, Child & Community Health",
  "Health Systems, Policy & Governance",
  "Environmental & Social Determinants of Health",
  "Public Health Promotion & Behavioural Change",
  "Health Data, Surveillance & Research",
];

const genders = [
  "Female",
  "Male",
  "Prefer to self-describe",
  "Prefer not to say",
];

export default function Signup() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F9FAFB] to-[#EEF2F7] p-6">
        <h2 className="text-4xl font-extrabold text-[#1E376E] mb-8">
          Create Your Account
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
              Work on impactful tasks and showcase expertise.
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

  return (
    <SignupForm role={role} navigate={navigate} goBack={() => setRole(null)} />
  );
}

function SignupForm({ role, navigate, goBack }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    organisationName: "",
    organisationType: "",
    country: "",
    gender: "",
    expertise: [],
    focusAreas: [],
    affiliation: [],
    bio: "",
    portfolio: "",
  });

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((res) => res.json())
      .then((data) => setCountries(data.map((c) => c.name.common).sort()))
      .catch(() => setCountries(["Nigeria", "Kenya", "United Kingdom"]));
  }, []);

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
        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-2xl space-y-6"
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

        {/* Common fields */}
        <CommonFields formData={formData} handleChange={handleChange} />

        {/* Role-specific */}
        {role === "taskOwner" && (
          <TaskOwnerForm formData={formData} handleChange={handleChange} />
        )}
        {role === "solutionProvider" && (
          <SolutionProviderForm
            formData={formData}
            handleChange={handleChange}
            handleMultiSelect={handleMultiSelect}
          />
        )}

        {/* Shared: Country, Gender, Expertise, Focus Areas */}
        <CountrySelect
            value={formData.country}
            onChange={(val) => setFormData({ ...formData, country: val })}
            required
            />


        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg shadow-sm"
        >
          <option value="">Select Gender</option>
          {genders.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <MultiSelect
          label={
            role === "taskOwner"
              ? "What kind of support or expertise do you need?"
              : "What kind of support or expertise do you offer?"
          }
          options={expertiseOptions}
          selected={formData.expertise}
          onToggle={(val) => handleMultiSelect("expertise", val)}
          color="blue"
        />

        <MultiSelect
          label="Areas of Interest"
          options={focusAreas}
          selected={formData.focusAreas}
          onToggle={(val) => handleMultiSelect("focusAreas", val)}
          color="indigo"
        />

        {role === "solutionProvider" && (
          <>
            <textarea
              name="bio"
              placeholder="Short Bio (max 300 words)"
              value={formData.bio}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg shadow-sm"
              rows={4}
            />
            <input
              type="text"
              name="portfolio"
              placeholder="Portfolio / CV link"
              value={formData.portfolio}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg shadow-sm"
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#1E376E] to-[#357FE9] text-white py-3 rounded-xl font-semibold shadow hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

// ----- Subcomponents -----

function CommonFields({ formData, handleChange }) {
  return (
    <>
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#357FE9]"
        required
      />
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
    </>
  );
}

function TaskOwnerForm({ formData, handleChange }) {
  return (
    <>
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        className="w-full border p-3 rounded-lg shadow-sm"
        required
      />
      <input
        type="text"
        name="organisationName"
        placeholder="Organisation Name"
        value={formData.organisationName}
        onChange={handleChange}
        className="w-full border p-3 rounded-lg shadow-sm"
        required
      />
      <select
        name="organisationType"
        value={formData.organisationType}
        onChange={handleChange}
        className="w-full border p-3 rounded-lg shadow-sm"
        required
      >
        <option value="">Select Organisation Type</option>
        {orgTypes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </>
  );
}

function SolutionProviderForm({ formData, handleMultiSelect }) {
  return (
    <>
      <label className="block font-semibold">Affiliation</label>
      <div className="flex flex-wrap gap-2">
        {affiliations.map((a) => (
          <button
            type="button"
            key={a}
            onClick={() => handleMultiSelect("affiliation", a)}
            className={`px-3 py-1 rounded-full border ${
              formData.affiliation.includes(a)
                ? "bg-[#E96435] text-white border-[#E96435]"
                : "border-gray-300 text-gray-600 hover:border-[#E96435]"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
    </>
  );
}

function MultiSelect({ label, options, selected, onToggle, color }) {
  const colorMap = {
    blue: "bg-[#357FE9] border-[#357FE9]",
    indigo: "bg-[#1E376E] border-[#1E376E]",
  };

  return (
    <>
      <label className="block font-semibold">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-3 py-1 rounded-full border ${
              selected.includes(opt)
                ? `${colorMap[color]} text-white`
                : "border-gray-300 text-gray-600 hover:border-gray-500"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}
