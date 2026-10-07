import type { SupabaseClient } from "@supabase/supabase-js";
export function vendorFingerprint(input: unknown): {
  data: Record<string, string>;
  digest: string;
};
export function saveVendor(
  client: SupabaseClient,
  input: unknown,
  id: string,
): Promise<{ reference: string; localTest: boolean }>;
export function saveLocalVendor(
  root: string,
  input: unknown,
  id: string,
): Promise<{ reference: string; localTest: boolean }>;
export function readVendors(
  client: SupabaseClient,
  page?: number,
): Promise<{ rows: Record<string, any>[]; hasMore: boolean }>;
