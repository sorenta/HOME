"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface QuitStreakProgressRingProps {
  progress: number; // Progress as a percentage (0-100)
  size?: number; // Diameter of the ring
  strokeWidth?: number; // Width of the ring stroke
}

export function QuitStreakProgressRing({
  progress,
  size = 100,
  strokeWidth = 10,
}: QuitStreakProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const progressOffset = ((100 - progress) / 100) * circumference;
    setOffset(progressOffset);
  }, [progress, circumference]);

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        className="progress-ring__background"
        stroke="var(--color-surface-border)"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <motion.circle
        className="progress-ring__progress"
        stroke="var(--color-primary)"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </svg>
  );
}