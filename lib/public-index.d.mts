import type {SupabaseClient} from '@supabase/supabase-js';
export function publicCanonical(path:string,env?:NodeJS.ProcessEnv):string|null;
export function staticSitemap(env?:NodeJS.ProcessEnv):{url:string}[];
export function readPublicSitemap(client:SupabaseClient|null,env?:NodeJS.ProcessEnv):Promise<{url:string}[]>;
