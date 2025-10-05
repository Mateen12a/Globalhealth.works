// src/components/landing/Hero.jsx
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-[#f0f4ff] to-[#e0f7ff] overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="absolute -top-16 -left-16 w-72 h-72 bg-[#E96435]/20 rounded-full animate-spin-slow"></div>
      <div className="absolute -bottom-16 -right-20 w-96 h-96 bg-[#357FE9]/20 rounded-full animate-pulse-slow"></div>

      <div className="relative z-10 text-center py-28 px-6">
        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-[#1E376E] mb-6 leading-tight animate-fade-in-up">
          The Digital Marketplace for <br />{" "}
          <span className="text-gradient bg-gradient-to-r from-[#E96435] via-[#F7B526] to-[#357FE9] bg-clip-text text-transparent">
            Global Health Solutions
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-gray-700 max-w-2xl mx-auto mb-12 text-lg md:text-xl animate-fade-in-up delay-200">
          Post a task. Solve a{" "}
          <span className="text-[#E96435] font-semibold">task.</span> Together, let’s make{" "}
          <span className="text-[#2159a8] font-semibold">global health work</span>.
        </p>

        {/* Role Buttons */}
        <div className="flex justify-center gap-6 animate-fade-in-up delay-400">
          <Link
            to="/signup?role=TO"
            className="bg-[#E96435] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 hover:bg-orange-700 transition-transform transform"
          >
            I want to post a task
          </Link>
          <Link
            to="/signup?role=SP"
            className="bg-[#357FE9] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 hover:bg-blue-700 transition-transform transform"
          >
            I want to work on tasks
          </Link>
        </div>
      </div>

      {/* Tailwind Animations */}
      <style>
        {`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease forwards;
          }
          .delay-200 { animation-delay: 0.2s; }
          .delay-400 { animation-delay: 0.4s; }

          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-spin-slow { animation: spin-slow 25s linear infinite; }

          @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.2); opacity: 0.3; } }
          .animate-pulse-slow { animation: pulse-slow 20s ease-in-out infinite; }
        `}
      </style>
    </section>
  );
}
