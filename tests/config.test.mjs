import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectConfiguration,backendMode,uploadsEnabled,staffAuthReady,persistenceReady,allowedOrigin} from '../lib/config.mjs';
const configured={NODE_ENV:'production',CPS_BACKEND:'supabase',CPS_SUBMISSIONS_ENABLED:'true',CPS_SITE_ORIGIN:'https://parts.example.com',NEXT_PUBLIC_SUPABASE_URL:'https://cps-fixture.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_'+ 'p'.repeat(32),SUPABASE_SECRET_KEY:'sb_secret_'+ 's'.repeat(32),NEXT_PUBLIC_TURNSTILE_SITE_KEY:'site-fixture',TURNSTILE_SECRET_KEY:'secret-fixture'};
const jwt=role=>Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.c2lnbmF0dXJl';
test('setup can stage staff access with public config while ingestion remains disabled',()=>{
  const env={...configured,CPS_SUBMISSIONS_ENABLED:'false'};
  assert.equal(staffAuthReady(env),true);assert.equal(persistenceReady(env),true);assert.equal(backendMode(env),'disabled');
  assert.equal(allowedOrigin(new Request('https://parts.example.com/api',{headers:{origin:env.CPS_SITE_ORIGIN}}),env),false);
  assert.equal(inspectConfiguration({}).authReady,false);
});
test('invalid origins, URL paths, credentials and malformed booleans cannot enable submissions',()=>{
  for(const CPS_SITE_ORIGIN of ['https://','https://parts.example.com/','https://parts.example.com/path','https://user:pass@parts.example.com','https://parts.example.com?secret=x','https://parts.example.com#fragment','http://parts.example.com','https://your-approved-domain.example','https://localhost',' https://parts.example.com'])assert.equal(backendMode({...configured,CPS_SITE_ORIGIN}),'disabled',CPS_SITE_ORIGIN);
  for(const NEXT_PUBLIC_SUPABASE_URL of ['https://','https://project.supabase.co/rest/v1','https://user:pass@project.supabase.co','https://project.supabase.co?token=x'])assert.equal(staffAuthReady({...configured,NEXT_PUBLIC_SUPABASE_URL}),false);
  for(const CPS_SUBMISSIONS_ENABLED of ['TRUE','1',' true '])assert.equal(backendMode({...configured,CPS_SUBMISSIONS_ENABLED}),'disabled');
  assert.equal(inspectConfiguration({...configured,CPS_BACKEND:''}).submissionsReady,false);
  assert.equal(inspectConfiguration({...configured,CPS_BACKEND:'',CPS_LOCAL_TEST_BACKEND:'true'}).submissionsReady,false);
});
test('publishable and server key roles cannot be swapped or exposed via public variables',()=>{
  assert.equal(backendMode(configured),'supabase');
  assert.equal(backendMode({...configured,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:configured.SUPABASE_SECRET_KEY}),'disabled');
  assert.equal(persistenceReady({...configured,SUPABASE_SECRET_KEY:configured.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}),false);
  assert.equal(backendMode({...configured,NEXT_PUBLIC_OTHER_SECRET:'fixture'}),'disabled');
  assert.equal(staffAuthReady({...configured,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'public'}),false);
  const legacy={...configured,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:jwt('anon'),SUPABASE_SECRET_KEY:jwt('service_role')};
  assert.equal(backendMode(legacy),'supabase');
  assert.equal(backendMode({...legacy,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:jwt('service_role')}),'disabled');
  assert.equal(backendMode({...legacy,SUPABASE_SECRET_KEY:jwt('anon')}),'disabled');
});
test('local Supabase URLs are development-only and the disk adapter never activates in production',()=>{
  const env={...configured,NODE_ENV:'development',NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321',CPS_SITE_ORIGIN:'http://127.0.0.1:4317'};
  assert.equal(backendMode(env),'supabase');assert.equal(backendMode({...env,NODE_ENV:'production'}),'disabled');
  assert.equal(backendMode({NODE_ENV:'production',CPS_LOCAL_TEST_BACKEND:'true'}),'disabled');
  assert.equal(backendMode({NODE_ENV:'development',CPS_LOCAL_TEST_BACKEND:'true'}),'local');
});
test('uploads require a valid configured endpoint and diagnostic output never contains values',()=>{
  const env={...configured,CPS_UPLOADS_ENABLED:'true',CPS_SCANNER_URL:'https://scan.example.com/v1/scan',CPS_SCANNER_TOKEN:'scanner-fixture'};
  assert.equal(uploadsEnabled(env),true);
  for(const CPS_SCANNER_URL of ['https://','http://scan.example.com','https://user:pass@scan.example.com','https://scan.example.com?token=x'])assert.equal(uploadsEnabled({...env,CPS_SCANNER_URL}),false);
  assert.equal(uploadsEnabled({...env,CPS_SCANNER_TOKEN:''}),false);
  const report=JSON.stringify(inspectConfiguration({...env,NEXT_PUBLIC_OTHER_SECRET:'do-not-display-this-value'}));
  for(const value of [env.SUPABASE_SECRET_KEY,env.CPS_SCANNER_TOKEN,'do-not-display-this-value'])assert.equal(report.includes(value),false);
  assert.ok(report.includes('NEXT_PUBLIC_OTHER_SECRET'));
});
