import { useState, useEffect } from "react";

const PREFS_KEY = "maj-dashboard-prefs-v1";

export type DashboardPrefs = {
  showCalendar: boolean;
  showWater: boolean;
  showLogistics: boolean;
};

const defaultPrefs: DashboardPrefs = {
  showCalendar: true,
  showWater: true,
  showLogistics: true,
};

export function useDashboardPrefs() {
  const [prefs, setPrefs] = useState<DashboardPrefs>(defaultPrefs);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) {
        setPrefs(JSON.parse(stored));
      }
    } catch (e) {}
    setMounted(true);
  }, []);

  const updatePrefs = (newPrefs: Partial<DashboardPrefs>) => {
    setPrefs((prev) => {
      const updated = { ...prev, ...newPrefs };
      localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { prefs, updatePrefs, mounted };
}

