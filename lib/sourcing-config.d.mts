export const categories: { value: string; label: string; detail: string }[];
export const subcategories: string[];
export const brands: { name: string; asset: string; darkBacking?: boolean }[];
export const qualityOptions: string[];
export const salesContact: {
  number: string;
  display: string;
  approval: string;
};
export const locales: {
  authoritative: string;
  available: string[];
  planned: string[];
};
export const futureCatalogue: { brandRoutingEnabled: boolean };
export function brandHref(
  name: string,
  options?: { catalogueEnabled?: boolean },
): string;
export function enquiryHref(input?: Record<string, string>): string;
export function salesHref(context?: Record<string, string>): string;
export function entryData(search: string): Record<string, string>;
