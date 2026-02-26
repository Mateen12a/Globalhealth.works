// src/components/landing/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#1E376E] text-white py-12 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Brand Info */}
        <div>
          <h3 className="text-2xl font-bold mb-3">GlobalHealth.Works</h3>
          <p className="text-gray-300 text-sm md:text-base">
            Where Global Health Problems Meet Global Health Solutions.
          </p>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Legal</h4>
          <ul className="space-y-2 text-gray-300 text-sm md:text-base">
            <li>
              <Link 
                to="/terms" 
                onClick={() => window.scrollTo(0, 0)}
                className="hover:text-blue-300 hover:underline"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Contact Us</h4>
          <p className="text-gray-300 text-sm md:text-base">
            Email: <a href="mailto:info@globalhealth.works" className="underline hover:text-blue-300">info@globalhealth.works</a>
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-400 text-xs md:text-sm">
        © {new Date().getFullYear()} GlobalHealth.Works. All rights reserved.
      </div>
    </footer>
  );
}

