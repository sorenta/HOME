"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function randomSpot() {
  return {
    x: 10 + Math.random() * 72,
    y: 22 + Math.random() * 48,
  };
}

function BrownRabbitIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 72"
      width="48"
      height="54"
      aria-hidden
    >
      <ellipse cx="34" cy="52" rx="20" ry="14" fill="#5c3d24" />
      <ellipse cx="32" cy="34" rx="16" ry="18" fill="#6b4423" />
      <ellipse cx="22" cy="14" rx="5" ry="18" fill="#5a361c" transform="rotate(-8 22 14)" />
      <ellipse cx="42" cy="14" rx="5" ry="18" fill="#5a361c" transform="rotate(8 42 14)" />
      <circle cx="26" cy="32" r="3" fill="#1a120c" />
      <circle cx="38" cy="32" r="3" fill="#1a120c" />
      <ellipse cx="32" cy="38" rx="4" ry="2.5" fill="#4a2e18" opacity="0.5" />
      <ellipse cx="18" cy="54" rx="6" ry="4" fill="#5c3d24" />
      <ellipse cx="48" cy="54" rx="6" ry="4" fill="#5c3d24" />
    </svg>
  );
}

export function SpringRabbitCompanion() {
  const pathname = usePathname();
  const [spot, setSpot] = useState(randomSpot);
  const [hopKey, setHopKey] = useState(0);

  useEffect(() => {
    setSpot(randomSpot());
    setHopKey((k) => k + 1);
  }, [pathname]);

  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none fixed z-[45] -translate-x-1/2 -translate-y-1/2"
      initial={false}
      animate={{
        left: `${spot.x}%`,
        top: `${spot.y}%`,
      }}
      transition={{ type: "spring", stiffness: 280, damping: 22, mass: 0.85 }}
      aria-hidden
    >
      <motion.div
        key={hopKey}
        initial={{ y: 18, scale: 1.08 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 16 }}
      >
        <motion.div
          animate={{ y: [0, -11, 0, -7, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.85,
            ease: "easeInOut",
            delay: 0.35,
          }}
        >
          <BrownRabbitIcon className="drop-shadow-md" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
