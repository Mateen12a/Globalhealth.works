import { Link } from "react-router-dom";
import { Mail, Linkedin, MapPin, Phone, ArrowRight } from "lucide-react";
import ghwLogo from "../../assets/ghw-logo.png";

const footerLinks = {
  Platform: [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "For Task Owners", href: "/signup?role=TO" },
    { label: "For Solution Providers", href: "/signup?role=SP" },
    { label: "Browse Tasks", href: "/browse-tasks" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

  const { theme, toggleTheme } = useTheme();

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary-light)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-5">
            <Link to="/" className={`inline-flex items-center gap-3 mb-6 ${
                  theme === "dark"
                    ? "bg-white hover:bg-slate-700"
                    : ""
                }`}>
              <img src={ghwLogo} alt="Global Health Works" className="h-14 w-auto" />
              <span className="font-bold text-xl text-[var(--color-primary)]">Global Health Works</span>
            </Link>
            <p className="text-[var(--color-text-secondary)] max-w-sm mb-8 leading-relaxed text-lg">
              The Marketplace for Global Health Work. Connecting experts with impactful health projects worldwide.
            </p>
            
            <div className="space-y-4 mb-8">
              <a 
                href="mailto:info@globalhealth.works"
                className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-primary-light)] transition-colors">
                  <Mail size={18} />
                </div>
                <span>info@globalhealth.works</span>
              </a>
            </div>

            <div className="flex gap-3">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white hover:bg-[#0077b5] hover:border-[#0077b5] transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white hover:bg-black hover:border-black transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title}>
                  <h4 className="font-bold text-[var(--color-text)] mb-5 text-lg">{title}</h4>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.label}>
                        {link.href.startsWith('mailto:') || link.href.startsWith('http') ? (
                          <a 
                            href={link.href}
                            className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] transition-colors flex items-center gap-1 group"
                          >
                            <span>{link.label}</span>
                            <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </a>
                        ) : (
                          <Link 
                            to={link.href}
                            className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] transition-colors flex items-center gap-1 group"
                          >
                            <span>{link.label}</span>
                            <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              © {new Date().getFullYear()} GlobalHealth.Works. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
              <Link to="/privacy" className="hover:text-[var(--color-primary-light)] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-[var(--color-primary-light)] transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
