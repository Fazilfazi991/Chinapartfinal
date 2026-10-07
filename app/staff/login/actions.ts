"use server";
import {redirect} from 'next/navigation';
import {authConfigured,userClient} from '../../../lib/supabase/server';
import {verifiedWorkspaceIdentity} from '../../../lib/workspace-reader.mjs';
export async function login(form:FormData){
  if(!authConfigured()) redirect('/staff/login?error=setup');
  const email=form.get('email'),password=form.get('password');
  if(typeof email!=='string'||typeof password!=='string'||email.length>254||password.length>200) redirect('/staff/login?error=invalid');
  const client=await userClient();
  const {error}=await client.auth.signInWithPassword({email,password});
  if(error) redirect('/staff/login?error=invalid');
  try{await verifiedWorkspaceIdentity(client,'staff');}catch{await client.auth.signOut({scope:'local'});redirect('/staff/login?error=access');}
  redirect('/staff');
}
export async function logout(){if(authConfigured()){const client=await userClient();const {error}=await client.auth.signOut({scope:'local'});if(error)redirect('/workspace/admin/overview?error=logout');}redirect('/staff/login');}
