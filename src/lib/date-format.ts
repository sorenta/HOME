import type { Locale } from "@/lib/i18n/dictionaries";

export function formatAppDate(
  value: string | Date | null | undefined,
  locale: Locale = "lv",
) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  // Izmantojam undefined, lai pārlūks automātiski piemērotu 
  // lietotāja operētājsistēmas/pārlūka reģionālos iestatījumus 
  // (dd.mm.yyyy vai mm/dd/yyyy) tā vietā, lai to uzspiestu cieti.
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
