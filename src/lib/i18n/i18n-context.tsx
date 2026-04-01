"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Locale } from "./dictionaries";
import { dictionaries } from "./dictionaries";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "lv";
  const lang = navigator.language.split("-")[0];
  return lang === "en" ? "en" : "lv";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("lv");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("majapps-locale");
      if (saved === "en" || saved === "lv") {
        setLocaleState(saved);
        return;
      }
    } catch {
      /* ignore */
    }
    setLocaleState(detectLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "lv";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem("majapps-locale", next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string) => dictionaries[locale][key] ?? key,
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("I18nProvider missing");
  return ctx;
}

export { detectLocale };
