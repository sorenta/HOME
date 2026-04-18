import type { ThemeId } from "@/lib/theme-logic";

const VIBRATE_SUPPORTED = typeof navigator !== "undefined" && "vibrate" in navigator;

/** Light tap feedback where the device supports `navigator.vibrate`. */
export function hapticTap(intensity: "soft" | "medium" | "heavy" | "double" = "medium") {
  if (!VIBRATE_SUPPORTED) return;
  
  switch (intensity) {
    case "soft":
      navigator.vibrate(8);
      break;
    case "medium":
      navigator.vibrate(15);
      break;
    case "heavy":
      navigator.vibrate(30);
      break;
    case "double":
      navigator.vibrate([10, 30, 10]);
      break;
    default:
      navigator.vibrate(15);
  }
}

/** 
 * Automatically applies the correct tactile feedback based on the active theme's personality.
 * - Pulse: Hard single tap (Heavy)
 * - Forge: Mechanical double click (Double)
 * - Botanical: Soft organic wave (Soft)
 * - Lucent/Hive: Balanced tap (Medium)
 */
export function hapticTheme(themeId: ThemeId) {
  if (!VIBRATE_SUPPORTED) return;
  
  if (themeId === "pulse") return hapticTap("heavy");
  if (themeId === "forge") return hapticTap("double");
  if (themeId === "botanical") return hapticTap("soft");
  
  return hapticTap("medium");
}
