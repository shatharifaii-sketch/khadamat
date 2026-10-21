const MIN_LEN = 6;
const MAX_LEN = 120;

export function validatePassword(pw: unknown): string | null {
  if (typeof pw !== "string") return "invalid_password";
  const len = [...pw].length;
  if (len < MIN_LEN) return "password_too_short";
  if (len > MAX_LEN) return "password_too_long";
  return null;
}

export async function isPwned(pw: string): Promise<boolean> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(pw));
  const hex = [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  const prefix = hex.slice(0, 5);
  const suffix = hex.slice(5);
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const text = await res.text();
    return text.split("\n").some((l) => l.split(":")[0].trim() === suffix);
  } catch (error) {
    return false;
  }
}