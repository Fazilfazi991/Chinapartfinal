import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {createClient} from '@supabase/supabase-js';
import {cookies} from 'next/headers';
import {staffAuthReady,persistenceReady} from '../config.mjs';
export function authConfigured(){return staffAuthReady();}
export async function userClient(){
  if(!authConfigured())throw new Error('Staff authentication is not configured.');
  const store=await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{
    cookies:{
      getAll:()=>store.getAll(),
      setAll(values){
        try{values.forEach(({name,value,options})=>store.set(name,value,options));}
        catch{/* Middleware handles refresh for server-rendered pages. */}
      }
    }
  });
}
export function ingestionClient(){if(!persistenceReady())throw new Error('Request storage is not configured.');return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SECRET_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});}
export async function staffContext(){
  if(!authConfigured()) return null;
  const client=await userClient();
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user||user.is_anonymous) return null;
  const {data:member,error:membershipError}=await client.from('cps_staff_members').select('role,office_id,active').eq('user_id',user.id).maybeSingle();
  if(membershipError||!member?.active||!['admin','agent'].includes(member.role)) return null;
  return {client,user,member};
}
