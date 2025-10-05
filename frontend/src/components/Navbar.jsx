// src/components/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const userMenuRef = useRef();

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    ["token", "user", "role"].forEach((k) => localStorage.removeItem(k));
    navigate("/login");
  };

  const profileImage = user?.profileImage ? `${API_URL}${user.profileImage}` : "/default-avatar.png";

  return (
    <nav className="bg-gradient-to-r from-[#ffffff] via-[#f9fafc] to-[#f0f4ff] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {!user ? (
            <>
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
            </>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src={profileImage}
                  alt={user.name || "Profile"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#1E376E]"
                />
                <span className="text-[#1E376E] font-medium">{user.firstName || user.name}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                  <Link
                    to={user.role?.toLowerCase().includes("solution") ? "/dashboard/sp" : "/dashboard/to"}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}
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
          {!user ? (
            <>
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
            </>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src={profileImage}
                  alt={user.name || "Profile"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#1E376E]"
                />
              </button>

              {userMenuOpen && (
                <div className="absolute top-12 right-0 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                  <Link
                    to={user.role?.toLowerCase().includes("solution") ? "/dashboard/sp" : "/dashboard/to"}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setMenuOpen(false);
                    }}
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
