import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const script=fileURLToPath(new URL('../scripts/check-config.mjs',import.meta.url));
function run(env={},args=[]) {
  const cwd=mkdtempSync(join(tmpdir(),'cps-config-check-'));
  try {
    // Keep the process environment needed on Windows, excluding all application
    // configuration. Empty cwd prevents the fixture from loading developer .env.
    const base=Object.fromEntries(Object.entries(process.env).filter(([key])=>! /^(?:CPS_|NEXT_PUBLIC_|SUPABASE_|TURNSTILE_)/.test(key)));
    const result=spawnSync(process.execPath,[script,'--production',...args],{cwd,env:{...base,...env},encoding:'utf8'});
    if(result.error)throw result.error;
    assert.equal(result.stderr,'');
    return {...result,report:JSON.parse(result.stdout)};
  } finally {rmdirSync(cwd);}
}
test('release guard permits the explicitly disabled site and strict readiness rejects missing services',()=>{
  const disabled=run({CPS_SUBMISSIONS_ENABLED:'false',CPS_UPLOADS_ENABLED:'false'});
  assert.equal(disabled.status,0);assert.equal(disabled.report.mode,'disabled');assert.deepEqual(disabled.report.blockingIssues,[]);
  assert.equal(run({},['--require-submissions']).status,1);
});
test('release guard fails before build when submissions are enabled without dependencies',()=>{
  const result=run({CPS_SUBMISSIONS_ENABLED:'true',CPS_BACKEND:'supabase'});
  assert.equal(result.status,1);assert.equal(result.report.submissionsReady,false);
  assert.ok(result.report.blockingIssues.some(issue=>issue.key==='SUPABASE_SECRET_KEY'));
});
test('release guard refuses public secrets and emits only redacted diagnostics',()=>{
  const value='sb_secret_'+ 'x'.repeat(32);
  const result=run({CPS_SUBMISSIONS_ENABLED:'false',NEXT_PUBLIC_UNEXPECTED:value});
  assert.equal(result.status,1);assert.equal(result.stdout.includes(value),false);
  assert.ok(result.report.blockingIssues.some(issue=>issue.code==='public_secret'));
});
test('workspace, customer accounts and publication cannot activate without their dependencies',()=>{
  for(const key of ['CPS_WORKSPACE_READS_ENABLED','CPS_WORKSPACE_WRITES_ENABLED','CPS_CUSTOMER_AUTH_ENABLED','CPS_PUBLICATION_ENABLED','CPS_PUBLIC_CATALOGUE_ENABLED','CPS_RFQ_LINKING_ENABLED','CPS_DOCUMENT_VISIBILITY_ENABLED','CPS_CATALOGUE_PHOTOS_ENABLED']){
    const result=run({[key]:'true'});assert.equal(result.status,1,key);assert.ok(result.report.blockingIssues.some(issue=>issue.key===key));
  }
});
