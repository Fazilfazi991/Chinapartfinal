// Explicit hosted acceptance workflow. Disposable synthetic records only.
// Credentials/state stay in ignored evidence; no email/invitation is sent.
import assert from 'node:assert/strict';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import nextEnv from '@next/env';
import {createClient} from '@supabase/supabase-js';
import {blank} from '../lib/rfq.mjs';
import {saveProduction} from '../lib/production-store.mjs';
import {privateDownload} from '../lib/private-download.mjs';
import {readStaffInbox} from '../lib/staff-inbox.mjs';
import {readWorkspaceResource,verifiedWorkspaceIdentity} from '../lib/workspace-reader.mjs';

nextEnv.loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const phase=process.argv[2],ref=process.argv[3];
assert.match(ref??'',/^[a-z]{20}$/,'Explicit project ref required');
assert.equal(process.env.NEXT_PUBLIC_SUPABASE_URL,`https://${ref}.supabase.co`,'Unexpected target');
assert.equal(process.env.CPS_SUBMISSIONS_ENABLED,'false');
assert.equal(process.env.CPS_UPLOADS_ENABLED,'false');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const options={auth:{persistSession:false,autoRefreshToken:false}};
const service=createClient(url,process.env.SUPABASE_SECRET_KEY,options);
const guest=()=>createClient(url,key,options);
const statePath='evidence/hosted-test-state.json',resultPath='evidence/hosted-provider-results.json';
const ok=result=>{assert.equal(result.error,null,result.error?.message);return result.data;};
const writeState=state=>writeFile(statePath,JSON.stringify(state,null,2),{mode:0o600});
const login=async(user)=>{const client=guest();ok(await client.auth.signInWithPassword({email:user.email,password:user.password}));return client;};
const checks=[];
async function check(name,fn){await fn();checks.push(name);console.log('PASS '+name);}
let state;
if(phase==='setup'){
 assert.equal(ok(await service.from('cps_staff_members').select('*')).length,0,'Use only an empty dedicated acceptance environment');
 assert.equal(ok(await service.auth.admin.listUsers()).users.length,0,'Do not mix with real Auth accounts');
 state={ref,run:randomUUID(),users:{},officeA:randomUUID(),officeB:randomUUID(),companyA:randomUUID(),companyB:randomUUID(),requestA:randomUUID(),requestB:randomUUID(),rfq:randomUUID(),otherRfq:randomUUID(),attachment:randomUUID()};
 await writeState(state);
 for(const role of ['admin','agentA','agentB','customerA','customerB']){
  const user={email:`cps-acceptance-${state.run.slice(0,8)}-${role.toLowerCase()}@example.invalid`,password:randomBytes(32).toString('base64url')+'-Aa9!'};
  const created=ok(await service.auth.admin.createUser({email:user.email,password:user.password,email_confirm:true,app_metadata:{cps_acceptance_run:state.run},user_metadata:{label:'Disposable hosted acceptance account'}}));
  user.id=created.user.id;state.users[role]=user;await writeState(state);
 }
 ok(await service.from('cps_offices').insert([{id:state.officeA,name:'Disposable acceptance office A',active:true},{id:state.officeB,name:'Disposable acceptance office B',active:true}]));
 ok(await service.from('cps_staff_members').insert([{user_id:state.users.admin.id,role:'admin',active:true,label:'Disposable acceptance administrator'},{user_id:state.users.agentA.id,role:'agent',office_id:state.officeA,active:true,label:'Disposable acceptance agent A'},{user_id:state.users.agentB.id,role:'agent',office_id:state.officeB,active:true,label:'Disposable acceptance agent B'}]));
 ok(await service.from('cps_companies').insert([{id:state.companyA,office_id:state.officeA,name:'Disposable acceptance company A'},{id:state.companyB,office_id:state.officeB,name:'Disposable acceptance company B'}]));
 ok(await service.from('cps_customer_members').insert([{user_id:state.users.customerA.id,company_id:state.companyA,active:true},{user_id:state.users.customerB.id,company_id:state.companyB,active:true}]));
 ok(await service.from('cps_portal_requests').insert([{id:state.requestA,company_id:state.companyA,reference:'QA-A-'+state.run,items:[{description:'Synthetic filter',quantity:1}]},{id:state.requestB,company_id:state.companyB,reference:'QA-B-'+state.run,items:[{description:'Synthetic gasket',quantity:1}]}]));
 ok(await service.from('cps_company_notes').insert({company_id:state.companyA,body:'Synthetic private note'}));
 state.input={...blank,name:'Disposable hosted acceptance',company:'Synthetic acceptance only',email:'qa@example.invalid',country:'United Arab Emirates',category:'Excavator',description:'Synthetic filter requirement; no commercial enquiry'};
 await check('Eight concurrent actual-provider RFQ retries return one acknowledged reference',async()=>{
  const results=await Promise.all(Array.from({length:8},()=>saveProduction(service,state.input,[],state.rfq)));
  assert.equal(new Set(results.map(r=>r.reference)).size,1);assert.ok(results.every(r=>r.localTest===false));state.reference=results[0].reference;
  assert.equal(ok(await service.from('cps_rfqs').select('id').eq('id',state.rfq)).length,1);
 });
 await check('Actual-provider changed payload cannot reuse the submission key',()=>assert.rejects(saveProduction(service,{...state.input,description:'Conflicting synthetic content'},[],state.rfq),e=>e.status===409));
 await check('Missing scanner rejects application attachment persistence',()=>assert.rejects(saveProduction(service,state.input,[{name:'synthetic.pdf',type:'application/pdf',size:15,content:Buffer.from('%PDF-synthetic').toString('base64')}],randomUUID()),e=>e.status===503));
 await saveProduction(service,state.input,[],state.otherRfq);
 ok(await service.from('cps_rfqs').update({office_id:state.officeA}).eq('id',state.rfq));
 ok(await service.from('cps_rfqs').update({office_id:state.officeB}).eq('id',state.otherRfq));
 // A quarantined synthetic marker tests Storage ACLs, never scanner success.
 const marker=Buffer.from('%PDF-1.4\n% Disposable ACL marker; not a customer document\n');
 state.objectKey=`acceptance/${state.run}/quarantined-marker.pdf`;
 ok(await service.storage.from('cps-rfq-private').upload(state.objectKey,marker,{contentType:'application/pdf',upsert:false}));
 ok(await service.from('cps_attachments').insert({id:state.attachment,rfq_id:state.rfq,object_key:state.objectKey,name:'Synthetic quarantined marker.pdf',mime:'application/pdf',size:marker.length,sha256:createHash('sha256').update(marker).digest('hex'),scan_status:'quarantined'}));
 state.setupChecks=checks;await writeState(state);console.log('Hosted synthetic setup complete; sensitive state saved only to ignored evidence.');
}else{
 state=JSON.parse(await readFile(statePath,'utf8'));assert.equal(state.ref,ref);
 if(phase==='verify'){
  const clients=Object.fromEntries(await Promise.all(Object.entries(state.users).map(async([role,user])=>[role,await login(user)])));
  await check('Fresh process retrieves the persisted RFQ reference',async()=>assert.equal(ok(await service.from('cps_rfqs').select('reference').eq('id',state.rfq).single()).reference,state.reference));
  await check('Verified active office staff and administrator retrieve the real RFQ',async()=>{for(const c of [clients.agentA,clients.admin])assert.ok((await readStaffInbox(c)).rows.some(r=>r.id===state.rfq));});
  await check('Anonymous cannot enumerate RFQs, staff or private CRM notes',async()=>{for(const table of ['cps_rfqs','cps_staff_members','cps_company_notes'])assert.ok((await guest().from(table).select('*')).error);});
  await check('Anonymous RFQ detail and ingestion RPC are denied',async()=>{assert.ok((await guest().from('cps_rfqs').select('*').eq('id',state.rfq)).error);assert.ok((await guest().rpc('cps_submit_rfq',{p_id:randomUUID(),p_digest:'a'.repeat(64),p_data:state.input,p_files:[]})).error);});
  await check('Office B cannot retrieve Office A RFQ or CRM records',async()=>{assert.deepEqual(ok(await clients.agentB.from('cps_rfqs').select('id').eq('id',state.rfq)),[]);assert.deepEqual(ok(await clients.agentB.from('cps_companies').select('id').eq('id',state.companyA)),[]);});
  await check('Customer A and B only read their own company requests',async()=>{assert.equal((await readWorkspaceResource(clients.customerA,'customer','requests')).rows[0].id,state.requestA);assert.equal((await readWorkspaceResource(clients.customerB,'customer','requests')).rows[0].id,state.requestB);assert.deepEqual(ok(await clients.customerA.from('cps_portal_requests').select('id').eq('id',state.requestB)),[]);});
  await check('Customer cannot read internal notes or guest RFQ contact records',async()=>{assert.deepEqual(ok(await clients.customerA.from('cps_company_notes').select('*')),[]);assert.deepEqual(ok(await clients.customerA.from('cps_rfqs').select('*')),[]);});
  await check('User-editable admin metadata does not grant company or staff scope',async()=>{ok(await clients.customerA.auth.updateUser({data:{role:'admin',active:true,company_id:state.companyB}}));await assert.rejects(verifiedWorkspaceIdentity(clients.customerA,'staff'),e=>e.status===403);assert.deepEqual(ok(await clients.customerA.from('cps_portal_requests').select('id').eq('id',state.requestB)),[]);});
  await check('Direct authenticated writes and privileged RPC calls are denied',async()=>{for(const client of Object.values(clients)){assert.ok((await client.from('cps_rfqs').update({status:'Closed'}).eq('id',state.rfq)).error);assert.ok((await client.rpc('cps_admin_snapshot',{p_actor:state.users.admin.id,p_page:0})).error);}});
  await check('Private buckets retain MIME and size restrictions',async()=>{const buckets=ok(await service.storage.listBuckets());for(const b of buckets){assert.equal(b.public,false);assert.equal(b.file_size_limit,1048576);}assert.equal(buckets.length,2);});
  await check('Unprivileged Storage uploads and signed URL creation are denied',async()=>{for(const c of [guest(),clients.agentA,clients.customerA]){const upload=await c.storage.from('cps-rfq-private').upload(state.objectKey+'.denied',Buffer.from('%PDF-denied'),{contentType:'application/pdf'});assert.ok(upload.error);assert.ok(['400','403','404'].includes(String(upload.error.statusCode)));assert.ok((await c.storage.from('cps-rfq-private').createSignedUrl(state.objectKey,60)).error);}});
  await check('Anonymous and all signed-in users cannot download or enumerate private marker',async()=>{for(const c of [guest(),...Object.values(clients)]){assert.ok((await c.storage.from('cps-rfq-private').download(state.objectKey)).error);const listed=await c.storage.from('cps-rfq-private').list(`acceptance/${state.run}`);assert.ok(listed.error||listed.data.length===0);}const publicUrl=guest().storage.from('cps-rfq-private').getPublicUrl(state.objectKey).data.publicUrl;assert.equal((await fetch(publicUrl)).ok,false);});
  await check('Server storage access succeeds for the synthetic ACL marker',async()=>assert.ok(ok(await service.storage.from('cps-rfq-private').download(state.objectKey)).size>0));
  await check('Quarantined marker is rejected even for authorized staff downloads',async()=>{const response=await privateDownload(clients.agentA,()=>service,state.attachment);assert.equal(response.status,404);});
  await check('Revoked membership loses RLS reads and server actions with the same live session',async()=>{ok(await service.from('cps_staff_members').update({active:false}).eq('user_id',state.users.agentA.id));try{assert.deepEqual(ok(await clients.agentA.from('cps_rfqs').select('id')),[]);await assert.rejects(readStaffInbox(clients.agentA),e=>e.status===403);const version=ok(await service.from('cps_rfqs').select('status_version').eq('id',state.rfq).single()).status_version;const denied=await service.rpc('cps_update_rfq',{p_id:state.rfq,p_actor:state.users.agentA.id,p_status:'Closed',p_note:'Synthetic denied change',p_expected:version});assert.match(denied.error?.message??'',/staff_access_required/);}finally{ok(await service.from('cps_staff_members').update({active:true}).eq('user_id',state.users.agentA.id));}});
  await check('Inactive customer loses company scope immediately',async()=>{ok(await service.from('cps_customer_members').update({active:false}).eq('user_id',state.users.customerA.id));assert.deepEqual(ok(await clients.customerA.from('cps_portal_requests').select('id')),[]);ok(await service.from('cps_customer_members').update({active:true}).eq('user_id',state.users.customerA.id));});
  await check('Invalid credentials, malformed JWT and modified expired JWT are rejected',async()=>{assert.ok((await guest().auth.signInWithPassword({email:state.users.admin.email,password:'Incorrect-acceptance-password'})).error);assert.ok((await guest().auth.getUser('not-a-valid-jwt')).error);const token=ok(await clients.admin.auth.getSession()).session.access_token;const parts=token.split('.');const payload=JSON.parse(Buffer.from(parts[1],'base64url'));payload.exp=1;parts[1]=Buffer.from(JSON.stringify(payload)).toString('base64url');assert.ok((await guest().auth.getUser(parts.join('.'))).error);});
  await check('Real refresh token renews a verified hosted session',async()=>{const refreshed=ok(await clients.admin.auth.refreshSession());assert.equal(refreshed.user.id,state.users.admin.id);assert.equal((await verifiedWorkspaceIdentity(clients.admin,'staff')).role,'admin');});
  await check('Hosted Auth rejects public signup without creating or emailing an account',async()=>{const response=await fetch(url+'/auth/v1/settings',{headers:{apikey:key}});assert.equal(response.status,200);const settings=await response.json();assert.equal(settings.disable_signup,true);const result=await guest().auth.signUp({email:`denied-${state.run}@example.invalid`,password:randomBytes(32).toString('base64url')+'-Aa9!'});assert.ok(result.error);assert.match(result.error.message,/signup|sign.?up/i);assert.equal(ok(await service.auth.admin.listUsers()).users.length,Object.keys(state.users).length);});
  await check('Logout removes the real client session and protected identity',async()=>{ok(await clients.customerB.auth.signOut({scope:'local'}));await assert.rejects(verifiedWorkspaceIdentity(clients.customerB,'customer'),e=>e.status===401);});
  const result={passed:true,liveSupabase:true,projectRef:ref,provider:'Hosted Supabase Auth, Data API and Storage through pinned official SDK',rfqReference:state.reference,checks:[...state.setupChecks,...checks],fullPublicRfqHttpFlow:false,uploadsEnabled:false,scannerSuccessClaimed:false,expiredUnmodifiedTokenWaited:false};
  await writeFile(resultPath,JSON.stringify(result,null,2));console.log(JSON.stringify({passed:true,checks:result.checks.length,fullPublicRfqHttpFlow:false}));
 }else if(phase==='cleanup'){
  // Delete only IDs recorded by this invocation; never enumerate-and-delete.
  if(state.objectKey)ok(await service.storage.from('cps-rfq-private').remove([state.objectKey]));
  for(const [table,column,ids] of [['cps_company_notes','company_id',[state.companyA]],['cps_portal_requests','id',[state.requestA,state.requestB]],['cps_rfqs','id',[state.rfq,state.otherRfq]],['cps_customer_members','user_id',Object.values(state.users).map(u=>u.id)],['cps_staff_members','user_id',Object.values(state.users).map(u=>u.id)],['cps_companies','id',[state.companyA,state.companyB]],['cps_offices','id',[state.officeA,state.officeB]]])ok(await service.from(table).delete().in(column,ids));
  for(const user of Object.values(state.users)){const current=ok(await service.auth.admin.getUserById(user.id));assert.equal(current.user.app_metadata.cps_acceptance_run,state.run);ok(await service.auth.admin.deleteUser(user.id));}
  const users=ok(await service.auth.admin.listUsers());assert.equal(users.users.length,0);
  for(const table of ['cps_rfqs','cps_attachments','cps_audit','cps_staff_members','cps_customer_members','cps_companies','cps_offices','cps_portal_requests','cps_company_notes'])assert.equal(ok(await service.from(table).select('*')).length,0,table+' must be empty after owned cleanup');
  assert.equal(ok(await service.storage.from('cps-rfq-private').list(`acceptance/${state.run}`)).length,0);
  assert.ok((await service.storage.from('cps-rfq-private').download(state.objectKey)).error);
  await writeFile('evidence/hosted-cleanup-results.json',JSON.stringify({passed:true,syntheticUsersRemoved:Object.keys(state.users).length,syntheticRfqsRemoved:2,privateMarkerRemoved:true,realAdminCreated:false},null,2));
  console.log('Owned synthetic records, Auth users and ACL marker removed. Schema and private buckets retained.');
 }else throw new Error('Use setup, verify or cleanup');
}
