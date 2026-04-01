export type KitchenOnboardingCategoryId =
  | "dairy"
  | "vegetables"
  | "protein"
  | "pantry";

export type KitchenOnboardingOption = {
  id: string;
  label: string;
  unit?: string;
};

export type KitchenOnboardingCategory = {
  id: KitchenOnboardingCategoryId;
  titleKey: string;
  options: KitchenOnboardingOption[];
};

export const KITCHEN_ONBOARDING_CATEGORIES: KitchenOnboardingCategory[] = [
  {
    id: "dairy",
    titleKey: "kitchen.onboarding.category.dairy",
    options: [
      { id: "milk", label: "Piens", unit: "l" },
      { id: "kefir", label: "Kefīrs", unit: "l" },
      { id: "yogurt", label: "Jogurts", unit: "iep." },
      { id: "sour-cream", label: "Skābais krējums", unit: "iep." },
      { id: "butter", label: "Sviests", unit: "gab." },
      { id: "cheese", label: "Siers", unit: "gab." },
      { id: "cottage-cheese", label: "Biezpiens", unit: "iep." },
    ],
  },
  {
    id: "vegetables",
    titleKey: "kitchen.onboarding.category.vegetables",
    options: [
      { id: "potatoes", label: "Kartupeļi", unit: "kg" },
      { id: "carrots", label: "Burkāni", unit: "kg" },
      { id: "onions", label: "Sīpoli", unit: "kg" },
      { id: "tomatoes", label: "Tomāti", unit: "gab." },
      { id: "cucumbers", label: "Gurķi", unit: "gab." },
      { id: "paprika", label: "Paprika", unit: "gab." },
      { id: "salad", label: "Salāti", unit: "iep." },
    ],
  },
  {
    id: "protein",
    titleKey: "kitchen.onboarding.category.protein",
    options: [
      { id: "eggs", label: "Olas", unit: "gab." },
      { id: "chicken", label: "Vistas fileja", unit: "kg" },
      { id: "minced-meat", label: "Maltā gaļa", unit: "kg" },
      { id: "fish", label: "Zivs", unit: "gab." },
      { id: "beans", label: "Pupiņas", unit: "iep." },
      { id: "lentils", label: "Lēcas", unit: "iep." },
      { id: "tofu", label: "Tofu", unit: "iep." },
    ],
  },
  {
    id: "pantry",
    titleKey: "kitchen.onboarding.category.pantry",
    options: [
      { id: "rice", label: "Rīsi", unit: "iep." },
      { id: "buckwheat", label: "Griķi", unit: "iep." },
      { id: "pasta", label: "Makaroni", unit: "iep." },
      { id: "oats", label: "Auzu pārslas", unit: "iep." },
      { id: "flour", label: "Milti", unit: "iep." },
      { id: "oil", label: "Eļļa", unit: "gab." },
      { id: "bread", label: "Maize", unit: "gab." },
    ],
  },
];

export function kitchenOnboardingStorageKey(userId: string, householdId: string) {
  return `majapps-kitchen-onboarding-${userId}-${householdId}`;
}
