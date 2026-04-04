"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { ThemeId } from "@/lib/theme-logic";

const THEMES: { id: ThemeId; name: string; icon: string }[] = [
  { id: "lucent", name: "Lucent", icon: "☁️" },
  { id: "hive", name: "Hive", icon: "🐝" },
  { id: "pulse", name: "Pulse", icon: "⚡" },
  { id: "forge", name: "Forge", icon: "🏎️" },
  { id: "botanical", name: "Botanical", icon: "🌿" },
];

export function ThemeSwitcher() {
  const pathname = usePathname();
  const { themeId, setThemeId } = useTheme();

  if (!pathname.startsWith("/settings")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-2 p-2 bg-card border-2 border-border rounded-full shadow-theme backdrop-blur-md transition-all">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          onClick={() => setThemeId(theme.id)}
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
            themeId === theme.id 
              ? "bg-primary text-primary-foreground scale-110 shadow-lg" 
              : "bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/10"
          }`}
          title={theme.name}
        >
          <span className="text-xl">{theme.icon}</span>
        </button>
      ))}
    </div>
  );
}
