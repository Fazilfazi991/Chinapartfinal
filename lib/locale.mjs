import { english } from "./locales/en.mjs";
export const plannedLocales = ["ar", "zh"];
export function publicCopy(locale = "en") {
  return english;
}
// Planned locales deliberately fall back to English; no untranslated selector.
