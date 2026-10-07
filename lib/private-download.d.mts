import type {SupabaseClient} from '@supabase/supabase-js';
export function privateDownload(userClient:SupabaseClient,storageClient:()=>SupabaseClient,id:string):Promise<Response>;
