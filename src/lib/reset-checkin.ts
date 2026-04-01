const KEY = "majapps-last-reset-date";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function hasResetCheckInToday(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(KEY) === todayIso();
  } catch {
    return true;
  }
}

export function markResetCheckInDone(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, todayIso());
  } catch {
    /* ignore */
  }
}
