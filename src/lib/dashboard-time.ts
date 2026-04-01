/** Slice for the home time-of-day notice card (morning / day / evening / night). */
export type TimeNoticeSlice = "morning" | "day" | "evening" | "night";

export function getTimeNoticeSlice(date: Date): TimeNoticeSlice {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "day";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

/** True in the small hours — show an extra rest / sleep suggestion. */
export function shouldShowSleepHint(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 23 || hour < 5;
}
