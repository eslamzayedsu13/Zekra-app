export type Lang = "ar" | "en";

const arNumber = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });
const enNumber = new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 });

/** Prices are whole Egyptian pounds. Arabic: "١٬٢٥٠ ج.م" — English: "EGP 1,250". */
export function formatPrice(amount: number, lang: Lang): string {
  const n = Math.round(amount);
  return lang === "ar" ? `${arNumber.format(n)} ج.م` : `EGP ${enNumber.format(n)}`;
}

export function formatNumber(n: number, lang: Lang): string {
  return (lang === "ar" ? arNumber : enNumber).format(n);
}

export function formatDate(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/**
 * Converts Arabic-Indic (٠-٩) and Eastern Arabic/Persian (۰-۹) digits to Latin (0-9).
 */
export function normalizeDigits(str: string): string {
  if (!str) return "";
  return str
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
}

/**
 * Normalizes an Egyptian mobile phone number:
 * - Converts Arabic/Persian digits to Latin
 * - Strips spaces, dashes, parentheses, dots
 * - Handles +20, 0020, 20 prefix
 * - Validates against 01[0125] + 8 digits
 */
export function normalizeEgyptianPhone(phone: string): { cleaned: string; isValid: boolean } {
  if (!phone) return { cleaned: "", isValid: false };
  let s = normalizeDigits(phone).trim();
  s = s.replace(/[\s\-().]+/g, "");

  if (s.startsWith("+20")) {
    s = s.slice(3);
  } else if (s.startsWith("0020")) {
    s = s.slice(4);
  } else if (s.startsWith("20") && s.length === 12) {
    s = s.slice(2);
  }

  if (s.length === 10 && /^[1][0125]/.test(s)) {
    s = "0" + s;
  }

  s = s.replace(/\D/g, "");
  const isValid = /^01[0125]\d{8}$/.test(s);
  return { cleaned: s, isValid };
}
