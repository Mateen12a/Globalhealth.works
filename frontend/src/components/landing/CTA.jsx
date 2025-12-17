import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Users, CheckCircle } from "lucide-react";

const benefits = [
  "Free to join and create a profile",
  "Access to verified health professionals",
  "Secure messaging and collaboration",
  "Global reach across 50+ countries",
];

export default function CTA() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-[#2a4a8f] to-[var(--color-primary)]" />
      
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Make a <span className="text-[var(--color-accent-light)]">Difference</span>?
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Join thousands of health professionals who are solving global health challenges together.
              Your expertise matters. Your impact starts here.
            </p>
            
            <ul className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3 text-white/90"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                    <CheckCircle size={14} className="text-[var(--color-accent-light)]" />
                  </div>
                  {benefit}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <Link
              to="/signup?role=TO"
              className="group flex items-center justify-between bg-[var(--color-accent)] hover:bg-[#d45428] text-white px-8 py-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Briefcase size={24} />
                </div>
                <div className="text-left">
                  <span className="block">Post a Task</span>
                  <span className="text-sm font-normal text-white/70">Find experts for your projects</span>
                </div>
              </div>
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            
            <Link
              to="/signup?role=SP"
              className="group flex items-center justify-between bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-6 rounded-2xl font-semibold text-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div className="text-left">
                  <span className="block">Become a Solution Provider</span>
                  <span className="text-sm font-normal text-white/70">Showcase your expertise globally</span>
                </div>
              </div>
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
