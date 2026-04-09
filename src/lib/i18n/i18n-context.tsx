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

type TParams = Record<string, string>;
const LOCALE_KEY = "majapps-locale-v2";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: TParams) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "lv";
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === "en" || saved === "lv") {
      return saved;
    }
  } catch {
    /* ignore */
  }
  return "lv";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("lv");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setLocaleState(getInitialLocale());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "lv";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: TParams) => {
      let s = dictionaries[locale][key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.split(`{${k}}`).join(v);
        }
      }
      return s;
    },
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
