/* eslint-disable @next/next/no-img-element */
import React from "react";
// Use native <img> for small decorative theme icons to avoid Next Image
// client-side markup differences that can cause hydration mismatches.
import type { ThemeId } from "@/lib/theme-logic";

type ThemeImageIconProps = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  decorative?: boolean;
};

function ThemeImageIcon({ src, alt, size = 22, className = "", decorative = false }: ThemeImageIconProps) {
  return (
    <img
      src={src}
      alt={decorative ? "" : alt}
      aria-hidden={decorative}
      width={size}
      height={size}
      className={`object-contain ${className}`.trim()}
      loading="eager"
      decoding="async"
      style={{ color: "transparent" }}
    />
  );
}

type ThemeToolbarIconProps = {
  className?: string;
  decorative?: boolean;
  size?: number;
  tone?: "default" | "active" | "inactive";
};

export type AppSectionId =
  | "home"
  | "calendar"
  | "kitchen"
  | "finance"
  | "pharmacy"
  | "reset"
  | "profile"
  | "settings"
  | "household"
  | "legal";

export const THEME_ICON_META: Record<ThemeId, { name: string; src: string; alt: string }> = {
  lucent: { name: "Lucent", src: "/icons/lucent/placeholder.svg", alt: "Lucent icon" },
  hive: { name: "Hive", src: "/icons/hive/bee.svg", alt: "Hive icon" },
  pulse: { name: "Pulse", src: "/icons/pulse/zap.svg", alt: "Pulse icon" },
  forge: { name: "Forge", src: "/icons/forge/cogwheel-gear-svgrepo-com.svg", alt: "Forge icon" },
  botanical: { name: "Botanical", src: "/icons/botanical/leaf.svg", alt: "Botanical icon" },
};

function toneClass(tone: NonNullable<ThemeToolbarIconProps["tone"]>) {
  if (tone === "active") {
    return "opacity-100 saturate-125 drop-shadow-[0_0_0.45rem_rgba(255,255,255,0.18)]";
  }

  if (tone === "inactive") {
    return "opacity-65 saturate-[0.82] transition duration-300 group-hover:opacity-100 group-hover:saturate-100";
  }

  return "opacity-95";
}

export function ThemeToolbarIcon({
  className = "",
  decorative = true,
  size = 22,
  tone = "default",
  themeId,
}: ThemeToolbarIconProps & { themeId: ThemeId }) {
  const meta = THEME_ICON_META[themeId];

  if (!meta) {
    console.error(`Theme metadata not found for themeId: ${themeId}`);
    return null;
  }

  return (
    <ThemeImageIcon
      src={meta.src}
      alt={meta.alt}
      decorative={decorative}
      size={size}
      className={`${toneClass(tone)} ${className}`.trim()}
    />
  );
}

function sectionToneClass(tone: NonNullable<ThemeToolbarIconProps["tone"]>, themeId: ThemeId) {
  if (themeId === "forge") {
    if (tone === "active") {
      return "text-primary opacity-100 drop-shadow-[0_0_8px_rgba(225,29,46,0.8)] transition-all duration-300";
    }
    return "text-(--color-text-secondary) opacity-50 transition duration-300 group-hover:opacity-100 group-hover:text-primary group-hover:drop-shadow-[0_0_5px_rgba(225,29,46,0.4)]";
  }

  if (tone === "active") {
    return "text-(--color-text-primary) opacity-100 drop-shadow-[0_0_0.45rem_rgba(255,255,255,0.14)]";
  }

  if (tone === "inactive") {
    return "text-(--color-text-secondary) opacity-70 transition duration-300 group-hover:opacity-100 group-hover:text-(--color-text-primary)";
  }

  return "text-(--color-text-primary) opacity-90";
}

function sectionStrokeWidth(themeId: ThemeId) {
  if (themeId === "pulse") return 2.4;
  if (themeId === "forge") return 1.6;
  if (themeId === "hive") return 2.2;
  if (themeId === "lucent") return 1.9;
  return 2;
}

function AppSectionGlyph({
  sectionId,
  themeId,
}: {
  sectionId: AppSectionId;
  themeId: ThemeId;
}) {
  const accentFill = themeId === "pulse" ? "currentColor" : "none";
  const accentOpacity = themeId === "pulse" ? 0.14 : 0;
  const isForge = themeId === "forge";
  const isLucent = themeId === "lucent";

  // Forge technical accents (corner brackets/crosshairs)
  const forgeAccents = isForge ? (
    <g className="opacity-40">
      <path d="M2 6V2h4M18 2h4v4M2 18v4h4M18 22h4v-4" strokeWidth="1" />
    </g>
  ) : null;

  switch (sectionId) {
    case "home":
      if (isLucent) return (
        <>
          <path d="M4 11s3.5-5 8-8c4.5 3 8 8 8 8" />
          <path d="M6 10v7.5A2.5 2.5 0 0 0 8.5 20h7a2.5 2.5 0 0 0 2.5-2.5V10" />
          <path d="M12 14v6" />
        </>
      );
      return (
        <>
          {forgeAccents}
          <path d="M4.5 10.5 12 4l7.5 6.5" />
          <path d="M6.5 9.5V19a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9.5" />
          {isForge ? <path d="M12 12v3M10.5 13.5h3" strokeWidth="1" /> : <path d="M10 20v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20" />}
        </>
      );
    case "calendar":
      if (isLucent) return (
        <>
          <rect x="5" y="6" width="14" height="14" rx="4" />
          <path d="M8 4v4M16 4v4M5 11h14" />
          <circle cx="12" cy="15.5" r="1.5" />
        </>
      );
      return (
        <>
          {forgeAccents}
          <rect x="4" y="5.5" width="16" height="14.5" rx={isForge ? 0 : 2.5} />
          <path d="M8 4v3M16 4v3M4 9.5h16" />
          {isForge ? (
            <g strokeWidth="1">
              <circle cx="12" cy="14.5" r="3" />
              <path d="M12 13v1.5h1.5" />
            </g>
          ) : (
            <>
              <path d="M8 13h3M13 13h3M8 16.5h3" />
            </>
          )}
        </>
      );
    case "kitchen":
      if (isLucent) return (
        <>
          <path d="M4 12a8 8 0 0 0 16 0H4Z" />
          <path d="M9 5c0 2-2 3-2 3M15 5c0 2 2 3 2 3M12 4v4" />
        </>
      );
      return (
        <>
          {forgeAccents}
          <path d="M7 4.5v6.2M9 4.5v6.2M8 10.7v8.8" />
          <path d="M15.5 4.5c1.7 1.3 2.5 3 2.5 5.1 0 2.1-.8 3.8-2.5 5.1V20" />
          {isForge ? <circle cx="15.5" cy="9.5" r="1.5" strokeWidth="1" /> : <path d="M13.5 4.5v7.2c0 1.2.8 2.1 2 2.1h0" />}
        </>
      );
    case "finance":
      if (isLucent) return (
        <>
          <rect x="4" y="7" width="16" height="11" rx="3.5" />
          <path d="M15 12.5h5" />
          <circle cx="15" cy="12.5" r="1.5" />
        </>
      );
      return (
        <>
          {forgeAccents}
          <path d="M4.5 8.5h15a1.5 1.5 0 0 1 1.5 1.5v7.5A2.5 2.5 0 0 1 18.5 20h-12A2.5 2.5 0 0 1 4 17.5V10a1.5 1.5 0 0 1 .5-1.5Z" />
          <path d="M4.5 11h16" />
          {isForge ? (
            <g strokeWidth="1">
              <path d="M7 14h2M7 17h4M14 14h3M14 17h2" />
            </g>
          ) : (
            <>
              <circle cx="16.5" cy="15.5" r="1.8" fill={accentFill} fillOpacity={accentOpacity} />
              <path d="M16.5 13.7v3.6M15.3 14.8c.2-.4.6-.7 1.2-.7.8 0 1.3.4 1.3 1s-.5.9-1.1 1l-.5.1c-.6.1-1 .4-1.1 1" />
            </>
          )}
        </>
      );
    case "pharmacy":
      if (isLucent) return (
        <>
          <path d="M12 20.5C12 20.5 4.5 15 4.5 8.5a4.5 4.5 0 0 1 9-3 4.5 4.5 0 0 1 9 3C22.5 15 12 20.5 12 20.5Z" />
          <path d="M12 9v5M9.5 11.5h5" />
        </>
      );
      return (
        <>
          {forgeAccents}
          <path d="M9 5.5h6" />
          <path d="M8 7.5h8v11A1.5 1.5 0 0 1 14.5 20h-5A1.5 1.5 0 0 1 8 18.5v-11Z" />
          <path d="M12 10.5v5M9.5 13h5" />
          {isForge ? <path d="M16 9h3v8h-3" strokeWidth="1" /> : <path d="M16 9h1.5A1.5 1.5 0 0 1 19 10.5v6A1.5 1.5 0 0 1 17.5 18H16" />}
        </>
      );
    case "reset":
      if (isLucent) return (
        <>
          <path d="M12 3c0 5 4 9 9 9-5 0-9 4-9 9 0-5-4-9-9-9 5 0 9-4 9-9Z" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      );
      return (
        <>
          {forgeAccents}
          <circle cx="12" cy="12" r="6.2" />
          {isForge ? (
            <path d="M8 12h2M14 12h2M12 8v2M12 14v2" strokeWidth="1" />
          ) : (
            <path d="M12 8.2v7.6M8.2 12h7.6" />
          )}
          <path d="m18.2 5.8.8-1.8m.2 4.2 1.8-.8M5.8 18.2 4 19m1.8-13.2L5 4" />
        </>
      );
    case "profile":
      return (
        <>
          <circle cx="12" cy="8.5" r="3.2" />
          <path d="M5.5 19.5c1.5-3 3.7-4.5 6.5-4.5s5 1.5 6.5 4.5" />
        </>
      );
    case "settings":
      return (
        <>
          <path d="M5 7.5h8M15.5 7.5H19M10 7.5a1.5 1.5 0 1 0 0 0Zm-5 9h4M11 16.5h8M9.5 16.5a1.5 1.5 0 1 0 0 0Z" />
        </>
      );
    case "household":
      return (
        <>
          <circle cx="9" cy="9" r="2.4" />
          <circle cx="15.5" cy="10" r="1.9" />
          <path d="M5.8 19c.8-2.5 2.5-3.8 5-3.8 2.2 0 3.8 1.1 4.8 3.3" />
          <path d="M15.5 15.5c1.3.2 2.3.9 3 2.2" />
        </>
      );
    case "legal":
      return (
        <>
          <path d="M12 4.5c2.3 1.8 4.8 2.8 7.5 3v4.6c0 3.8-2.3 6.7-7.5 8.9-5.2-2.2-7.5-5.1-7.5-8.9V7.5c2.7-.2 5.2-1.2 7.5-3Z" />
          <path d="m9.5 12.4 1.8 1.8 3.5-3.7" />
        </>
      );
    default:
      return null;
  }
}

export function AppSectionIcon({
  sectionId,
  themeId,
  className = "",
  decorative = true,
  size = 22,
  tone = "default",
}: ThemeToolbarIconProps & { sectionId: AppSectionId; themeId: ThemeId }) {
  const strokeWidth = sectionStrokeWidth(themeId);

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden={decorative}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : `${sectionId} icon`}
      className={`${sectionToneClass(tone, themeId)} ${className}`.trim()}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap={themeId === "pulse" ? "square" : "round"}
      strokeLinejoin={themeId === "forge" ? "miter" : "round"}
    >
      <AppSectionGlyph sectionId={sectionId} themeId={themeId} />
    </svg>
  );
}

export const BotanicalIcon = () => (
  <ThemeImageIcon src={THEME_ICON_META.botanical.src} alt="Botanical Icon" />
);

export const ForgeIcon = () => (
  <ThemeImageIcon src={THEME_ICON_META.forge.src} alt="Forge Icon" />
);

export const HiveIcon = () => (
  <ThemeImageIcon src={THEME_ICON_META.hive.src} alt="Hive Icon" />
);

export const PulseIcon = () => (
  <ThemeImageIcon src={THEME_ICON_META.pulse.src} alt="Pulse Icon" />
);

export const CalendarIcon = () => (
  <ThemeImageIcon src="/icons/pulse/calendar-svgrepo-com.svg" alt="Calendar Icon" />
);

export const FinanceIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 -40.18 209.81 209.81" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>{`.cls-1{fill:#4CAF50;}`}</style>
    </defs>
    <g id="Layer_2" data-name="Layer 2">
      <g id="Layer_1-2" data-name="Layer 1">
        <path d="M127.4,0A82.83,82.83,0,0,1,172,13.68c7,4.48,14.11,8.73,20,14.74A78.44,78.44,0,0,1,206.1,47.73a34.5,34.5,0,0,1,3.21,21.68c-1.86,12-7.26,21.76-16.44,30.09-15.52,14.09-33.16,23.09-53.85,26.26-5.92.9-11.8,2.07-17.69,3.17-8.49,1.59-16.55-.75-24.46-3.12a106.61,106.61,0,0,1-32.12-16c-5.58-4-11.64-7.87-15.6-13.23-4.39-5.91-9.61-7.28-16.07-7.51-6.62-.24-13.15-.18-19.4,2.5a76.71,76.71,0,0,1-7.25,2.68,4.23,4.23,0,0,1-5-2.31c-1.63-3.55-2.24-7.27.29-10.58a63.59,63.59,0,0,1,8-8.91A80.1,80.1,0,0,1,36.81,56.35c4.84-1.68,7.43-4.5,8.76-9.43A63,63,0,0,1,50.9,34.28a26.14,26.14,0,0,1,5.65-7.41A106.34,106.34,0,0,1,112.06,1.7C117.15,1,122.29.56,127.4,0ZM18.72,78.73c2.81.17,3.9.43,4.93.27,5.73-.94,11.37-.16,17.05.49C50,80.56,57.76,83.43,61.85,92.93c2.42,5.61,7.18,9.54,12.28,12.88,11.21,7.35,23.63,11.44,36.77,13.52,3.1.48,6.28,1.32,9.34,1.08a124,124,0,0,0,39.8-9.88,79.26,79.26,0,0,0,27.64-20c5.13-5.76,8.25-12.23,10.63-19.33,2.52-7.51,1.52-14.71-1.63-21.7a51.08,51.08,0,0,0-4.33-7.38c-4.91-7.3-12.13-11.92-19.11-17-20.51-14.85-43.16-16.9-67.08-12C93,15.9,81.51,22.29,70.43,29.46a40,40,0,0,0-17.29,24.7A13,13,0,0,1,44.69,64c-1.86.75-3.81,1.28-5.65,2.07C32.24,69,25.66,72.35,18.72,78.73Z"/>
        <path className="cls-1" d="M18.72,78.73C25.66,72.35,32.24,69,39,66c1.84-.79,3.79-1.32,5.65-2.07a13,13,0,0,0,8.45-9.8,40,40,0,0,1,17.29-24.7C81.51,22.29,93,15.9,106.16,13.19c23.92-4.93,46.57-2.88,67.08,12,7,5.05,14.2,9.67,19.11,17a51.08,51.08,0,0,1,4.33,7.38c3.15,7,4.15,14.19,1.63,21.7-2.38,7.1-5.5,13.57-10.63,19.33a79.26,79.26,0,0,1-27.64,20,124,124,0,0,1-39.8,9.88c-3.06.24-6.24-.6-9.34-1.08-13.14-2.08-25.56-6.17-36.77-13.52-5.1-3.34-9.86-7.27-12.28-12.88C57.76,83.43,50,80.56,40.7,79.49,35,78.84,29.38,78.06,23.65,79,22.62,79.16,21.53,78.9,18.72,78.73Z"/>
      </g>
    </g>
  </svg>
);

export const StartIcon = ({ size = 22 }: { size?: number }) => (
  <svg fill="#000000" width={size} height={size} viewBox="0 0 29.529 29.53" xmlns="http://www.w3.org/2000/svg">
    <g>
      <g>
        <path d="M14.077,13.43c-0.557,0.018-0.848,0.5-0.802,1.109c0.046,0.614,0.376,1.022,0.873,1.007c0.5-0.014,0.791-0.466,0.8-1.077
          C14.954,13.906,14.646,13.414,14.077,13.43z"/>
        <path d="M10.437,13.833c-0.553,0.106-0.764,0.629-0.622,1.223c0.142,0.599,0.536,0.949,1.025,0.854
          c0.491-0.093,0.71-0.584,0.62-1.188C11.381,14.163,10.997,13.726,10.437,13.833z"/>
        <path d="M7.413,15.94C7.329,15.971,7.245,16,7.162,16.033c0.103,0.276,0.206,0.552,0.309,0.83
          c0.072-0.019,0.158-0.048,0.279-0.093c0.322-0.113,0.57-0.32,0.47-0.637C8.125,15.833,7.785,15.807,7.413,15.94z"/>
        <path d="M29.529,16.508l-3.768-2.394l3.197-1.867L25.604,11.4l0.453-3.007l-4.062,1.903l-1.318-3.135l-2.285,2.976l-2.458-5.477
          L14.069,9.89l-3.505-3.083L9.706,8.221l0.106,2.934L8.999,9.387L8.4,10.371L3.182,8.394l1.552,3.916L0,13.343l4.977,2.31
          L1.939,18.19l3.069,0.387l-1.825,3.322l4.598-2.495l2.131,5.465l0.92-2.132l0.049-3.053l0.925,1.922l0.606-1.186l1.703,3.866
          l0.587-3.522l2.866,3.426l1.294-4.163l1.038,0.562l0.363-1.051l1.342,1.971l1.418,0.764l0.611-2.844l3.373,2.024l-2.502-3.457
          L29.529,16.508z M8.852,16.665c-0.178,0.244-0.522,0.454-1.131,0.678c-0.339,0.125-0.601,0.207-0.76,0.248
          c-0.395-0.951-0.786-1.9-1.182-2.852c0.191-0.121,0.605-0.316,1.004-0.459c0.489-0.174,0.805-0.23,1.104-0.182
          c0.283,0.035,0.52,0.19,0.596,0.463c0.078,0.271-0.028,0.569-0.367,0.813c0.001,0.002,0.002,0.006,0.002,0.01
          c0.417-0.029,0.771,0.153,0.88,0.545C9.077,16.203,9.002,16.454,8.852,16.665z M10.907,16.471
          c-0.923,0.182-1.648-0.336-1.895-1.199c-0.257-0.902,0.245-1.786,1.338-1.998c1.141-0.213,1.841,0.456,1.93,1.312
          C12.384,15.615,11.823,16.295,10.907,16.471z M14.128,16.111c-0.941,0.032-1.57-0.595-1.676-1.486
          c-0.109-0.932,0.521-1.724,1.63-1.758c1.152-0.03,1.738,0.739,1.69,1.601C15.714,15.499,15.053,16.081,14.128,16.111z
           M18.749,16.438c0.063-0.396,0.124-0.793,0.185-1.189c0.057-0.374,0.129-0.825,0.215-1.275c-0.004,0-0.008-0.001-0.014-0.002
          c-0.188,0.372-0.412,0.785-0.605,1.125c-0.209,0.377-0.407,0.76-0.602,1.144c-0.188-0.029-0.375-0.056-0.563-0.08
          c-0.063-0.417-0.131-0.833-0.208-1.25c-0.071-0.378-0.145-0.835-0.189-1.252c-0.007,0-0.009,0-0.012,0
          c-0.061,0.42-0.124,0.9-0.186,1.289c-0.055,0.396-0.11,0.788-0.166,1.183c-0.223-0.02-0.447-0.035-0.67-0.049
          c0.127-1.042,0.264-2.082,0.413-3.122c0.371,0.024,0.742,0.058,1.112,0.1c0.08,0.361,0.155,0.723,0.228,1.084
          c0.062,0.375,0.115,0.778,0.138,1.153c0.005,0,0.009,0,0.015,0.002c0.146-0.347,0.325-0.74,0.494-1.066
          c0.18-0.323,0.366-0.645,0.557-0.964c0.36,0.063,0.721,0.135,1.078,0.216c-0.164,1.036-0.338,2.072-0.519,3.105
          C19.217,16.535,18.982,16.483,18.749,16.438z M20.146,16.819c-0.238-0.064-0.367-0.284-0.309-0.523
          c0.062-0.244,0.285-0.377,0.54-0.307c0.257,0.07,0.382,0.292,0.308,0.538C20.614,16.762,20.395,16.887,20.146,16.819z
           M21.182,17.131c-0.237-0.076-0.354-0.303-0.283-0.539c0.074-0.242,0.306-0.361,0.56-0.277c0.253,0.084,0.362,0.312,0.276,0.553
          C21.651,17.1,21.428,17.213,21.182,17.131z M22.738,17.258c-0.094,0.225-0.316,0.327-0.561,0.23
          c-0.244-0.094-0.345-0.323-0.262-0.553c0.084-0.23,0.319-0.334,0.568-0.237C22.736,16.797,22.828,17.028,22.738,17.258z
           M22.84,16.588c-0.18-0.072-0.361-0.144-0.541-0.209c0.209-0.675,0.416-1.348,0.619-2.023c0.277,0.102,0.555,0.21,0.83,0.324
          C23.443,15.313,23.141,15.951,22.84,16.588z"/>
        <path d="M7.726,14.887c-0.073-0.226-0.315-0.281-0.669-0.156c-0.171,0.062-0.265,0.107-0.328,0.141
          c0.085,0.227,0.171,0.456,0.256,0.686c0.082-0.031,0.165-0.062,0.249-0.092C7.63,15.324,7.797,15.11,7.726,14.887z"/>
      </g>
    </g>
  </svg>
);

export const ResetIcon = ({ size = 22 }: { size?: number }) => (
  <svg fill="#000000" width={size} height={size} viewBox="0 0 39.536 39.537" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M6.457,35.78h26.557v3.487h3.26c1.802,0,3.263-1.947,3.263-4.348V0.269h-3.263c-1.799,0-3.26,1.946-3.26,4.347v0.188H6.522
        V0.269h-3.26C1.461,0.269,0,2.215,0,4.616v34.65h3.262C4.84,39.267,6.157,37.769,6.457,35.78z M34.711,6.118
        c0-0.863,0.701-1.562,1.562-1.562h1.562c0,0,0,0.7,0,1.562c0,0.863-0.698,1.562-1.562,1.562h-1.562
        C34.711,7.68,34.711,6.98,34.711,6.118z M34.711,11.756c0-0.863,0.701-1.562,1.562-1.562h1.562c0,0,0,0.699,0,1.562
        c0,0.863-0.698,1.562-1.562,1.562h-1.562C34.711,13.318,34.711,12.619,34.711,11.756z M34.711,17.394
        c0-0.863,0.701-1.562,1.562-1.562h1.562c0,0,0,0.7,0,1.562c0,0.863-0.698,1.562-1.562,1.562h-1.562
        C34.711,18.956,34.711,18.257,34.711,17.394z M34.711,23.033c0-0.863,0.701-1.562,1.562-1.562h1.562c0,0,0,0.699,0,1.562
        c0,0.861-0.698,1.561-1.562,1.561h-1.562C34.711,24.593,34.711,23.895,34.711,23.033z M34.711,28.669
        c0-0.862,0.701-1.562,1.562-1.562h1.562c0,0,0,0.699,0,1.562c0,0.863-0.701,1.562-1.562,1.562H1.7C1.7,7.68,1.7,6.98,1.7,6.118z M1.7,6.118c0-0.863,0.699-1.562,1.562-1.562h1.562c0,0,0,0.7,0,1.562
        c0,0.863-0.701,1.562-1.562,1.562H1.7C1.7,7.68,1.7,6.98,1.7,6.118z M1.7,11.756c0-0.863,0.699-1.562,1.562-1.562h1.562
        c0,0,0,0.699,0,1.562c0,0.863-0.701,1.562-1.562,1.562H1.7C1.7,13.318,1.7,12.619,1.7,11.756z M1.7,17.394
        c0-0.863,0.699-1.562,1.562-1.562h1.562c0,0,0,0.7,0,1.562c0,0.863-0.701,1.562-1.562,1.562H1.7C1.7,18.956,1.7,18.257,1.7,17.394z
         M1.7,23.033c0-0.863,0.699-1.562,1.562-1.562h1.562c0,0,0,0.699,0,1.562c0,0.861-0.701,1.561-1.562,1.561H1.7
        C1.7,24.593,1.7,23.895,1.7,23.033z M1.7,28.669c0-0.862,0.699-1.562,1.562-1.562h1.562c0,0,0,0.699,0,1.562
        c0,0.863-0.701,1.562-1.562,1.562H1.7C1.7,30.232,1.7,29.533,1.7,28.669z M1.7,34.308c0-0.863,0.699-1.562,1.562-1.562h1.562
        c0,0,0,0.699,0,1.562s-0.701,1.562-1.562,1.562H1.7C1.7,35.871,1.7,35.171,1.7,34.308z"/>
    </g>
  </svg>
);
