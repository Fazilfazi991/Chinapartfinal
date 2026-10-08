export const categorySlugs: string[];
export const categoryPages: {
  value: string;
  label: string;
  detail: string;
  slug: string;
  image: string;
  families: string[];
}[];
export function findPartHref(input?: Record<string, string>): string;
export const articles: {
  slug: string;
  title: string;
  summary: string;
  image: string;
  legacy: string;
  sections: string[][];
}[];
export const mainRoutes: string[];
