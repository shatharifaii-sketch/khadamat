import { countries } from "@/types/constants";

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