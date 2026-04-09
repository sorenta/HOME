export type KitchenCategory = 
  | "dairy" 
  | "meat" 
  | "veg" 
  | "fruit" 
  | "bakery" 
  | "dry" 
  | "frozen" 
  | "drinks" 
  | "sweets"
  | "other";

export interface ProductSuggestion {
  name: string;
  category: KitchenCategory;
}

export const PRODUCT_DICTIONARY: ProductSuggestion[] = [
  // Dairy (Piena produkti)
  { name: "Olas", category: "dairy" },
  { name: "Piens", category: "dairy" },
  { name: "Siers", category: "dairy" },
  { name: "Biezpiens", category: "dairy" },
  { name: "Sviests", category: "dairy" },
  { name: "Krējums", category: "dairy" },
  { name: "Jogurts", category: "dairy" },
  { name: "Kefīrs", category: "dairy" },
  
  // Meat (Gaļa un zivis)
  { name: "Vistas gaļa", category: "meat" },
  { name: "Cūkgaļa", category: "meat" },
  { name: "Liellopa gaļa", category: "meat" },
  { name: "Malta gaļa", category: "meat" },
  { name: "Lasis", category: "meat" },
  { name: "Desa", category: "meat" },
  { name: "Cīsiņi", category: "meat" },
  { name: "Bekons", category: "meat" },

  // Veg (Dārzeņi)
  { name: "Kartupeļi", category: "veg" },
  { name: "Burkāni", category: "veg" },
  { name: "Sīpoli", category: "veg" },
  { name: "Ķiploki", category: "veg" },
  { name: "Gurķi", category: "veg" },
  { name: "Tomāti", category: "veg" },
  { name: "Paprika", category: "veg" },
  { name: "Kāposti", category: "veg" },
  { name: "Salāti", category: "veg" },
  { name: "Brokoļi", category: "veg" },

  // Fruit (Augļi)
  { name: "Āboli", category: "fruit" },
  { name: "Banāni", category: "fruit" },
  { name: "Apelsīni", category: "fruit" },
  { name: "Citroni", category: "fruit" },
  { name: "Bumbieri", category: "fruit" },
  { name: "Vīnogas", category: "fruit" },
  { name: "Mellenes", category: "fruit" },
  { name: "Zemenes", category: "fruit" },

  // Bakery (Maize un konditorija)
  { name: "Maize", category: "bakery" },
  { name: "Baltmaize", category: "bakery" },
  { name: "Rupjmaize", category: "bakery" },
  { name: "Saldskābmaize", category: "bakery" },
  { name: "Bulciņas", category: "bakery" },
  { name: "Cepumi", category: "bakery" },
  { name: "Kūka", category: "bakery" },

  // Dry (Bakaleja)
  { name: "Rīsi", category: "dry" },
  { name: "Makaroni", category: "dry" },
  { name: "Griķi", category: "dry" },
  { name: "Milti", category: "dry" },
  { name: "Cukurs", category: "dry" },
  { name: "Sāls", category: "dry" },
  { name: "Eļļa", category: "dry" },
  { name: "Auzas", category: "dry" },
  { name: "Kafija", category: "dry" },
  { name: "Tēja", category: "dry" },
  { name: "Čia sēklas", category: "dry" },
  { name: "Linsēklas", category: "dry" },
  { name: "Rieksti", category: "dry" },
  { name: "Mandeļu piens", category: "dairy" },
  { name: "Avokado", category: "veg" },
  { name: "Spiļva", category: "other" },

  // Frozen (Saldēti)
  { name: "Saldēti dārzeņi", category: "frozen" },
  { name: "Saldējums", category: "frozen" },
  { name: "Pelmeņi", category: "frozen" },
  { name: "Saldētas ogas", category: "frozen" },

  // Drinks (Dzērieni)
  { name: "Ūdens", category: "drinks" },
  { name: "Sula", category: "drinks" },
  { name: "Gāzēts ūdens", category: "drinks" },
  { name: "Vīns", category: "drinks" },
  { name: "Alus", category: "drinks" },

  // Sweets (Saldumi)
  { name: "Šokolāde", category: "sweets" },
  { name: "Konfektes", category: "sweets" },
  { name: "Medus", category: "sweets" },
  { name: "Ievārījums", category: "sweets" },
];

export function getCategoryByProductName(name: string): KitchenCategory {
  const normalized = name.toLowerCase().trim();
  const match = PRODUCT_DICTIONARY.find(p => normalized.includes(p.name.toLowerCase()));
  return match ? match.category : "other";
}

export function getSuggestions(query: string): ProductSuggestion[] {
  if (!query || query.length < 2) return [];
  const normalized = query.toLowerCase();
  return PRODUCT_DICTIONARY.filter(p => p.name.toLowerCase().includes(normalized)).slice(0, 5);
}
