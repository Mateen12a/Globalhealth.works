// src/components/landing/Hero.jsx
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Hero() {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/explore?search=${query}`;
    }
  };

  return (
    <section className="bg-white text-center py-20 px-6">
      <h1 className="text-4xl md:text-6xl font-bold text-[#1E376E] mb-6 leading-tight">
        Connecting Global Health Challenges <br /> with Digital Solutions
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto mb-8">
        Choose your journey: Post a task as an{" "}
        <span className="text-[#E96435]">Owner</span> or apply as a{" "}
        <span className="text-[#357FE9]">Solution Provider</span>.
      </p>

      {/* 🔍 Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex justify-center items-center gap-2 max-w-xl mx-auto mb-8"
      >
        <input
          type="text"
          placeholder="Search tasks (e.g. digital health, epidemiology)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357FE9]"
        />
        <button
          type="submit"
          className="bg-[#E96435] text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
        >
          Search
        </button>
      </form>

      {/* Role Buttons */}
      <div className="flex justify-center gap-6">
        <Link
          to="/signup?role=TO"
          className="bg-[#E96435] text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
        >
          I want to post a task
        </Link>
        <Link
          to="/signup?role=SP"
          className="bg-[#357FE9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          I want to work on tasks
        </Link>
      </div>
    </section>
  );
}
