import {authConfigured} from '../../../lib/supabase/server';
import {login} from './actions';
export const dynamic='force-dynamic';
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
  const params=await searchParams;
  return <main className="request-page"><section className="request-shell"><a href="/">China Parts Shop</a><h1>Staff sign in</h1>{!authConfigured()?<p>Staff access is not configured yet. Contact the project administrator.</p>:<form action={login} className="request-fields"><div><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required maxLength={254}/></div><div><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={200}/></div>{params.error&&<p role="alert">Sign in could not be completed. Check your details or contact your administrator.</p>}<button type="submit" className="request-primary">Sign in</button><p>Access is limited to approved staff. No public registration is available.</p></form>}</section></main>;
}
