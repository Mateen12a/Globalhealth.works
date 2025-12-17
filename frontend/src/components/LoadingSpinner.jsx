import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoadingSpinner({ size = 24, text = "Loading...", className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
    >
      <Loader2
        className="animate-spin text-[var(--color-primary-light)]"
        style={{ width: size, height: size }}
      />
      {text && (
        <p className="text-[var(--color-text-secondary)] text-sm">{text}</p>
      )}
    </motion.div>
  );
}

export function PageLoader({ text = "Loading..." }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size={40} text={text} />
    </div>
  );
}

export function InlineLoader({ size = 16 }) {
  return (
    <Loader2
      className="animate-spin text-[var(--color-primary-light)]"
      style={{ width: size, height: size }}
    />
  );
}
