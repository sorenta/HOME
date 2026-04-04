"use client";

import React from "react";
import styles from "./hive.module.css";

type Props = {
  variant?: "hexagon" | "octagon";
  large?: boolean;
  honeyCap?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function HiveCard({ variant = "hexagon", large = false, honeyCap = false, className = "", children }: Props) {
  const clipClass = variant === "hexagon" ? styles.hiveHexagon : styles.hiveOctagon;
  const largeClass = large ? styles.hiveCardLarge : "";

  return (
    <div className={`bento-tile ${clipClass} ${styles.hiveCard} ${largeClass} ${className}`}>
      {honeyCap && (
        <div className={styles.honeyCap} aria-hidden>
          <svg viewBox="0 0 800 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 70 C80 20, 160 100, 260 70 C360 40, 420 90, 520 70 C620 50, 720 96, 800 70 L800 200 L0 200 Z" fill="var(--color-primary)" opacity="0.96" />
          </svg>
          <div style={{ position: 'relative', width: '100%', height: 0 }}>
            <span className={`${styles.drip} ${styles.dripSlow}`} style={{ left: '16%' }} />
            <span className={`${styles.drip} ${styles.dripMed}`} style={{ left: '42%' }} />
            <span className={`${styles.drip} ${styles.dripFast}`} style={{ left: '74%' }} />
          </div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

export default HiveCard;
