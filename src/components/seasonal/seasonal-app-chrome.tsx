"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSeasonal } from "@/components/providers/seasonal-provider";
import { getSeasonalVisuals } from "@/lib/seasonal-visuals";

function classesForTheme(themeId: string) {
  switch (themeId) {
    case "christmas":
      return {
        shell: "maj-seasonal-shell maj-seasonal-shell-christmas",
        top: "maj-seasonal-garland",
        bottom: "maj-seasonal-lights",
        left: "maj-seasonal-fir",
        right: "maj-seasonal-fir",
      };
    case "midsummer":
      return {
        shell: "maj-seasonal-shell maj-seasonal-shell-midsummer",
        top: "maj-seasonal-meijas",
        bottom: "maj-seasonal-wreath",
        left: "maj-seasonal-oak-leaves",
        right: "maj-seasonal-oak-leaves",
      };
    case "state":
      return {
        shell: "maj-seasonal-shell maj-seasonal-shell-state",
        top: "maj-seasonal-flags",
        bottom: "maj-seasonal-ribbon",
        left: "maj-seasonal-ribbon-side",
        right: "maj-seasonal-ribbon-side",
      };
    case "womensday":
      return {
        shell: "maj-seasonal-shell maj-seasonal-shell-womensday",
        top: "maj-seasonal-flowers",
        bottom: "maj-seasonal-ribbon",
        left: "maj-seasonal-blossom-side",
        right: "maj-seasonal-blossom-side",
      };
    case "mensday":
      return {
        shell: "maj-seasonal-shell maj-seasonal-shell-mensday",
        top: "maj-seasonal-ribbon",
        bottom: "maj-seasonal-ember-line",
        left: "maj-seasonal-crest-side",
        right: "maj-seasonal-crest-side",
      };
    case "easter":
      return {
        shell: "maj-seasonal-shell maj-seasonal-shell-easter",
        top: "maj-seasonal-pupoli",
        bottom: "maj-seasonal-egg-border",
        left: "maj-seasonal-branch-side",
        right: "maj-seasonal-branch-side",
      };
    default:
      return {
        shell: "maj-seasonal-shell maj-seasonal-shell-soft",
        top: "maj-seasonal-soft-line",
        bottom: "maj-seasonal-soft-line",
        left: "maj-seasonal-soft-side",
        right: "maj-seasonal-soft-side",
      };
  }
}

export function SeasonalAppChrome() {
  const pathname = usePathname();
  const { activeTheme, isUnlocked } = useSeasonal();

  if (!activeTheme || pathname.startsWith("/auth")) return null;

  const chrome = classesForTheme(activeTheme.id);
  const sprites = getSeasonalVisuals(activeTheme);

  return (
    <div
      className={[
        "maj-seasonal-shell-root",
        chrome.shell,
        isUnlocked ? "maj-seasonal-shell-unlocked" : "",
      ].join(" ")}
      aria-hidden
    >
      <div className={["maj-seasonal-top", chrome.top].join(" ")} />
      <div className={["maj-seasonal-side left-0", chrome.left].join(" ")} />
      <div className={["maj-seasonal-side right-0", chrome.right].join(" ")} />
      <div className={["maj-seasonal-bottom", chrome.bottom].join(" ")} />
      <div className="maj-seasonal-floaters">
        {sprites.map((sprite, index) => (
          <motion.span
            key={`${activeTheme.seasonKey}-${sprite.kind}-${index}`}
            className={[
              "maj-seasonal-sprite",
              `maj-seasonal-sprite--${sprite.kind}`,
              isUnlocked ? "maj-seasonal-sprite--unlocked" : "",
            ].join(" ")}
            style={{
              left: `${sprite.x}%`,
              top: `${sprite.y}%`,
              width: `${sprite.size}px`,
              height: `${sprite.size}px`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.42, 0.78, 0.54],
              x: [0, sprite.driftX, 0, -sprite.driftX * 0.55, 0],
              y: [0, -sprite.driftY, sprite.driftY * 0.45, 0],
              rotate: [0, sprite.rotate, -sprite.rotate * 0.7, 0],
              scale: [1, 1.05, 0.97, 1],
            }}
            transition={{
              duration: sprite.duration,
              delay: sprite.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
