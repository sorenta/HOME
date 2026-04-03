"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

type Props = {
  /** The numeric value to animate to */
  value: number;
  /** Format function (e.g. formatEuro) */
  format: (n: number) => string;
  className?: string;
};

/**
 * Forge-theme odometer: digits roll up/down when value changes.
 * Other themes can use it too — it animates the number smoothly.
 */
export function OdometerValue({ value, format, className = "" }: Props) {
  const motionVal = useMotionValue(0);
  const displayed = useTransform(motionVal, (v) => format(v));
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.8,
      ease: "easeOut",
    });
    prevValue.current = value;
    return controls.stop;
  }, [value, motionVal]);

  return (
    <motion.span ref={ref} className={`tabular-nums ${className}`}>
      {displayed}
    </motion.span>
  );
}
