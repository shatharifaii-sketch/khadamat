export interface User {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  is_service_provider?: boolean;
  location?: string;
  bio?: string;
  experience_years?: number;
  password?: string;
  is_admin?: boolean;
  verify_phone?: boolean;
  verify_email?: boolean;
}

type PasswordError =
  | "password_too_short"
  | "password_too_long"
  | "password_no_lowercase"
  | "password_no_uppercase"
  | "password_no_number"
  | "password_no_symbol"
  | null;

const MIN_LEN = 6;
const MAX_LEN = 120;


function validatePassword(password: string): PasswordError {
  if ([...password].length < MIN_LEN) {
    return "password_too_short"
  }

  if ([...password].length > MAX_LEN) {
    return "password_too_long"
  }

  if (!/\p{Ll}/u.test(password)) {
    return "password_no_lowercase"
  }

  if (!/\p{Lu}/u.test(password)) {
    return "password_no_uppercase"
  }

  if (!/\p{N}/u.test(password)) {
    return "password_no_number"
  }

  if (!/[^\p{L}\p{N}\s]/u.test(password)) {
    return "password_no_symbol"
  }

  return null
}

export const validateAdminUserForm = (form: Partial<User>) => {
  if ((!form.email || form.email.length < 10) && form.verify_email) {
    return "verify_no_email"
  }

  if ((!form.phone || form.phone.length < 5) && form.verify_phone) {
    return "verify_no_phone"
  }

  if (!form.password) {
    return "no_password"
  }

  const passwordValidation = validatePassword(form.password);

  if (passwordValidation) {
    return passwordValidation
  }

  return null
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