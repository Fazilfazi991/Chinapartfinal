import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {initialPreviewState,previewSnapshot,applyPreviewCommand,invoiceTotals} from '../lib/preview-domain.mjs';
import {assertPreviewRequest,previewEnabled,transactPreview} from '../lib/preview-store.mjs';
import {verifiedWorkspaceIdentity,readWorkspaceResource} from '../lib/workspace-reader.mjs';
import {approvedSiteOrigin} from '../lib/site-indexing.mjs';
const command=(type,input,key=randomUUID())=>({type,input,key});
const update=(state,actor,type,input)=>applyPreviewCommand(state,actor,command(type,input)).state;
const denied=(run,status)=>assert.throws(run,error=>error.status===status);

test('preview is strictly development/loopback and rejects missing/foreign mutation origins',()=>{
  assert.equal(previewEnabled({NODE_ENV:'production',CPS_PREVIEW_ENABLED:'true'}),false);
  assert.equal(previewEnabled({NODE_ENV:'test',CPS_PREVIEW_ENABLED:'true'}),false);
  assert.equal(previewEnabled({NODE_ENV:'development',CPS_PREVIEW_ENABLED:'false'}),false);
  const env={NODE_ENV:'development',CPS_PREVIEW_ENABLED:'true'};
  const request=(url,origin)=>new Request(url,{method:'POST',headers:{Host:new URL(url).host,...origin?{Origin:origin}:{}}});
  assert.doesNotThrow(()=>assertPreviewRequest(request('http://127.0.0.1:4317/api/preview','http://127.0.0.1:4317'),env));
  denied(()=>assertPreviewRequest(request('http://evil.test/api/preview','http://evil.test'),env),403);
  denied(()=>assertPreviewRequest(request('http://127.0.0.1:4317/api/preview','https://evil.test'),env),403);
  denied(()=>assertPreviewRequest(request('http://127.0.0.1:4317/api/preview'),env),403);
  assert.doesNotThrow(()=>assertPreviewRequest(new Request('http://localhost:4317/api/preview',{method:'POST',headers:{Host:'127.0.0.1:4317',Origin:'http://127.0.0.1:4317'}}),env));
  denied(()=>assertPreviewRequest(new Request('http://localhost:4317/api/preview',{method:'POST',headers:{Host:'foreign.test',Origin:'http://localhost:4317'}}),env),403);
  denied(()=>assertPreviewRequest(new Request('http://127.0.0.1:4317/api/preview'),{...env,NODE_ENV:'production'}),404);
});
test('customer projections exclude other companies, private notes and internal comments',()=>{
  const state=update(initialPreviewState(),'north-agent','request.comment',{id:'request-a',version:0,body:'Private sourcing discussion',visibility:'internal'});
  const customer=previewSnapshot(state,'customer-a');
  assert.equal(customer.requests.length,1);assert.equal(customer.requests[0].comments.length,1);
  assert.equal('internalNote' in customer.requests[0],false);assert.equal('note' in customer.customers[0],false);
  assert.equal(customer.catalogue.length,1);assert.deepEqual(customer.audit,[]);assert.deepEqual(customer.content,[]);
  const serialized=JSON.stringify(customer);assert.equal(serialized.includes('Private sourcing discussion'),false);assert.equal(serialized.includes('Other office only'),false);
  assert.equal(previewSnapshot(state,'north-agent').requests.length,1);assert.equal(previewSnapshot(state,'south-agent').requests[0].id,'request-b');
  denied(()=>previewSnapshot(state,'forged'),401);
});
test('cross-company/office mutation bypasses deny before changing data',()=>{
  const state=initialPreviewState();
  for(const actor of ['customer-b','south-agent'])denied(()=>update(state,actor,'request.comment',{id:'request-a',version:0,body:'IDOR',visibility:'customer'}),404);
  denied(()=>update(state,'customer-a','request.update',{id:'request-a',version:0,status:'Closed',internalNote:''}),403);
  denied(()=>update(state,'north-agent','catalogue.save',{title:'Bypass'}),403);
  denied(()=>update(state,'south-agent','order.update',{id:'order-a',version:0,status:'Draft',shippingNote:''}),404);
  denied(()=>update(state,'customer-b','support.reply',{id:'missing',version:0,body:'IDOR'}),404);
  assert.deepEqual(state,initialPreviewState());
});
test('multi-part validation trims inputs and refuses invalid quantities or arrays',()=>{
  const state=update(initialPreviewState(),'customer-a','request.create',{items:[{description:'  Filter  ',partNumber:'  REF  ',quantity:2},{description:'Seal',quantity:1}]});
  assert.equal(state.requests[0].items[0].description,'Filter');assert.equal(state.requests[0].items.length,2);assert.equal(state.requests[0].office,'north');
  for(const items of [[],[null],[{description:'',quantity:1}],[{description:'Part',quantity:0}],[{description:'Part',quantity:1.5}],Array(51).fill({description:'Part',quantity:1})])denied(()=>update(initialPreviewState(),'customer-a','request.create',{items}),400);
});
test('version locking retains append-only comments and rejects stale review',()=>{
  let state=update(initialPreviewState(),'customer-a','request.comment',{id:'request-a',version:0,body:'Nameplate supplied'});
  state=update(state,'north-agent','request.comment',{id:'request-a',version:1,body:'Received',visibility:'customer'});
  assert.equal(state.requests[0].comments.length,3);assert.equal(state.audit.length,2);
  denied(()=>update(state,'north-agent','request.update',{id:'request-a',version:0,status:'Closed',internalNote:'stale'}),409);
  denied(()=>update(state,'north-agent','request.update',{id:'request-a',version:2,status:'Order confirmed',internalNote:''}),400);
});
test('catalogue visibility and content management stay administrative and draft-only',()=>{
  let state=update(initialPreviewState(),'admin','catalogue.save',{id:'product-a',version:0,title:'Demo filter',partNumber:'SAMPLE',brand:'Demo',category:'Filters',description:'Synthetic draft',visibility:'archived'});
  assert.equal(previewSnapshot(state,'customer-a').catalogue.length,0);
  state=update(state,'admin','content.save',{title:'Draft policy',slug:'draft-policy',body:'<script>plain text only</script>'});
  assert.equal(state.content[0].status,'Draft');
  denied(()=>update(state,'admin','content.save',{title:'Duplicate',slug:'draft-policy',body:'copy'}),409);
  denied(()=>update(state,'admin','content.publish',{id:state.content[0].id}),503);
});
test('order drafts and tracking derive ownership from the source request',()=>{
  let state=update(initialPreviewState(),'north-agent','order.create',{requestId:'request-a',company:'company-b'});
  const order=state.orders[0];assert.equal(order.company,'company-a');
  state=update(state,'north-agent','order.tracking',{id:order.id,version:0,label:'Sample review',detail:'No shipment booked.'});
  assert.equal(previewSnapshot(state,'customer-a').orders.some(x=>x.id===order.id),false);
  assert.equal(state.orders[0].tracking.length,1);
  denied(()=>update(state,'north-agent','order.update',{id:order.id,version:1,status:'Paid',shippingNote:''}),400);
  denied(()=>update(state,'south-agent','order.create',{requestId:'request-a'}),404);
});
test('invoice arithmetic uses bounded minor units and unknown tax has no payable total',()=>{
  const base={orderId:'order-a',currency:'AED',scale:2,taxMinor:null,lines:[{description:'Synthetic line',quantity:3,unitMinor:101}]};
  const state=update(initialPreviewState(),'north-agent','invoice.save',base);
  assert.deepEqual(invoiceTotals(state.invoices[0]),{subtotal:303,tax:null,total:null});
  assert.deepEqual(invoiceTotals({...base,taxMinor:15}),{subtotal:303,tax:15,total:318});
  for(const patch of [{currency:'$'},{scale:4},{taxMinor:-1},{lines:[{description:'Line',quantity:1,unitMinor:1.1}]},{lines:[null]}])denied(()=>update(initialPreviewState(),'north-agent','invoice.save',{...base,...patch}),400);
  denied(()=>update(initialPreviewState(),'customer-a','invoice.save',base),403);
  denied(()=>update(initialPreviewState(),'south-agent','invoice.save',base),404);
});
test('commercial issuance, payment and sending fail closed for every actor',()=>{
  for(const actor of ['admin','north-agent','customer-a'])for(const type of ['invoice.issue','payment.start','message.send'])denied(()=>update(initialPreviewState(),actor,type,{id:'invoice-a'}),503);
});
test('support conversations are company-scoped and saved without external sending',()=>{
  let state=update(initialPreviewState(),'customer-a','support.create',{subject:'Synthetic update',body:'Please review'});
  const id=state.support[0].id;
  assert.equal(previewSnapshot(state,'customer-b').support.length,0);
  denied(()=>update(state,'south-agent','support.reply',{id,version:0,body:'Wrong office'}),404);
  state=update(state,'north-agent','support.reply',{id,version:0,body:'Local reply'});
  state=update(state,'north-agent','support.status',{id,version:1,status:'Under review'});
  assert.equal(state.support[0].replies.length,1);assert.equal(state.audit.length,3);
});
test('operation receipts deduplicate repeated saves and reject changed content or actor',()=>{
  const operation=command('request.comment',{id:'request-a',version:0,body:'Once'});
  const first=applyPreviewCommand(initialPreviewState(),'customer-a',operation);
  const repeated=applyPreviewCommand(first.state,'customer-a',operation);
  assert.equal(repeated.repeated,true);assert.equal(repeated.state.requests[0].comments.length,2);
  denied(()=>applyPreviewCommand(first.state,'customer-a',{...operation,input:{...operation.input,body:'Changed'}}),409);
  denied(()=>applyPreviewCommand(first.state,'customer-b',operation),409);
});
test('disk transactions converge concurrent retries, persist reloads and serialize stale writes',async()=>{
  const root=resolve(tmpdir()),directory=await mkdtemp(join(root,'cps-workspace-test-'));
  assert.ok(resolve(directory).startsWith(root+ '\\'));
  try{
    const operation=command('request.comment',{id:'request-a',version:0,body:'Concurrent local retry'});
    const results=await Promise.all(Array.from({length:8},()=>transactPreview(directory,'customer-a',operation)));
    assert.equal(new Set(results.map(result=>result.id)).size,1);assert.equal(results.filter(result=>!result.repeated).length,1);
    const restored=await transactPreview(directory,'customer-a');assert.equal(restored.requests[0].comments.length,2);
    const file=JSON.parse(await readFile(join(directory,'synthetic-workspace.json'),'utf8'));assert.equal(file.commands.length,1);
    const writes=await Promise.allSettled([transactPreview(directory,'north-agent',command('request.update',{id:'request-a',version:1,status:'Closed',internalNote:''})),transactPreview(directory,'north-agent',command('request.update',{id:'request-a',version:1,status:'Under review',internalNote:''}))]);
    assert.equal(writes.filter(result=>result.status==='fulfilled').length,1);assert.equal(writes.find(result=>result.status==='rejected').reason.status,409);
  }finally{if(!resolve(directory).startsWith(root+'\\'))throw new Error('Unsafe fixture cleanup path');await rm(directory,{recursive:true,force:true});}
});
test('provider reads reject unverified, anonymous and inactive memberships before business queries',async()=>{
  let reads=0;
  const client=user=>({auth:{getUser:async()=>({data:{user},error:null})},from:()=>{reads++;return {select(){return this},eq(){return this},async maybeSingle(){return {data:{active:false},error:null}}}}});
  for(const user of [null,{id:randomUUID(),is_anonymous:true}])await assert.rejects(verifiedWorkspaceIdentity(client(user),'customer'),error=>error.status===401);
  assert.equal(reads,0);
  await assert.rejects(verifiedWorkspaceIdentity(client({id:randomUUID()}),'customer'),error=>error.status===403);assert.equal(reads,1);
});
test('provider reads use verified invoker scope and disallow arbitrary tables or invalid pages',async()=>{
 const calls=[];let memberships=0;const client={auth:{getUser:async()=>({data:{user:{id:randomUUID()}}})},from(){memberships++;return {select(){return this},eq(){return this},async maybeSingle(){return {data:{active:true,company_id:randomUUID()}}}}},async rpc(name,args){calls.push({name,args});return {data:{rows:[],hasMore:false}}}};
 await readWorkspaceResource(client,'customer','orders',2);assert.equal(memberships,1);assert.equal(calls[0].args.p_mode,'customer');assert.equal(calls[0].args.p_page,2);
 for(const resource of ['cps_staff_members','notes','audit'])await assert.rejects(readWorkspaceResource(client,'customer',resource),error=>error.status===404);
 for(const page of [-1,1.2,NaN,10001])await assert.rejects(readWorkspaceResource(client,'customer','orders',page),error=>error.status===400);
 assert.equal(calls.length,1);
});
test('indexing requires explicit approved HTTPS origin and never indexes preview by accident',()=>{
  for(const env of [{},{CPS_SEO_ENABLED:'true',CPS_SITE_ORIGIN:'http://localhost:4317'},{CPS_SEO_ENABLED:'true',CPS_SITE_ORIGIN:'https://example.test/path'},{CPS_SEO_ENABLED:'false',CPS_SITE_ORIGIN:'https://example.test'}])assert.equal(approvedSiteOrigin(env),null);
  assert.equal(approvedSiteOrigin({CPS_SEO_ENABLED:'true',CPS_SITE_ORIGIN:'https://example.test'}),'https://example.test');
});
