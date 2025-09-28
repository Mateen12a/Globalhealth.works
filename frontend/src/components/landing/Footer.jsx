// src/components/landing/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#1E376E] text-white py-10 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold mb-3">GlobalHealth.Works</h3>
          <p className="text-gray-300 text-sm">
            Connecting health challenges with global solutions.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><Link to="/explore">Explore Tasks</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/login">Log in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <p className="text-gray-300 text-sm">info@globalhealth.works</p>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-400 text-xs">
        © {new Date().getFullYear()} GlobalHealth.Works. All rights reserved.
      </div>
    </footer>
  );
}
