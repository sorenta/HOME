"use client";

import { motion, useAnimationControls } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

/* ─── Cartoon Easter Bunny SVG — sitting sticker style ─── */
function EasterBunny({ facingRight, blinking }: { facingRight: boolean; blinking: boolean }) {
  return (
    <svg
      width="62"
      height="72"
      viewBox="0 0 120 140"
      className="drop-shadow-lg"
      aria-hidden
      style={{ transform: facingRight ? "scaleX(1)" : "scaleX(-1)" }}
    >
      <defs>
        {/* Base fur — warm peach-brown */}
        <radialGradient id="maj-eb-fur" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f0c8a8" />
          <stop offset="60%" stopColor="#d4a07a" />
          <stop offset="100%" stopColor="#b8845e" />
        </radialGradient>
        {/* Darker brown for back/outline areas */}
        <radialGradient id="maj-eb-dark" cx="60%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#c8946a" />
          <stop offset="100%" stopColor="#a06840" />
        </radialGradient>
        {/* White belly/chest */}
        <radialGradient id="maj-eb-chest" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f5ece4" />
          <stop offset="100%" stopColor="#e8ddd0" />
        </radialGradient>
        {/* Pink inner ear */}
        <linearGradient id="maj-eb-earpink" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#f8a0b0" />
          <stop offset="100%" stopColor="#e87890" />
        </linearGradient>
        {/* Cheek blush */}
        <radialGradient id="maj-eb-blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f8a0b0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#f8a0b0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="58" cy="134" rx="32" ry="5" fill="#00000012" />

      {/* ── Back body (darker round hump) ── */}
      <ellipse cx="62" cy="88" rx="38" ry="34" fill="url(#maj-eb-dark)" />
      {/* Back leg (hind haunch) */}
      <ellipse cx="82" cy="100" rx="22" ry="20" fill="url(#maj-eb-dark)" />

      {/* ── Fluffy tail ── */}
      <circle cx="100" cy="90" r="10" fill="#fff8f0" />
      <circle cx="103" cy="87" r="5" fill="white" opacity="0.6" />
      <circle cx="98" cy="93" r="3.5" fill="white" opacity="0.3" />

      {/* ── Main body (lighter front) ── */}
      <ellipse cx="52" cy="90" rx="34" ry="32" fill="url(#maj-eb-fur)" />

      {/* ── White chest patch ── */}
      <ellipse cx="48" cy="88" rx="22" ry="24" fill="url(#maj-eb-chest)" />

      {/* ── Ears ── */}
      {/* Left ear */}
      <ellipse cx="38" cy="18" rx="12" ry="32" fill="url(#maj-eb-fur)" />
      <ellipse cx="38" cy="20" rx="7" ry="24" fill="url(#maj-eb-earpink)" opacity="0.7" />
      {/* Ear outline/shadow */}
      <path d="M28 6 Q38 -8 48 6" fill="none" stroke="#a06840" strokeWidth="1.2" opacity="0.3" />
      {/* Right ear */}
      <ellipse cx="68" cy="14" rx="12" ry="34" fill="url(#maj-eb-fur)" />
      <ellipse cx="68" cy="16" rx="7" ry="26" fill="url(#maj-eb-earpink)" opacity="0.7" />
      <path d="M58 2 Q68 -10 78 2" fill="none" stroke="#a06840" strokeWidth="1.2" opacity="0.3" />

      {/* ── Head — big and round ── */}
      <circle cx="52" cy="58" r="30" fill="url(#maj-eb-fur)" />
      {/* Head highlight */}
      <circle cx="46" cy="48" r="14" fill="white" opacity="0.06" />

      {/* ── White muzzle area ── */}
      <ellipse cx="52" cy="68" rx="18" ry="12" fill="#fff8f0" />

      {/* ── Eyes ── */}
      {blinking ? (
        <>
          <path d="M36 56 Q42 59 47 56" fill="none" stroke="#3e2015" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M57 56 Q62 59 68 56" fill="none" stroke="#3e2015" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Left eye */}
          <ellipse cx="41" cy="55" rx="9" ry="10" fill="white" />
          <ellipse cx="42" cy="56" rx="6" ry="7" fill="#3a1e0c" />
          <circle cx="44" cy="53" r="3" fill="white" />
          <circle cx="40" cy="58" r="1.5" fill="white" opacity="0.5" />
          {/* Left eyelashes */}
          <path d="M33 48 Q36 51 38 49" fill="none" stroke="#5a3520" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M35 46 Q37 50 40 47" fill="none" stroke="#5a3520" strokeWidth="1.1" strokeLinecap="round" />

          {/* Right eye */}
          <ellipse cx="63" cy="55" rx="9" ry="10" fill="white" />
          <ellipse cx="64" cy="56" rx="6" ry="7" fill="#3a1e0c" />
          <circle cx="66" cy="53" r="3" fill="white" />
          <circle cx="62" cy="58" r="1.5" fill="white" opacity="0.5" />
          {/* Right eyelashes */}
          <path d="M70 49 Q68 51 71 48" fill="none" stroke="#5a3520" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M72 47 Q69 50 73 46" fill="none" stroke="#5a3520" strokeWidth="1.1" strokeLinecap="round" />

          {/* Eyebrows — soft arcs */}
          <path d="M34 46 Q41 42 48 46" fill="none" stroke="#a06840" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
          <path d="M56 46 Q63 42 70 46" fill="none" stroke="#a06840" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
        </>
      )}

      {/* ── Cheek blush ── */}
      <circle cx="30" cy="62" r="8" fill="url(#maj-eb-blush)" />
      <circle cx="74" cy="62" r="8" fill="url(#maj-eb-blush)" />

      {/* ── Nose — heart-shaped pink ── */}
      <path d="M49 66 Q50 63 52 65 Q54 63 55 66 Q52 70 52 70 Q50 70 49 66 Z" fill="#e8707e" />

      {/* ── Mouth + tiny tongue ── */}
      <path d="M46 72 Q49 75 52 71.5 Q55 75 58 72" fill="none" stroke="#8d5c40" strokeWidth="1.3" strokeLinecap="round" />
      {/* Little pink tongue peek */}
      <ellipse cx="52" cy="74" rx="3" ry="2" fill="#f0889a" opacity="0.7" />

      {/* ── Whiskers ── */}
      <line x1="16" y1="62" x2="34" y2="64" stroke="#c4a07a" strokeWidth="0.9" opacity="0.5" />
      <line x1="15" y1="66" x2="34" y2="67" stroke="#c4a07a" strokeWidth="0.9" opacity="0.5" />
      <line x1="17" y1="70" x2="35" y2="69" stroke="#c4a07a" strokeWidth="0.9" opacity="0.4" />
      <line x1="70" y1="64" x2="88" y2="62" stroke="#c4a07a" strokeWidth="0.9" opacity="0.5" />
      <line x1="70" y1="67" x2="89" y2="66" stroke="#c4a07a" strokeWidth="0.9" opacity="0.5" />
      <line x1="69" y1="69" x2="87" y2="70" stroke="#c4a07a" strokeWidth="0.9" opacity="0.4" />

      {/* ── Front paws ── */}
      <ellipse cx="36" cy="116" rx="12" ry="8" fill="url(#maj-eb-fur)" />
      <ellipse cx="36" cy="118" rx="7" ry="4" fill="#fff8f0" />
      <ellipse cx="64" cy="116" rx="12" ry="8" fill="url(#maj-eb-fur)" />
      <ellipse cx="64" cy="118" rx="7" ry="4" fill="#fff8f0" />

      {/* ── Hind paw (visible one) ── */}
      <ellipse cx="88" cy="120" rx="14" ry="8" fill="url(#maj-eb-fur)" />
      <ellipse cx="90" cy="122" rx="8" ry="4" fill="#fff8f0" />

      {/* ── Body fur texture lines ── */}
      <path d="M38 78 Q42 76 40 82" fill="none" stroke="#c49870" strokeWidth="0.8" opacity="0.25" />
      <path d="M60 80 Q64 78 62 84" fill="none" stroke="#c49870" strokeWidth="0.8" opacity="0.25" />
      <path d="M48 94 Q52 92 50 98" fill="none" stroke="#c49870" strokeWidth="0.8" opacity="0.2" />
    </svg>
  );
}

/* ─── Main component ─── */
export function SpringRabbitCompanion() {
  const pathname = usePathname();
  const { t } = useI18n();
  const bodyCtrl = useAnimationControls();
  const hopping = useRef(false);
  const [leftPct, setLeftPct] = useState(10);
  const [facingRight, setFacingRight] = useState(true);
  const [blinking, setBlinking] = useState(false);

  // Blink every 2-5 seconds
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 180);
    };
    const id = setInterval(blink, 2000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, []);

  // Hop to a new random position along the bottom strip
  const hopToNewSpot = useCallback(() => {
    const next = 8 + Math.random() * 78;
    setFacingRight(next > leftPct);
    setLeftPct(next);
  }, [leftPct]);

  // Re-position on page change
  useEffect(() => {
    hopToNewSpot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Periodically hop while idle (every 5-9 seconds)
  useEffect(() => {
    const id = setInterval(hopToNewSpot, 5000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, [hopToNewSpot]);

  // Big jump when tapped — cartoon squash & stretch
  const doJump = useCallback(async () => {
    if (hopping.current) return;
    hopping.current = true;
    hapticTap();
    try {
      await bodyCtrl.start({
        y: [0, 8, -80, -60, -20, 4, 0],
        scaleY: [1, 0.6, 1.25, 1.1, 0.85, 1.05, 1],
        scaleX: [1, 1.3, 0.82, 0.92, 1.1, 0.97, 1],
        rotate: [0, 0, -12, 8, -4, 1, 0],
        transition: {
          duration: 0.85,
          times: [0, 0.08, 0.3, 0.48, 0.7, 0.88, 1],
          ease: [0.33, 1, 0.68, 1],
        },
      });
    } finally {
      hopping.current = false;
    }
  }, [bodyCtrl]);

  if (pathname.startsWith("/auth")) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-[45]"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 60px)" }}
      initial={false}
      animate={{ left: `${leftPct}%` }}
      transition={{ type: "spring", stiffness: 80, damping: 14, mass: 1 }}
      aria-hidden
    >
      <motion.button
        type="button"
        onClick={() => void doJump()}
        className="pointer-events-auto relative flex cursor-pointer touch-manipulation items-center justify-center rounded-full p-0 outline-none ring-offset-2 ring-offset-[color:var(--color-background)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]"
        aria-label={t("spring.rabbit.tapJump")}
      >
        <motion.div
          animate={bodyCtrl}
          initial={{ y: 0, scaleY: 1, scaleX: 1, rotate: 0 }}
          className="origin-bottom"
        >
          {/* Idle breathing + tiny hops */}
          <motion.div
            animate={{
              y: [0, -4, 0, -8, 0],
              scaleY: [1, 1.02, 1, 0.95, 1],
              scaleX: [1, 0.99, 1, 1.03, 1],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2.4,
              ease: "easeInOut",
              repeatDelay: 0.8,
            }}
            className="origin-bottom"
          >
            <EasterBunny facingRight={facingRight} blinking={blinking} />
          </motion.div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
