import type {SupabaseClient} from '@supabase/supabase-js';
export function readStaffInbox(client:SupabaseClient,page?:number):Promise<{page:number;rows:Record<string,any>[];hasMore:boolean}>;
