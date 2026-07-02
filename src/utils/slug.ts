import { nanoid } from "nanoid";

/**
 * Generate a URL-safe slug from text.
 * For Farsi text, transliterates common characters or falls back to nanoid.
 */
export function generateSlug(text: string): string {
  // Transliterate common Farsi characters for slugs
  const transliterationMap: Record<string, string> = {
    ا: "a", ب: "b", پ: "p", ت: "t", ث: "s", ج: "j", چ: "ch",
    ح: "h", خ: "kh", د: "d", ذ: "z", ر: "r", ز: "z", ژ: "zh",
    س: "s", ش: "sh", ص: "s", ض: "z", ط: "t", ظ: "z",
    ع: "a", غ: "gh", ف: "f", ق: "gh", ک: "k", گ: "g",
    ل: "l", م: "m", ن: "n", و: "v", ه: "h", ی: "y",
    " ": "-", "‌": "-", "،": "", ".": "", "؟": "", "!": "",
  };

  const hasFarsi = /[؀-ۿ]/.test(text);

  if (!hasFarsi) {
    // English/Latin text
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  // Farsi text — transliterate
  let slug = "";
  for (const char of text) {
    slug += transliterationMap[char] ?? "";
  }

  // Clean up
  slug = slug
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  // If slug is empty or too short, use nanoid
  if (slug.length < 3) {
    slug = nanoid(10);
  }

  return slug.toLowerCase();
}

/**
 * Generate an order number: ORD-{6 uppercase chars}
 */
export function generateOrderNumber(): string {
  return `ORD-${nanoid(6).toUpperCase()}`;
}
