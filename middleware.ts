import {createServerClient} from '@supabase/ssr';
import {NextResponse,type NextRequest} from 'next/server';
import {staffAuthReady} from './lib/config.mjs';
export async function middleware(request:NextRequest){
  let response=NextResponse.next({request});
  response.headers.set('Cache-Control','private, no-store');
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!staffAuthReady()||!url||!key) return response;
  const client=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(values){values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
  await client.auth.getUser();
  response.headers.set('Cache-Control','private, no-store');
  return response;
}
export const config={matcher:['/staff/:path*','/api/staff/:path*','/api/workspace/:path*','/customer-access/:path*','/workspace/:path*','/auth/confirm']};
