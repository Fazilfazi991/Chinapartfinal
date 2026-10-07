import {NextResponse} from 'next/server';
import {authConfigured,userClient} from '../../../lib/supabase/server';
import {customerAuthEnabled,accountOrigin,customerRecoveryEnabled,acceptCustomerRecovery,acceptCustomerInvitation} from '../../../lib/customer-auth.mjs';
const privateHeaders={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow'};
export async function GET(request:Request){
 if(!customerAuthEnabled()||!authConfigured())return NextResponse.json({error:'Customer account invitations are not activated.'},{status:503,headers:privateHeaders});
 const origin=accountOrigin();if(!origin)return NextResponse.json({error:'Account origin is not configured.'},{status:503,headers:privateHeaders});const site=new URL(origin);
 try{const query=new URL(request.url).searchParams;if(query.get('type')==='recovery'){if(!customerRecoveryEnabled())return NextResponse.json({error:'Password recovery is not activated.'},{status:503,headers:privateHeaders});await acceptCustomerRecovery(await userClient(),query.get('token_hash'),query.get('type'));}else await acceptCustomerInvitation(await userClient(),query.get('token_hash'),query.get('type'));return NextResponse.redirect(new URL('/customer-access/set-password',site),{headers:privateHeaders});}
 catch{return NextResponse.redirect(new URL('/customer-access?error=invitation',site),{headers:privateHeaders});}
}
