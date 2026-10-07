import test from 'node:test';
import assert from 'node:assert/strict';
import {accountOrigin,customerRecoveryEnabled,requestPasswordRecovery,acceptCustomerRecovery} from '../lib/customer-auth.mjs';
import {readPublicSitemap,publicCanonical} from '../lib/public-index.mjs';
const env={NODE_ENV:'production',CPS_SITE_ORIGIN:'https://shop.example.test',CPS_CUSTOMER_AUTH_ENABLED:'true',CPS_CUSTOMER_RECOVERY_ENABLED:'true'};
test('recovery requires an explicit flag and exact safe origin before provider calls',async()=>{
 for(const origin of ['https://shop.example.test/path','https://shop.example.test/','https://user:pass@shop.example.test','http://localhost:4317','https://shop.example.test?next=bad'])assert.equal(accountOrigin({...env,CPS_SITE_ORIGIN:origin}),null);
 assert.equal(customerRecoveryEnabled({...env,CPS_CUSTOMER_RECOVERY_ENABLED:'false'}),false);
 let calls=0;const client={auth:{resetPasswordForEmail:async()=>{calls++;return {}}}};
 await assert.rejects(requestPasswordRecovery(client,'qa@example.test',{}),error=>error.status===503);
 await assert.rejects(requestPasswordRecovery(client,'bad',env),error=>error.status===400);assert.equal(calls,0);
});
test('recovery acknowledgement never claims account existence and errors are redacted',async()=>{
 let options;const client={auth:{resetPasswordForEmail:async(email,value)=>{options={email,value};return {}}}};
 const result=await requestPasswordRecovery(client,' unknown@example.test ',env);assert.match(result.message,/If this address/);assert.equal(options.value.redirectTo,env.CPS_SITE_ORIGIN+'/auth/confirm');
 await assert.rejects(requestPasswordRecovery({auth:{resetPasswordForEmail:async()=>({error:{message:'SECRET smtp://private'}})}},'qa@example.test',env),error=>error.status===503&&!error.message.includes('SECRET'));
});
test('recovery callback rejects wrong types/tokens and revoked membership',async()=>{
 let verifies=0,signouts=0;const client={auth:{verifyOtp:async()=>{verifies++;return {}},getUser:async()=>({data:{user:{id:'fixture'}}}),signOut:async()=>{signouts++;return {}}},from:()=>({select(){return this},eq(){return this},maybeSingle:async()=>({data:{active:false}})})};
 for(const [token,type] of [['short','recovery'],['a'.repeat(32),'signup'],['a'.repeat(32),'invite']])await assert.rejects(acceptCustomerRecovery(client,token,type,env),error=>error.status===400);assert.equal(verifies,0);
 await assert.rejects(acceptCustomerRecovery(client,'a'.repeat(32),'recovery',env),error=>error.status===403);assert.equal(verifies,1);assert.equal(signouts,1);
});
test('index projection never reads provider data while indexing/publication is disabled',async()=>{
 const client={from(){throw new Error('unexpected private read')}};
 assert.deepEqual(await readPublicSitemap(client,{}),[]);
 const result=await readPublicSitemap(client,{CPS_SEO_ENABLED:'true',CPS_SITE_ORIGIN:env.CPS_SITE_ORIGIN});assert.equal(result.length,9);assert.equal(result.some(row=>row.url.includes('workspace')),false);
 for(const path of ['https://foreign.test','/workspace/admin/requests','//foreign.test','/content/../secret','/api/catalogue/photos/secret'])assert.equal(publicCanonical(path,{...env,CPS_SEO_ENABLED:'true'}),null);
});
test('index projection pages past 1000, rejects malformed paths and propagates provider outage',async()=>{
 const queries=[];const client={from(table){let start=0,end=0;return {select(){return this},order(){return this},range(a,b){start=a;end=b;return this},eq(){return this},then(resolve){queries.push({table,start,end});resolve({data:table==='cps_published_pages'?Array.from({length:1203},(_,i)=>({slug:'approved-'+i})).slice(start,end+1):[{id:'11111111-1111-4111-8111-111111111111',version:2,approved_version:2},{id:'../../private',version:2,approved_version:2},{id:'22222222-2222-4222-8222-222222222222',version:3,approved_version:2}]})}}}};
 const result=await readPublicSitemap(client,{...env,CPS_SEO_ENABLED:'true',CPS_PUBLICATION_ENABLED:'true',CPS_PUBLIC_CATALOGUE_ENABLED:'true'});assert.equal(result.length,1214);assert.equal(queries.filter(row=>row.table==='cps_published_pages').length,3);assert.equal(result.some(row=>row.url.includes('22222222')),false);
 await assert.rejects(readPublicSitemap({from:()=>({select(){return this},order(){return this},range(){return this},then(resolve){resolve({error:{message:'private'}})}})},{...env,CPS_SEO_ENABLED:'true',CPS_PUBLICATION_ENABLED:'true'}),/Public index temporarily unavailable/);
});
