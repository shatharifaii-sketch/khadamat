import { FieldError } from "react-hook-form";

export type FieldErrors = {
    fullNameError?: string;
    emailError?: string;
    phoneError?: string;
    passwordError?: string;
    passwordConfirmError?: string;
    formError?: string;
}

export type AuthResult<T = unknown> = {
    data: T | null;
    error: FieldErrors | null;
}

export const FIELD_FOR_CODE: Record<string, keyof FieldErrors> = {
    invalid_email: "emailError",
    invalid_phone: "phoneError",
    password_too_short: "passwordError",
    password_too_long: "passwordError",
    password_breached: "passwordError",
    passwords_do_not_match: "passwordConfirmError",
    invalid_name: "fullNameError"
}

export const CODE_ALIASES: Record<string, string> = {
    email_exists: "user_exists",
    phone_exists: "user_exists",
    password_too_short: "password_too_short",
    password_too_long: "password_too_long",
    password_breached: "password_breached"
}