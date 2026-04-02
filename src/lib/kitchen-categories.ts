/** Stable DB values; labels come from i18n `kitchen.category.*`. */
export const KITCHEN_CATEGORY_SLUGS = [
  "dairy",
  "bakery",
  "meat",
  "veg",
  "frozen",
  "dry",
  "drinks",
  "other",
] as const;

export type KitchenCategorySlug = (typeof KITCHEN_CATEGORY_SLUGS)[number];

export function kitchenCategoryLabelKey(slug: string | null | undefined): string {
  const s = (slug ?? "").trim();
  if (!s) return "kitchen.category.none";
  if (KITCHEN_CATEGORY_SLUGS.includes(s as KitchenCategorySlug)) {
    return `kitchen.category.${s}`;
  }
  return "kitchen.category.other";
}
