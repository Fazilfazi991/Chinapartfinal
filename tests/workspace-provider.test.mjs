import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWorkspaceSnapshot} from '../lib/workspace-snapshot.mjs';
import {validateWorkspaceCommand} from '../lib/workspace-writer.mjs';
import {workspaceWritesReady,workspaceOriginAllowed} from '../lib/config.mjs';
const id='11111111-1111-4111-8111-111111111111';
test('provider projections never infer payment precision or current-version approval',()=>{
 const snapshot=normalizeWorkspaceSnapshot({identity:{userId:id,mode:'customer',companyId:id},resources:{payments:[{id,invoice_id:id,amount_minor:123,currency:'AED'}],catalogue:[{id,approved:true,approved_version:0,version:1}]}});
 assert.equal(snapshot.synthetic,false);assert.equal(snapshot.payments[0].scale,null);assert.equal(snapshot.catalogue[0].approved,false);assert.deepEqual(snapshot.actors,[]);
});
test('provider canonical commands strip caller ownership/publication and reject commercial execution',()=>{
 const customer={mode:'customer'};const command=validateWorkspaceCommand({key:id,type:'request.create',actor:id,input:{companyId:id,items:[{description:' gasket ',quantity:1}] }},customer);
 assert.deepEqual(command.input,{items:[{description:'gasket',quantity:1,partNumber:''}]});
 for(const type of ['invoice.issue','payment.start','message.send','document.visibility'])assert.throws(()=>validateWorkspaceCommand({key:id,type,input:{}},customer),error=>error.status===503);
});
test('workspace saves use a separate configured provider and exact same origin',()=>{
 const base={NODE_ENV:'production',CPS_BACKEND:'supabase',CPS_WORKSPACE_READS_ENABLED:'true',CPS_WORKSPACE_WRITES_ENABLED:'true',NEXT_PUBLIC_SUPABASE_URL:'https://project.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_'+'x'.repeat(32),SUPABASE_SECRET_KEY:'sb_secret_'+'x'.repeat(32),CPS_SITE_ORIGIN:'https://shop.test'};
 assert.equal(workspaceWritesReady(base),true);assert.equal(workspaceWritesReady({...base,CPS_BACKEND:''}),false);
 assert.equal(workspaceOriginAllowed(new Request('https://shop.test/api/workspace',{headers:{origin:'https://shop.test'}}),base),true);
 for(const origin of ['https://foreign.test','https://shop.test/','null'])assert.equal(workspaceOriginAllowed(new Request('https://shop.test/api/workspace',{headers:{origin}}),base),false);
});
