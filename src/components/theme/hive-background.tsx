"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import styles from "./hive.module.css";

type Props = {
  beeCount?: number;
  navSelector?: string;
  className?: string;
};

function seededUnit(seed: number): number {
  const raw = Math.sin(seed * 12.9898) * 43758.5453123;
  return raw - Math.floor(raw);
}

export function HiveBackground({ beeCount = 5, navSelector, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const beeRefs = useRef<HTMLDivElement[]>([]);

  const [effectiveCount, setEffectiveCount] = useState<number>(() => Math.max(1, Math.floor(beeCount)));

  useEffect(() => {
    function updateCount() {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      const c = w < 640 ? 3 : w < 1100 ? 5 : 7;
      setEffectiveCount(Math.max(1, Math.floor(c)));
    }
    // initial
    updateCount();
    window.addEventListener("resize", updateCount);
    return () => window.removeEventListener("resize", updateCount);
  }, [beeCount]);

  const bees = useMemo(() => {
    const count = Math.max(1, Math.floor(effectiveCount));
    return Array.from({ length: count }).map((_, i) => {
      const seed = (i + 1) * 997 + count * 17;
      const ampXRand = seededUnit(seed + 0.11);
      const ampYRand = seededUnit(seed + 0.23);
      const speedRand = seededUnit(seed + 0.37);
      const phaseRand = seededUnit(seed + 0.53);
      const sizeRand = seededUnit(seed + 0.79);

      return {
        id: i,
        baseX: 8 + (i * (84 / count)), // percent of viewport width
        baseY: 12 + ((i * 11) % 62), // percent of viewport height
        ampX: 40 + ampXRand * 140,
        ampY: 18 + ampYRand * 72,
        speed: 0.35 + speedRand * 0.9,
        phase: phaseRand * Math.PI * 2,
        size: 22 + Math.floor(sizeRand * 36),
      };
    });
  }, [effectiveCount]);

  useEffect(() => {
    const nodes = beeRefs.current;
    let raf = 0;
    const start = performance.now();


    const vw = () => window.innerWidth;
    const vh = () => window.innerHeight;

    // Respect user's reduced motion preference
    const prefersReduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let landingTimer: number | undefined;
    if (prefersReduce) {
      // Place bees statically and don't start RAF
      nodes.forEach((el, i) => {
        const b = bees[i];
        if (!el || !b) return;
        const x = (b.baseX / 100) * vw();
        const y = (b.baseY / 100) * vh();
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(0deg)`;
      });
    } else {
      // mutable state per bee
      const state = bees.map((b) => ({ ...b, landed: false }));

      function animate(t: number) {
        const time = (t - start) / 1000;
        for (let i = 0; i < nodes.length; i++) {
          const el = nodes[i];
          const b = state[i];
          if (!el || !b) continue;
          if (b.landed) continue;
          const x = (b.baseX / 100) * vw() + Math.sin(time * b.speed + b.phase) * b.ampX;
          const y = (b.baseY / 100) * vh() + Math.sin(time * (b.speed * 0.95) + b.phase * 1.22) * b.ampY;
          const rotate = Math.sin(time * b.speed + b.phase) * 12;
          el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`;
        }
        raf = requestAnimationFrame(animate);
      }

      raf = requestAnimationFrame(animate);

      // Landing timer: only when animations run
      landingTimer = window.setInterval(() => {
        const idle = state.map((s, idx) => ({ s, idx })).filter((x) => !x.s.landed);
        if (idle.length === 0) return;
        if (Math.random() < 0.26) {
          const pick = idle[Math.floor(Math.random() * idle.length)];
          const idx = pick.idx;
          const el = nodes[idx];
          if (!el) return;
          const navEl = navSelector
            ? document.querySelector(navSelector)
            : document.querySelector("nav, header, .site-nav, .topbar");
          if (!navEl) return;
          const rect = navEl.getBoundingClientRect();
          const targetX = rect.left + rect.width / 2 - state[idx].size / 2;
          const targetY = rect.top + rect.height / 2 - state[idx].size / 2;
          state[idx].landed = true;
          el.style.transition = "transform 900ms cubic-bezier(.22,.9,.26,1)";
          el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) rotate(0deg)`;
          setTimeout(() => {
            state[idx].landed = false;
            el.style.transition = "";
          }, 2800 + Math.random() * 2400);
        }
      }, 4200) as unknown as number;
    }

    return () => {
      cancelAnimationFrame(raf);
      if (landingTimer) clearInterval(landingTimer);
    };
  }, [bees, navSelector]);

  function setBeeRef(el: HTMLDivElement | null, i: number) {
    if (!el) return;
    beeRefs.current[i] = el;
  }

  return (
    <div ref={containerRef} className={`${styles.hiveBgContainer} ${className ?? ""}`} aria-hidden>
      {bees.map((b, i) => (
        <div
          key={i}
          ref={(el) => setBeeRef(el, i)}
          className={styles.beeRoot}
          style={{
            width: b.size,
            height: b.size,
            left: 0,
            top: 0,
            transform: "translate3d(-100px, -100px, 0)",
          }}
        >
          <svg className={styles.beeSvg} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
            <g>
              <ellipse cx="32" cy="34" rx="10" ry="14" fill="#1f1f1f" opacity="0.92" />
              <ellipse cx="32" cy="30" rx="9" ry="12" fill="#ffd54a" />
              <path d="M22 28c6 2 20 2 26 0v6c-6 2-20 2-26 0z" fill="#000" opacity="0.85" />
              <path className={styles.wing} d="M18 18c8-8 18-8 28 0c-8 12-28 12-28 0z" fill="rgba(255,255,255,0.86)" />
              <path className={styles.wing} d="M46 16c-8-8-18-8-28 0c8 12 28 12 28 0z" fill="rgba(255,255,255,0.86)" />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
}

export default HiveBackground;
