"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { MAJAPPS_THEME_STORAGE_KEY, useTheme } from "@/components/providers/theme-provider";
import { migrateLegacyThemeId } from "@/lib/theme-logic";

/**
 * Theme source-of-truth rule (device vs profile):
 * - If `localStorage` already has a saved theme key, the device choice wins for this app load:
 *   do not overwrite with `profiles.theme_id` when the profile arrives (avoids a flash/jump).
 * - If there is no saved key (first visit or cleared storage), apply `profile.theme_id` when
 *   the profile loads so the account default/theme from the server is used.
 * - Changing theme in Settings still updates both DB and localStorage via setThemeId + profile update.
 */
function hasDeviceThemeKey(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MAJAPPS_THEME_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function ThemeProfileSync() {
  const { profile } = useAuth();
  const { themeId, setThemeId } = useTheme();

  useEffect(() => {
    const nextThemeId = profile?.theme_id;
    if (!nextThemeId) {
      return;
    }

    const resolved = migrateLegacyThemeId(nextThemeId);
    if (resolved === themeId) {
      return;
    }

    if (hasDeviceThemeKey()) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setThemeId(resolved);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [profile?.theme_id, setThemeId, themeId]);

  return null;
}
