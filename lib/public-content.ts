import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {authConfigured} from './supabase/server';
export function publicContentClient(){
 if(!authConfigured()||process.env.CPS_PUBLICATION_ENABLED!=='true')return null;
 return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
}
