/** Deterministic 0..1 from string (FNV-1a style) for stable egg positions per user/season/spot. */
export function hashToUnit(input: string): number {
  let h = 2_166_136_261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16_777_619);
  }
  return (h >>> 0) / 2 ** 32;
}

/**
 * Viewport % for a hidden Easter egg — avoids top chrome and bottom nav (approx).
 */
export function easterCollectiblePosition(
  seasonKey: string,
  spotId: string,
  userId: string | undefined,
): { leftPct: number; topPct: number } {
  const base = `${seasonKey}|${spotId}|${userId ?? "guest"}`;
  const u1 = hashToUnit(`${base}:x`);
  const u2 = hashToUnit(`${base}:y`);
  const leftPct = 5 + u1 * 86;
  const topPct = 12 + u2 * 62;
  return { leftPct, topPct };
}
