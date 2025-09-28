// src/components/Navbar.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-[#ffffff] via-[#f9fafc] to-[#f0f4ff] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/explore"
            className="group relative text-[#1E376E] font-medium hover:text-[#E96435] transition-colors"
          >
            Explore Tasks
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-[#E96435] transition-all group-hover:w-full"></span>
          </Link>
          <Link
            to="/login"
            className="group relative text-[#1E376E] font-medium hover:text-[#E96435] transition-colors"
          >
            Login
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-[#E96435] transition-all group-hover:w-full"></span>
          </Link>
          <Link
            to="/signup"
            className="bg-[#E96435] px-6 py-2 rounded-full font-semibold text-white shadow hover:bg-orange-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-[#1E376E] focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center bg-white border-t border-gray-200 py-4 space-y-4 shadow-inner">
          <Link
            to="/explore"
            className="text-[#1E376E] hover:text-[#E96435] font-medium transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Explore Tasks
          </Link>
          <Link
            to="/login"
            className="text-[#1E376E] hover:text-[#E96435] font-medium transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-[#E96435] px-6 py-2 rounded-full font-semibold text-white shadow hover:bg-orange-700 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
