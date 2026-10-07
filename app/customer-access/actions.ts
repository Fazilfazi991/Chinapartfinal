'use server';
import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {authConfigured,userClient} from '../../lib/supabase/server';
import {customerAuthEnabled,customerRecoveryEnabled,accountOrigin,requestPasswordRecovery,signInCustomer,signOutCustomer,setCustomerPassword} from '../../lib/customer-auth.mjs';
export async function customerLogin(form:FormData){
 if(!customerAuthEnabled()||!authConfigured())redirect('/customer-access?error=setup');
 try{await signInCustomer(await userClient(),form.get('email'),form.get('password'));}catch{redirect('/customer-access?error=access');}
 redirect('/workspace/customer/overview');
}
export async function customerLogout(){
 if(authConfigured()){try{await signOutCustomer(await userClient());}catch{redirect('/workspace/customer/overview?error=logout');}}
 redirect('/customer-access');
}
export async function customerSetPassword(form:FormData){
 if(!customerAuthEnabled()||!authConfigured())redirect('/customer-access?error=setup');
 try{await setCustomerPassword(await userClient(),form.get('password'),form.get('confirmation'));}catch{redirect('/customer-access/set-password?error=invalid');}
 redirect('/workspace/customer/overview');
}

export async function requestCustomerRecovery(_state:{message:string;error:boolean},form:FormData){
 if(!customerRecoveryEnabled()||!authConfigured())return {error:true,message:'Password recovery is not activated.'};
 const requestHeaders=await headers();if(requestHeaders.get('origin')!==accountOrigin()||requestHeaders.get('sec-fetch-site')==='cross-site')return {error:true,message:'Request origin rejected.'};
 try{return await requestPasswordRecovery(await userClient(),form.get('email'));}catch{return {error:true,message:'The reset request could not be completed. Check the email format or try again.'};}
}
