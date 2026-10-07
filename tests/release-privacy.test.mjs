import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,access,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {sanitizeRelease} from '../scripts/sanitize-release.mjs';
test('release privacy cleanup strips generated records and manifests without touching originals',async()=>{
  const root=await mkdtemp(join(tmpdir(),'cps-release-fixture-'));
  try {
    await mkdir(join(root,'.local-data'),{recursive:true});
    await writeFile(join(root,'.local-data','private.json'),'synthetic');
    await mkdir(join(root,'.next','standalone','.local-data'),{recursive:true});
    await writeFile(join(root,'.next','standalone','.local-data','private.json'),'synthetic');
    await writeFile(join(root,'.next','route.nft.json'),JSON.stringify({version:1,files:['../.local-data/private.json','../lib/needed.mjs']}));
    const result=await sanitizeRelease(root);assert.equal(result.removedReferences,1);
    assert.deepEqual(JSON.parse(await readFile(join(root,'.next','route.nft.json'),'utf8')).files,['../lib/needed.mjs']);
    assert.equal(await readFile(join(root,'.local-data','private.json'),'utf8'),'synthetic');
    await assert.rejects(access(join(root,'.next','standalone','.local-data')));
  } finally {
    // mkdtemp created this exact synthetic fixture beneath OS temp.
    if(!root.startsWith(join(tmpdir(),'cps-release-fixture-')))throw new Error('Unexpected fixture path');
    await rm(root,{recursive:true,force:true});
  }
});

test('release removes traced and copied environment files while preserving local credentials and the template',async()=>{
  const root=await mkdtemp(join(tmpdir(),'cps-release-fixture-'));
  try{
    await mkdir(join(root,'.next','standalone','nested'),{recursive:true});
    await writeFile(join(root,'.env.local'),'synthetic local configuration');
    await writeFile(join(root,'.next','standalone','.env.local'),'synthetic local configuration');
    await writeFile(join(root,'.next','standalone','nested','.env.production'),'synthetic server configuration');
    await writeFile(join(root,'.next','standalone','.env.example'),'EMPTY_PLACEHOLDER=');
    await writeFile(join(root,'.next','route.nft.json'),JSON.stringify({version:1,files:['../.env.local','../.env.production','../.env.example','../lib/needed.mjs']}));
    const result=await sanitizeRelease(root);assert.equal(result.removedReferences,2);assert.equal(result.removedEnvironmentFiles,2);
    assert.equal(await readFile(join(root,'.env.local'),'utf8'),'synthetic local configuration');
    assert.deepEqual(JSON.parse(await readFile(join(root,'.next','route.nft.json'),'utf8')).files,['../.env.example','../lib/needed.mjs']);
    await assert.rejects(access(join(root,'.next','standalone','.env.local')));
    await assert.rejects(access(join(root,'.next','standalone','nested','.env.production')));
    assert.equal(await readFile(join(root,'.next','standalone','.env.example'),'utf8'),'EMPTY_PLACEHOLDER=');
  }finally{
    if(!root.startsWith(join(tmpdir(),'cps-release-fixture-')))throw new Error('Unexpected fixture path');
    await rm(root,{recursive:true,force:true});
  }
});
