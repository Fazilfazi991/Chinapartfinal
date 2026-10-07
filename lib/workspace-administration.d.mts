import type {SupabaseClient} from '@supabase/supabase-js';
import type {AdministrationSnapshot} from './preview-domain.mjs';
export function readWorkspaceAdministration(client:SupabaseClient,service:()=>SupabaseClient,page?:number):Promise<AdministrationSnapshot>;
