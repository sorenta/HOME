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

export function HiveBackground({ beeCount = 1, navSelector, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const beeRefs = useRef<HTMLDivElement[]>([]);

  const [effectiveCount, setEffectiveCount] = useState<number>(1);

  useEffect(() => {
    function updateCount() {
      if (typeof window === "undefined") return;
      // Lock to exactly 1 bee to fix performance lag issues
      setEffectiveCount(1);
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
        ampX: 40 + ampXRand * 80, // reduced amplitude for smoother flight
        ampY: 18 + ampYRand * 50,
        speed: 0.08 + speedRand * 0.15, // dramatically slower, lazy flight
        phase: phaseRand * Math.PI * 2,
        size: 16 + Math.floor(sizeRand * 24), // slightly smaller bees
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
          const x = (b.baseX / 100) * vw() + Math.sin(time * b.speed + b.phase) * b.ampX + Math.sin(time * b.speed * 2.3) * (b.ampX * 0.3);
          const y = (b.baseY / 100) * vh() + Math.sin(time * (b.speed * 0.85) + b.phase * 1.22) * b.ampY + Math.cos(time * b.speed * 1.7) * (b.ampY * 0.4);
          
          // More natural rotation that follows the movement direction
          const dx = Math.cos(time * b.speed + b.phase) * b.ampX * b.speed;
          const rotate = (dx / (b.ampX * b.speed)) * 15 + Math.sin(time * b.speed * 3) * 5; // lean into turns + slight wobble
          
          // Flip the bee horizontally depending on movement direction
          const scaleX = dx < 0 ? -1 : 1;
          
          el.style.transform = `translate3d(${x}px, ${y}px, 0) scaleX(${scaleX}) rotate(${rotate * scaleX}deg)`;
        }
        raf = requestAnimationFrame(animate);
      }

      raf = requestAnimationFrame(animate);

      // Landing timer: only when animations run
      landingTimer = window.setInterval(() => {
        const idle = state.map((s, idx) => ({ s, idx })).filter((x) => !x.s.landed);
        if (idle.length === 0) return;
        if (Math.random() < 0.15) { // 15% chance to try to land instead of 60%
          const pick = idle[Math.floor(Math.random() * idle.length)];
          const idx = pick.idx;
          const el = nodes[idx];
          if (!el) return;
          const rawList = document.querySelectorAll(
            navSelector ? navSelector : "nav, header, .bento-tile, .glass-panel, button, [role='button'], a, section, article, div.maj-dash-compose > div"
          );
          
          // Filter only elements mostly in viewport
          const vh = window.innerHeight;
          const vw = window.innerWidth;
          const visibleElements = Array.from(rawList).filter((el) => {
             const r = el.getBoundingClientRect();
             // Check if the TOP edge is generally visible since we land on the top edge
             return r.width > 20 && r.top > 20 && r.top < vh * 0.9 && r.left >= -50 && r.left < vw;
          });
          
          const navEl = visibleElements.length > 0 
            ? visibleElements[Math.floor(Math.random() * visibleElements.length)] 
            : null;
          
          if (!navEl) return;
          
          const rect = navEl.getBoundingClientRect();
          // Target the top edge of the element, randomizing horizontal position
          const targetX = Math.max(0, Math.min(vw - state[idx].size, rect.left + Math.random() * (rect.width - state[idx].size)));
          const targetY = rect.top - state[idx].size * 0.45; // lower onto the border, so the legs/body overlap the card edge for 3D effect
          
          state[idx].landed = true;
          let finalScaleX = 1;
          let landingAngle = 0;
          if (el.style.transform) {
            const currentTransform = el.style.transform;
            const match = currentTransform.match(/translate3d\(([^p]+)px,\s*([^p]+)px/);
            if (match && match.length >= 3) {
              const cx = parseFloat(match[1]);
              const cy = parseFloat(match[2]);
              
              // Determine direction vector
              const dx = targetX - cx;
              const dy = targetY - cy;
              
              landingAngle = Math.atan2(dy, Math.abs(dx)) * (180 / Math.PI);
              finalScaleX = dx < 0 ? -1 : 1;
            }
          }
          
          const speedMs = 3000 + Math.random() * 2000; // Slow, lazy swooping flight to land (3 to 5 seconds)
          el.style.transition = `transform ${speedMs}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
          el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scaleX(${finalScaleX}) rotate(${landingAngle * finalScaleX}deg)`;
          
          // Add a tiny 'wiggle' after landing by applying a short rotation animation later
          const restingAngle = (Math.random() * 20 - 10); // Between -10 and 10 degrees

          setTimeout(() => {
             if (state[idx].landed && el) {
                el.style.transition = "transform 1.0s ease-in-out"; // smooth wiggle into place
                el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scaleX(${finalScaleX}) rotate(${restingAngle * finalScaleX}deg)`;
                // Pause wings
                el.dataset.landed = "true";
             }
          }, speedMs);

          setTimeout(() => {
            state[idx].landed = false;
            if (el) {
              el.style.transition = "transform 2.0s ease-in-out"; // smooth takeoff
              delete el.dataset.landed;
              
              // Clear transition completely after takeoff so math animation takes over smoothly
              setTimeout(() => {
                 if (el) el.style.transition = "";
              }, 2000);
            }
          }, speedMs + 6000 + Math.random() * 8000); // stay landed for 6 to 14 seconds
        }
      }, 3000) as unknown as number; // check for landings less aggressively (every 3s)
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
            <defs>
              <clipPath id={`abdomenClip-${b.id}`}>
                <ellipse cx="26" cy="32" rx="14" ry="10" />
              </clipPath>
            </defs>
            <g>
              {/* Stinger */}
              <polygon points="8,32 14,29 14,35" fill="#1f1f1f" />
              
              {/* Abdomen with stripes */}
              <ellipse cx="26" cy="32" rx="14" ry="10" fill="#ffd54a" />
              <g clipPath={`url(#abdomenClip-${b.id})`}>
                <rect x="16" y="20" width="4" height="24" fill="#1f1f1f" />
                <rect x="24" y="20" width="4" height="24" fill="#1f1f1f" />
                <rect x="32" y="20" width="4" height="24" fill="#1f1f1f" />
              </g>
              
              {/* Thorax */}
              <circle cx="40" cy="32" r="8" fill="#1f1f1f" />
              
              {/* Head */}
              <circle cx="49" cy="32" r="5" fill="#ffd54a" />
              
              {/* Eyes */}
              <circle cx="51" cy="29" r="1.5" fill="#1f1f1f" />
              <circle cx="51" cy="35" r="1.5" fill="#1f1f1f" />
              
              {/* Antennae */}
              <path d="M 52 28 Q 56 23 59 25" fill="none" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 52 36 Q 56 41 59 39" fill="none" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Wings */}
              <path className={styles.wingTop} d="M 40 28 Q 20 5, 22 20 Q 30 28, 40 28 Z" fill="rgba(255,255,255,0.8)" stroke="#e0e0e0" strokeWidth="1" />
              <path className={styles.wingBottom} d="M 40 36 Q 20 59, 22 44 Q 30 36, 40 36 Z" fill="rgba(255,255,255,0.8)" stroke="#e0e0e0" strokeWidth="1" />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
}

export default HiveBackground;
