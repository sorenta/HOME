/**
 * AES-GCM šifrēšana RESET privātajām piezīmēm pirms Supabase.
 * Atslēga: nejauša 32 baitu vērtība šajā ierīcē (localStorage) — citā ierīcē vecās piezīmes nevar atšifrēt.
 */

const KEY_STORAGE = "majapps-reset-note-key-v1";
let volatileKeyB64: string | null = null;

function bytesToB64(bytes: Uint8Array): string {
  if (typeof btoa !== "function") {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(bytes).toString("base64");
    }
    throw new Error("Base64 encoder is unavailable");
  }

  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

function b64ToBytes(b64: string): Uint8Array {
  if (typeof atob !== "function") {
    if (typeof Buffer !== "undefined") {
      return new Uint8Array(Buffer.from(b64, "base64"));
    }
    throw new Error("Base64 decoder is unavailable");
  }

  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

async function getAesKey(): Promise<CryptoKey | null> {
  if (!globalThis.crypto?.subtle) return null;

  try {
    let rawB64 = readStoredKey();
    if (!rawB64) {
      const raw = globalThis.crypto.getRandomValues(new Uint8Array(32));
      rawB64 = bytesToB64(raw);
      writeStoredKey(rawB64);
    }
    const rawKey = b64ToBytes(rawB64);
    return globalThis.crypto.subtle.importKey(
      "raw",
      new Uint8Array(rawKey),
      "AES-GCM",
      false,
      ["encrypt", "decrypt"],
    );
  } catch {
    return null;
  }
}

function readStoredKey(): string | null {
  if (typeof localStorage !== "undefined") {
    try {
      return localStorage.getItem(KEY_STORAGE);
    } catch {
      // Fallback to in-memory key when storage access is blocked.
    }
  }

  return volatileKeyB64;
}

function writeStoredKey(value: string): void {
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(KEY_STORAGE, value);
      return;
    } catch {
      // Fallback to in-memory key when storage access is blocked.
    }
  }

  volatileKeyB64 = value;
}

export async function encryptResetNote(plain: string): Promise<string | null> {
  const t = plain.trim();
  if (!t) return null;
  const key = await getAesKey();
  if (!key) return null;
  const iv = new Uint8Array(12);
  globalThis.crypto.getRandomValues(iv);
  const enc = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(t),
  );
  const packed = new Uint8Array(iv.length + enc.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(enc), iv.length);
  return `v1:${bytesToB64(packed)}`;
}

export async function decryptResetNote(stored: string | null): Promise<string | null> {
  if (stored == null || stored === "") return null;
  if (!stored.startsWith("v1:")) return stored;
  const key = await getAesKey();
  if (!key) return null;
  try {
    const packed = b64ToBytes(stored.slice(3));
    const iv = new Uint8Array(packed.slice(0, 12));
    const data = new Uint8Array(packed.slice(12));
    const dec = await globalThis.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(dec);
  } catch {
    return null;
  }
}
