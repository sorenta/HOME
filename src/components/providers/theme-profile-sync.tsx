"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { migrateLegacyThemeId } from "@/lib/theme-logic";

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

    const frame = window.requestAnimationFrame(() => {
      setThemeId(resolved);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [profile?.theme_id, setThemeId, themeId]);

  return null;
}
