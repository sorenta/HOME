import type { Locale } from "@/lib/i18n/dictionaries";

export function formatAppDate(
  value: string | Date | null | undefined,
  locale: Locale = "lv",
) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(locale === "lv" ? "lv-LV" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
