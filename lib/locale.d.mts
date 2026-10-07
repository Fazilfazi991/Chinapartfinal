export const plannedLocales: string[];
export function publicCopy(locale?: string): {
  locale: string;
  direction: string;
  navigation: string[][];
  actions: { enquiry: string; find: string; sales: string; technical: string };
};
