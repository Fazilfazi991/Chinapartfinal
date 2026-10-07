export const fields: string[];
export const blank: Record<string,string>;
export const requiredFields: string[];
export function validate(input: unknown, step?: number): Record<string,string>;
export function restoreDraft(raw: string | null): { data: Record<string,string>; step: number; id: string } | null;
