// src/components/dashboard/DashboardStats.jsx
import { motion } from "framer-motion";
import { ClipboardCheck, Clock, Target, Briefcase } from "lucide-react";

export default function DashboardStats({ stats }) {
  const statIcons = {
    total: ClipboardCheck,
    inProgress: Clock,
    completed: Target,
    active: Briefcase,
  };

  const container = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, duration: 0.4 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {stats.map(({ label, value, color, type }) => {
        const Icon = statIcons[type] || ClipboardCheck;
        return (
          <motion.div
            key={label}
            variants={item}
            className={`p-5 rounded-2xl shadow-sm border bg-gradient-to-br from-white to-gray-50 hover:shadow-md hover:scale-[1.02] transition-transform`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">{label}</h4>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-semibold text-[#1E376E]">{value}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
