import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {scanFile,verifyChallenge,saveProduction} from '../lib/production-store.mjs';
import {privateDownload} from '../lib/private-download.mjs';
import {blank} from '../lib/rfq.mjs';
import {checkedFile} from '../lib/local-store.mjs';
test('scanner outages, rejection and malformed responses cannot upload or commit',async()=>{
  const file=checkedFile('synthetic.pdf','application/pdf',Buffer.from('%PDF-1.7 synthetic'));
  const input={...blank,name:'QA',email:'qa@example.test',country:'Qatar',category:'Truck',description:'Filter'};
  let writes=0;
  const client={from:()=>({select(){return this},eq(){return this},async maybeSingle(){return {data:null,error:null}}}),storage:{from:()=>({upload:async()=>{writes++;return {error:null}}})},rpc:async()=>{writes++;return {data:{reference:'should-not-exist'}}}};
  for(const fetcher of [async()=>{throw new Error('fixture timeout')},async()=>new Response('',{status:503}),async()=>Response.json({clean:false}),async()=>new Response('not json')]) {
    await assert.rejects(saveProduction(client,input,[file],randomUUID(),f=>scanFile(f,{url:'https://scanner.example',token:'fixture',fetcher})));
  }
  assert.equal(writes,0);
});
test('security challenge provider outages and malformed replies fail closed',async()=>{
  for(const fetcher of [async()=>{throw new Error('fixture timeout')},async()=>new Response('',{status:503}),async()=>new Response('not json')]) {
    await assert.rejects(verifyChallenge('fixture',{secret:'fixture',hostname:'cps.example',fetcher}));
  }
});
test('download provider failure leaks neither private keys nor raw provider messages',async()=>{
  const response=await privateDownload({auth:{getUser:async()=>{throw new Error('https://private.example/key secret')}}},()=>{throw new Error('must not run')},randomUUID());
  assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'private, no-store');
  assert.deepEqual(await response.json(),{error:'Attachment unavailable.'});
});
