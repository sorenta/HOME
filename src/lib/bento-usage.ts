export type ModuleId =
  | "calendar"
  | "finance"
  | "reset"
  | "kitchen"
  | "pharmacy"
  | "settings";

const STORAGE_KEY = "majapps-module-usage";

function readCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function recordModuleVisit(id: ModuleId): void {
  if (typeof window === "undefined") return;
  try {
    const counts = readCounts();
    counts[id] = (counts[id] ?? 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  } catch {
    /* ignore */
  }
}

/** Kalendārs/notikumi (viena flīze) → pārējie mājas moduļi */
const DEFAULT_ORDER: ModuleId[] = [
  "calendar",
  "kitchen",
  "finance",
  "reset",
  "pharmacy",
];

export function getModuleTiers(): Record<ModuleId, "compact" | "featured"> {
  const counts = readCounts();
  const sorted = [...DEFAULT_ORDER].sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0));
  
  const out: any = {};
  DEFAULT_ORDER.forEach(id => {
    // Top 2 modules or modules with more than 10 visits become featured
    const isTop = sorted.indexOf(id) < 2;
    const hasHighUsage = (counts[id] ?? 0) > 10;
    out[id] = (isTop || hasHighUsage) ? "featured" : "compact";
  });
  
  // Settings is always compact
  out["settings"] = "compact";
  
  return out;
}
