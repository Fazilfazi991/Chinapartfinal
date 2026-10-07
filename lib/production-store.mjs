import { createHash } from 'node:crypto';
import { fields, validate } from './rfq.mjs';
import { RequestError } from './local-store.mjs';
export function fingerprint(input, attachments) {
  const data = Object.fromEntries(fields.map(key=>[key,input[key].trim()]));
  const digest=createHash('sha256').update(JSON.stringify({data,attachments:attachments.map(file=>({name:file.name,type:file.type,size:file.size,sha256:createHash('sha256').update(Buffer.from(file.content,'base64')).digest('hex')}))})).digest('hex');
  return {data,digest};
}
export async function scanFile(file, {url,token,fetcher=fetch}) {
  const bytes=Buffer.from(file.content,'base64');
  const digest=createHash('sha256').update(bytes).digest('hex');
  const response=await fetcher(url,{method:'POST',headers:{'Content-Type':file.type,Authorization:`Bearer ${token}`,'X-Content-SHA256':digest},body:bytes,signal:AbortSignal.timeout(15000),redirect:'error'});
  if(!response.ok) throw new RequestError('Attachment scanning is unavailable. Please retry without attachments.',503);
  const result=await response.json();
  if(result.clean!==true || result.sha256!==digest) throw new RequestError('An attachment could not be verified as safe. Remove it and retry.');
  return digest;
}
export async function verifyChallenge(token, {secret,hostname,action='rfq',fetcher=fetch}) {
  if(typeof token!=='string' || !token || token.length>2048) throw new RequestError('Complete the security check before submitting.');
  const response=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret,response:token}),signal:AbortSignal.timeout(10000)});
  if(!response.ok) throw new RequestError('The security check is unavailable. Please retry.',503);
  const result=await response.json();
  if(result.success!==true || result.hostname!==hostname || result.action!==action) throw new RequestError('The security check expired or failed. Please try again.');
}
export async function saveProduction(client, input, attachments, id, scanner) {
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id) || Object.keys(validate(input)).length) throw new RequestError('Please correct the request fields.');
  if(attachments.length>3 || attachments.some(file=>file.size>1024*1024)) throw new RequestError('Attach up to three files, each no larger than 1 MB.');
  const {data,digest}=fingerprint(input,attachments);
  const {data:existing,error:lookupError}=await client.from('cps_rfqs').select('reference,digest').eq('id',id).maybeSingle();
  if(lookupError) throw new RequestError('Request storage is unavailable. Please retry.',503);
  if(existing) {if(existing.digest!==digest) throw new RequestError('This submission key belongs to a different request. Start a new request.',409);return {reference:existing.reference,localTest:false};}
  const metadata=[];
  for(let index=0;index<attachments.length;index++) {
    const file=attachments[index];
    if(!scanner) throw new RequestError('Attachments are not yet enabled. Remove the files and retry.',503);
    const sha256=await scanner(file);
    const key=`${id}/${digest}/${index}`;
    const {error}=await client.storage.from('cps-rfq-private').upload(key,Buffer.from(file.content,'base64'),{contentType:file.type,upsert:false});
    if(error && String(error.statusCode)!=='409') throw new RequestError('An attachment could not be stored. Your draft is retained; retry.',503);
    metadata.push({object_key:key,name:file.name,mime:file.type,size:file.size,sha256,scan_status:'clean'});
  }
  const {data:result,error}=await client.rpc('cps_submit_rfq',{p_id:id,p_digest:digest,p_data:data,p_files:metadata});
  if(error) {if(error.message?.includes('idempotency_conflict')) throw new RequestError('This submission key belongs to a different request. Start a new request.',409);throw new RequestError('We could not save your request. Your draft is retained; please retry.',503);}
  if(!result?.reference) throw new RequestError('Submission could not be confirmed. Please retry.',503);
  return {reference:result.reference,localTest:false};
}
export async function authorizedAttachment(userClient, id) {
  const {data:{user},error:authError}=await userClient.auth.getUser();
  if(authError || !user) throw new RequestError('Sign in to access attachments.',401);
  const {data:member,error:memberError}=await userClient.from('cps_staff_members').select('active').eq('user_id',user.id).maybeSingle();
  if(memberError || !member?.active) throw new RequestError('Staff access is required.',403);
  // User-scoped RLS, not the privileged ingestion client, resolves the object.
  const {data:attachment,error}=await userClient.from('cps_attachments').select('object_key,name,mime,size,scan_status').eq('id',id).maybeSingle();
  if(error || !attachment || attachment.scan_status!=='clean') throw new RequestError('Attachment not found.',404);
  return attachment;
}
