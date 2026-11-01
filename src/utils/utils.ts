import { countries } from "@/types/constants";
import { ARABIC_INDIC, PERSIAN } from "@/types/deal";

export function splitPhoneNumber(phone: string) {
  const normalized = phone ? phone.replace(/^\+/, "") : "";

  const country = countries
    .sort((a, b) => b.code.length - a.code.length)
    .find(c => normalized.startsWith(c.code));

  if (!country) {
    return {
      countryCode: "",
      number: normalized,
    };
  }

  return {
    countryCode: country.code,
    number: normalized.slice(country.code.length),
  };
}

export function toWesternDigits(input: string): string {
  return input.replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC.indexOf(d))).replace(/[۰-۹]/g, (d) => String(PERSIAN.indexOf(d)));
}

export function normalizeDecimalInput(input: string): string {
  let s = toWesternDigits(input).replace(/[٫,،]/g, ".")
    .replace(/[٬\s]/g, "")
    .replace(/[^\d.]/g, "");

  const i = s.indexOf(".");
  if (i !== -1) {
    s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, "");
    s = s.replace(/^(\d*\.\d{0,2}).*s$/, "$1");
  }

  return s;
}