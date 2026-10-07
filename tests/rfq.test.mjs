import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { blank, validate, restoreDraft } from '../lib/rfq.mjs';
import { checkedFile, saveRequest } from '../lib/local-store.mjs';
const valid = {...blank,name:'Synthetic Workshop',email:'qa@example.test',country:'Qatar',category:'Truck or Trailer',description:'Oil filter',quantity:'2'};
test('contact, quantity and malformed payloads are rejected on the server schema',()=>{
  assert.deepEqual(validate(valid),{});
  assert.ok(validate({...valid,email:'',phone:''}).email);
  for(const quantity of ['0','-1','1.5','1e3','1000000']) assert.ok(validate({...valid,quantity}).quantity);
  assert.ok(validate({...valid,name:{}}).name);
  assert.ok(validate(null).form);
  assert.ok(validate({...valid,quality:'unverified'}).quality);
});
test('partial step validation allows unknown vehicle details and OEM-only requests',()=>{
  assert.deepEqual(validate({...valid,description:'',oem:'OEM-123'}),{});
  assert.deepEqual(validate({...blank,name:'QA',country:'Oman',phone:'+968 12345678'},1),{});
  assert.ok(validate({...valid,year:'202'},2).year);
});
test('draft restoration preserves fields and step, drops malformed and expired drafts',()=>{
  const raw=JSON.stringify({version:1,data:valid,step:3,id:randomUUID(),savedAt:Date.now()});
  assert.equal(restoreDraft(raw).data.description,'Oil filter');
  assert.equal(restoreDraft(raw).step,3);
  assert.equal(restoreDraft('{broken'),null);
  assert.equal(restoreDraft(JSON.stringify({version:1,data:valid,savedAt:0})),null);
});
test('pasted contact values normalize and punctuation-only telephone numbers are rejected',()=>{
  assert.deepEqual(validate({...valid,email:'  qa@example.test ',phone:' +974 1234 5678 ',quantity:' 2 '}),{});
  for(const phone of ['-------','( )----','123----'])assert.ok(validate({...valid,email:'',phone}).phone);
  assert.ok(validate({...valid,email:' ',phone:' '}).email);
});
test('corrupt draft timestamps, field limits, fractional steps and invalid IDs recover safely',()=>{
  const draft={version:1,data:valid,step:3,id:randomUUID(),savedAt:Date.now()};
  for(const savedAt of [undefined,null,'today',Date.now()+86400000])assert.equal(restoreDraft(JSON.stringify({...draft,savedAt})),null);
  assert.equal(restoreDraft(JSON.stringify({...draft,data:{...valid,name:'x'.repeat(201)}})),null);
  assert.equal(restoreDraft(JSON.stringify({...draft,step:2.5})).step,1);
  assert.equal(restoreDraft(JSON.stringify({...draft,id:'broken'})).id,'');
});
test('attachments reject disguised HTML, wrong MIME and oversized files; normalize names',()=>{
  const png=Buffer.from([137,80,78,71,13,10,26,10,0]);
  assert.equal(checkedFile('../part.png','image/png',png).name,'.._part.png');
  assert.throws(()=>checkedFile('part.png','image/png',Buffer.from('<html>')));
  assert.throws(()=>checkedFile('part.png','text/html',png));
  assert.throws(()=>checkedFile('part.pdf','application/pdf',Buffer.alloc(5*1024*1024+1)));
});
test('concurrent retries create one durable record; conflicting reuse cannot overwrite it',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'cps-rfq-'));const id=randomUUID();
  try {
    const results=await Promise.all(Array.from({length:8},()=>saveRequest(dir,valid,[],id)));
    assert.equal(new Set(results.map(x=>x.reference)).size,1);
    assert.equal((await readdir(dir)).length,1);
    const record=JSON.parse(await readFile(join(dir,`${id}.json`),'utf8'));
    assert.equal(record.data.description,'Oil filter');
    assert.equal(record.status,'Submitted');
    await assert.rejects(saveRequest(dir,{...valid,quantity:'3'},[],id),error=>error.status===409);
    assert.equal(JSON.parse(await readFile(join(dir,`${id}.json`),'utf8')).data.quantity,'2');
  } finally {await rm(dir,{recursive:true,force:true});}
});
