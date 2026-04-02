"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { isThemeId } from "@/lib/theme-logic";

export function ThemeProfileSync() {
  const { profile } = useAuth();
  const { themeId, setThemeId } = useTheme();

  useEffect(() => {
    const nextThemeId = profile?.theme_id;
    if (!nextThemeId || !isThemeId(nextThemeId) || nextThemeId === themeId) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setThemeId(nextThemeId);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [profile?.theme_id, setThemeId, themeId]);

  return null;
}
