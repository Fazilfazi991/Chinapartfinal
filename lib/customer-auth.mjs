import {verifiedWorkspaceIdentity,WorkspaceAccessError} from './workspace-reader.mjs';
export function customerAuthEnabled(env=process.env){return env.CPS_CUSTOMER_AUTH_ENABLED==='true';}
export async function signInCustomer(client,email,password){
 if(typeof email!=='string'||typeof password!=='string'||!/^\S+@\S+\.\S+$/.test(email.trim())||email.length>254||!password||password.length>200)throw new WorkspaceAccessError('Sign in could not be completed.',401);
 const {error}=await client.auth.signInWithPassword({email:email.trim(),password});
 if(error)throw new WorkspaceAccessError('Sign in could not be completed.',401);
 try{return await verifiedWorkspaceIdentity(client,'customer');}
 catch{await client.auth.signOut({scope:'local'});throw new WorkspaceAccessError('Approved customer access is required.',403);}
}
export async function acceptCustomerInvitation(client,token,type){
 if(type!=='invite'||typeof token!=='string'||!/^[A-Za-z0-9_-]{16,512}$/.test(token))throw new WorkspaceAccessError('Invitation unavailable.',400);
 const {error}=await client.auth.verifyOtp({token_hash:token,type:'invite'});
 if(error)throw new WorkspaceAccessError('Invitation unavailable.',401);
 try{return await verifiedWorkspaceIdentity(client,'customer');}
 catch{await client.auth.signOut({scope:'local'});throw new WorkspaceAccessError('Approved customer access is required.',403);}
}
export async function setCustomerPassword(client,password,confirmation){
 await verifiedWorkspaceIdentity(client,'customer');
 if(typeof password!=='string'||password.length<12||password.length>200||password!==confirmation)throw new WorkspaceAccessError('Use matching passwords of 12–200 characters.',400);
 const {error}=await client.auth.updateUser({password});if(error)throw new WorkspaceAccessError('Password setup could not be completed.',503);
}
export async function signOutCustomer(client){const {error}=await client.auth.signOut({scope:'local'});if(error)throw new WorkspaceAccessError('Sign out could not be completed. Try again.',503);}

export function accountOrigin(env=process.env){
 try{const value=env.CPS_SITE_ORIGIN,url=new URL(value);if(url.origin!==value||url.username||url.password||url.search||url.hash||!(url.protocol==='https:'&&!['localhost','127.0.0.1','[::1]'].includes(url.hostname)||env.NODE_ENV==='development'&&url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))return null;return url.origin;}catch{return null;}
}
export function customerRecoveryEnabled(env=process.env){return customerAuthEnabled(env)&&env.CPS_CUSTOMER_RECOVERY_ENABLED==='true'&&!!accountOrigin(env);}
export async function requestPasswordRecovery(client,email,env=process.env){
 if(!customerRecoveryEnabled(env))throw new WorkspaceAccessError('Password recovery is not activated.',503);
 if(typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email.trim())||/[\x00-\x1f]/.test(email))throw new WorkspaceAccessError('Enter a valid account email.',400);
 const {error}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo:accountOrigin(env)+'/auth/confirm'});
 if(error)throw new WorkspaceAccessError('Recovery is temporarily unavailable. Try again.',503);
 return {message:'If this address belongs to an eligible account, the provider will email a password-reset link.',error:false};
}
export async function acceptCustomerRecovery(client,token,type,env=process.env){
 if(!customerRecoveryEnabled(env))throw new WorkspaceAccessError('Password recovery is not activated.',503);
 if(type!=='recovery'||typeof token!=='string'||!/^[A-Za-z0-9_-]{16,512}$/.test(token))throw new WorkspaceAccessError('Recovery link unavailable.',400);
 const {error}=await client.auth.verifyOtp({token_hash:token,type:'recovery'});
 if(error)throw new WorkspaceAccessError('Recovery link unavailable.',401);
 try{return await verifiedWorkspaceIdentity(client,'customer');}catch{await client.auth.signOut({scope:'local'});throw new WorkspaceAccessError('Approved customer access is required.',403);}
}
