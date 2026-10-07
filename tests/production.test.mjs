import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {backendMode,uploadsEnabled,allowedOrigin,canReadRequest} from '../lib/config.mjs';
import {blank} from '../lib/rfq.mjs';
import {checkedFile} from '../lib/local-store.mjs';
import {saveProduction,scanFile,verifyChallenge,authorizedAttachment} from '../lib/production-store.mjs';
const valid={...blank,name:'Synthetic',email:'qa@example.test',country:'Qatar',category:'Truck',description:'Oil filter'};
function clientMock(){const rows=new Map(),objects=new Map();let uploads=0;return {rows,objects,get uploads(){return uploads;},from(){return {select(){return this;},eq(_key,id){this.id=id;return this;},async maybeSingle(){return {data:rows.get(this.id)||null,error:null};}};},storage:{from(){return {async upload(key,bytes){uploads++;if(objects.has(key))return {error:{statusCode:'409'}};objects.set(key,bytes);return {error:null};}};}},async rpc(_name,args){const old=rows.get(args.p_id);if(old&&old.digest!==args.p_digest)return {error:{message:'idempotency_conflict'}};const row=old||{reference:`CPS-${randomUUID()}`,digest:args.p_digest};rows.set(args.p_id,row);return {data:row,error:null};}};}
test('production fails closed; local filesystem cannot activate in production',()=>{
  assert.equal(backendMode({NODE_ENV:'production',CPS_LOCAL_TEST_BACKEND:'true'}),'disabled');
  assert.equal(backendMode({CPS_BACKEND:'supabase',CPS_SUBMISSIONS_ENABLED:'true'}),'disabled');
  const configured={NODE_ENV:'production',CPS_BACKEND:'supabase',CPS_SUBMISSIONS_ENABLED:'true',CPS_SITE_ORIGIN:'https://cps.example.com',NEXT_PUBLIC_SUPABASE_URL:'https://project.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_'+ 'p'.repeat(32),SUPABASE_SECRET_KEY:'sb_secret_'+ 's'.repeat(32),NEXT_PUBLIC_TURNSTILE_SITE_KEY:'site',TURNSTILE_SECRET_KEY:'secret'};
  assert.equal(backendMode(configured),'supabase');assert.equal(uploadsEnabled(configured),false);
  assert.equal(allowedOrigin(new Request('https://cps.example/api',{headers:{origin:'https://evil.example'}}),configured),false);
  assert.equal(allowedOrigin(new Request('https://cps.example.com/api',{headers:{origin:'https://cps.example.com'}}),configured),true);
});
test('production retries across independent callers converge and conflicting payload fails',async()=>{
  const client=clientMock(),id=randomUUID();
  const results=await Promise.all(Array.from({length:12},()=>saveProduction(client,valid,[],id,null)));
  assert.equal(new Set(results.map(row=>row.reference)).size,1);assert.equal(client.rows.size,1);
  await assert.rejects(saveProduction(client,{...valid,quantity:'2'},[],id,null),error=>error.status===409);
});
test('production scanner must attest exact hash; unscanned or oversize uploads never proceed',async()=>{
  const file=checkedFile('part.pdf','application/pdf',Buffer.from('%PDF-1.7 synthetic'));
  const client=clientMock();
  await assert.rejects(saveProduction(client,valid,[file],randomUUID(),null),error=>error.status===503);assert.equal(client.uploads,0);
  await assert.rejects(scanFile(file,{url:'https://scanner.example',token:'test',fetcher:async()=>Response.json({clean:true,sha256:'wrong'})}));
  const hash=createHash('sha256').update(Buffer.from(file.content,'base64')).digest('hex');
  assert.equal(await scanFile(file,{url:'https://scanner.example',token:'test',fetcher:async()=>Response.json({clean:true,sha256:hash})}),hash);
  await saveProduction(client,valid,[file],randomUUID(),async()=>hash);assert.equal(client.uploads,1);
  await assert.rejects(saveProduction(client,valid,[{...file,size:1048577}],randomUUID(),async()=>hash));
});
test('security check rejects failed, foreign-host and wrong-action tokens',async()=>{
  for(const result of [{success:false},{success:true,hostname:'evil.example',action:'rfq'},{success:true,hostname:'cps.example',action:'login'}]) await assert.rejects(verifyChallenge('token',{secret:'test',hostname:'cps.example',fetcher:async()=>Response.json(result)}));
  await verifyChallenge('token',{secret:'test',hostname:'cps.example',fetcher:async()=>Response.json({success:true,hostname:'cps.example',action:'rfq'})});
});
function userMock({user=true,active=true,attachment={object_key:'private/key',name:'part.pdf',mime:'application/pdf',size:20,scan_status:'clean'}}={}){return {auth:{async getUser(){return {data:{user:user?{id:randomUUID()}:null},error:null};}},from(table){return {select(){return this;},eq(){return this;},async maybeSingle(){return {data:table==='cps_staff_members'?{active}:attachment,error:null};}};}};}
test('downloads require verified session, active staff, RLS-visible metadata and clean scan',async()=>{
  await assert.rejects(authorizedAttachment(userMock({user:false}),'id'),error=>error.status===401);
  await assert.rejects(authorizedAttachment(userMock({active:false}),'id'),error=>error.status===403);
  await assert.rejects(authorizedAttachment(userMock({attachment:null}),'id'),error=>error.status===404);
  await assert.rejects(authorizedAttachment(userMock({attachment:{scan_status:'quarantined'}}),'id'),error=>error.status===404);
  assert.equal((await authorizedAttachment(userMock(),'id')).object_key,'private/key');
  assert.equal(canReadRequest({active:true,role:'agent',office_id:'A'},{office_id:'B'}),false);
  assert.equal(canReadRequest({active:false,role:'admin',office_id:null},{office_id:null}),false);
  assert.equal(canReadRequest({active:true,role:'admin',office_id:null},{office_id:'B'}),true);
});
