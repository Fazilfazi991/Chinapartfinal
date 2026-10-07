import Link from 'next/link';
import {redirect} from 'next/navigation';
import {authConfigured,userClient} from '../../../lib/supabase/server';
import {customerAuthEnabled} from '../../../lib/customer-auth.mjs';
import {verifiedWorkspaceIdentity} from '../../../lib/workspace-reader.mjs';
import {customerSetPassword} from '../actions';
export const dynamic='force-dynamic';
export default async function SetPassword({searchParams}:{searchParams:Promise<{error?:string}>}){
 if(!customerAuthEnabled()||!authConfigured())redirect('/customer-access?error=setup');
 try{await verifiedWorkspaceIdentity(await userClient(),'customer');}catch{redirect('/customer-access?error=access');}
 const {error}=await searchParams;
 return <main className="request-page"><section className="request-shell"><Link href="/">China Parts Shop</Link><h1>Set your account password</h1><p>Use a unique password of at least 12 characters. Your provider manages your account credentials.</p><form action={customerSetPassword} className="request-fields"><div><label htmlFor="new-password">New password</label><input id="new-password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={200} required/></div><div><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={200} required/></div>{error&&<p role="alert">Password setup could not be completed. Check the matching passwords or contact the team.</p>}<button className="request-primary">Save password</button></form></section></main>;
}
