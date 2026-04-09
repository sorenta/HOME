type RateLimitRecord = {
  count: number;
  resetAt: number;
};

// Viegla in-memory kešatmiņa Node.js procesam
const rateLimitCache = new Map<string, RateLimitRecord>();

/**
 * Pamata In-Memory Fixed-Window rate limiter.
 * Aizsargā AI end-pointus no pārslodzes (spam).
 * 
 * @param identifier Unikāls atslēgas vārds (piem. "finance:userId")
 * @param limit Maksimālais pieprasījumu skaits
 * @param windowMs Laika logs milisekundēs (piem., 60000 = 1 minūte)
 * @returns boolean True ja atļauts, false ja sasniegts limits
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(identifier);

  // Ja nav ieraksta vai laiks ir beidzies, sākam no jauna
  if (!record || now > record.resetAt) {
    rateLimitCache.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  // Ja limits sasniegts, noraidām
  if (record.count >= limit) {
    return false;
  }

  // Citādi palielinām skaitītāju
  record.count += 1;
  return true;
}
