"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";
import { transitionForTheme } from "@/lib/theme-logic";

type FeedbackType = "success" | "error" | "warning" | "info";

type Props = {
  type: FeedbackType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function ThemedFeedback({ type, title, message, action }: Props) {
  const { themeId } = useTheme();
  const spring = transitionForTheme(themeId);

  const isError = type === "error";
  const isSuccess = type === "success";

  // Theme-specific icons and colors
  const getVisuals = () => {
    switch (themeId) {
      case "forge":
        return {
          icon: isError ? "⚠️" : "⚡",
          bg: isError ? "bg-red-500/10" : "bg-emerald-500/10",
          border: isError ? "border-red-500/40" : "border-emerald-500/40",
          text: isError ? "text-red-500" : "text-emerald-500",
          extra: isError ? "maj-forge-scanline opacity-50" : "animate-pulse"
        };
      case "botanical":
        return {
          icon: isError ? "🍂" : "🌸",
          bg: isError ? "bg-amber-900/10" : "bg-emerald-500/10",
          border: isError ? "border-amber-700/20" : "border-emerald-500/20",
          text: isError ? "text-amber-800" : "text-emerald-700",
          extra: "liquid-shape"
        };
      case "pulse":
        return {
          icon: isError ? "💥" : "🤘",
          bg: "bg-white",
          border: "border-4 border-black",
          text: "text-black",
          extra: "maj-pulse-neo-shadow"
        };
      case "lucent":
        return {
          icon: isError ? "☁️" : "✨",
          bg: "bg-white/40",
          border: "border border-white/60",
          text: "text-foreground",
          extra: "backdrop-blur-xl shadow-lg"
        };
      default:
        return {
          icon: isError ? "❌" : "✅",
          bg: "bg-background/80",
          border: "border border-border",
          text: "text-foreground",
          extra: ""
        };
    }
  };

  const v = getVisuals();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={spring}
      className={`p-6 rounded-3xl border ${v.bg} ${v.border} ${v.extra} relative overflow-hidden`}
    >
      <div className="flex flex-col items-center text-center space-y-3 relative z-10">
        <motion.span 
          animate={isSuccess ? { rotate: [0, 10, -10, 0] } : { x: [0, -5, 5, 0] }}
          transition={{ duration: 0.5, repeat: isSuccess ? 0 : 2 }}
          className="text-4xl"
        >
          {v.icon}
        </motion.span>
        <div className="space-y-1">
          <h3 className={`text-sm font-black uppercase tracking-widest ${v.text}`}>
            {title}
          </h3>
          {message && (
            <p className="text-xs font-medium opacity-70 leading-relaxed max-w-[240px]">
              {message}
            </p>
          )}
        </div>
        
        {action && (
          <button
            onClick={action.onClick}
            className={`mt-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all hover:scale-105 active:scale-95 ${v.border} ${v.text}`}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Background decoration for Forge */}
      {themeId === "forge" && isError && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent)] pointer-events-none" />
      )}
    </motion.div>
  );
}
