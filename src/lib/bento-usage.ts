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

export function getAdaptiveModuleOrder(): ModuleId[] {
  const counts = readCounts();
  return [...DEFAULT_ORDER].sort((a, b) => {
    const diff = (counts[b] ?? 0) - (counts[a] ?? 0);
    if (diff !== 0) return diff;
    return DEFAULT_ORDER.indexOf(a) - DEFAULT_ORDER.indexOf(b);
  });
}
