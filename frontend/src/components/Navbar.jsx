// src/components/Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-[#1E376E] text-white p-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold">GlobalHealth.Works</Link>
      <div className="space-x-4">
        <Link to="/explore" className="hover:text-[#F7B526]">Explore Tasks</Link>
        <Link to="/login" className="hover:text-[#F7B526]">Login</Link>
        <Link to="/signup" className="bg-[#E96435] px-4 py-2 rounded-lg font-semibold hover:bg-orange-700">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
