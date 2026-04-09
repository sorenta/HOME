"use client";

import { usePathname } from "next/navigation";
import { ThemeToolbarIcon, THEME_ICON_META } from "@/components/icons";
import { useTheme } from "@/components/providers/theme-provider";
import { ThemeId } from "@/lib/theme-logic";

const THEMES: { id: ThemeId; name: string }[] = [
  { id: "hive", name: THEME_ICON_META.hive.name },
  { id: "pulse", name: THEME_ICON_META.pulse.name },
  { id: "forge", name: THEME_ICON_META.forge.name },
  { id: "botanical", name: THEME_ICON_META.botanical.name },
];

export function ThemeSwitcher() {
  const pathname = usePathname();
  const { themeId, setThemeId } = useTheme();

  if (pathname.startsWith("/sandbox")) {
    return null;
  }

  if (!pathname.startsWith("/settings")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-2 rounded-full border-2 border-border bg-card/90 p-2 shadow-theme backdrop-blur-md transition-all">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          onClick={() => setThemeId(theme.id)}
          className={`group flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
            themeId === theme.id 
              ? "scale-110 bg-primary/14 ring-1 ring-primary/50 shadow-lg" 
              : "bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
          }`}
          title={theme.name}
          aria-label={theme.name}
        >
          <ThemeToolbarIcon
            themeId={theme.id}
            size={28}
            tone={themeId === theme.id ? "active" : "inactive"}
          />
        </button>
      ))}
    </div>
  );
}
