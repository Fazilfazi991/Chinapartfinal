const assert = require('node:assert/strict');
const {writeFile} = require('node:fs/promises');
const {chromium} = require(process.env.CPS_PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
  const base=process.env.CPS_BASE_URL||'http://127.0.0.1:4318';
const target=new URL(base);assert.equal(target.protocol,'http:');assert.ok(['127.0.0.1','localhost','[::1]'].includes(target.hostname),'Local fixture only');
  const denied=await fetch(`${base}/api/rfq`,{method:'POST',headers:{Origin:base}});
  assert.equal(denied.status,503);
  const browser=await chromium.launch({headless:true,executablePath:process.env.CPS_CHROMIUM_PATH});
  try {
    const page=await browser.newPage({viewport:{width:390,height:844}});
    page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(120000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    for(const path of ['/','/request','/customer-access','/customer-access/recovery','/policies','/guides/oem-number','/information/about','/information/contact','/information/faqs','/information/shipping','/staff']) {
      const response=await page.goto(base+path);
      assert.equal(response.status(),200,path);
      assert.equal(response.headers()['x-content-type-options'],'nosniff');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,path);
    }
    assert.match(page.url(),/staff\/login/);
    const preview=await page.request.get(base+'/api/preview?actor=admin');assert.equal(preview.status(),404);assert.equal(preview.headers()['cache-control'],'private, no-store');assert.deepEqual(await preview.json(),{error:'Preview unavailable.'});
    const hub=await page.request.get(base+'/preview');assert.equal(hub.status(),404);assert.equal((await hub.text()).includes('Open staff preview'),false);
    const workspace=await page.request.get(base+'/api/workspace?mode=customer&resource=requests&actor=admin');assert.equal(workspace.status(),503);assert.equal(workspace.headers()['cache-control'],'private, no-store');
    const mutation=await page.request.post(base+'/api/workspace',{data:{type:'invoice.issue'}});assert.equal(mutation.status(),503);
    const photoUpload=await page.request.post(base+'/api/staff/catalogue/photos',{data:{type:'catalogue.photo.upload'}});assert.equal(photoUpload.status(),503);assert.equal(photoUpload.headers()['cache-control'],'private, no-store');
    for(const path of ['/api/catalogue/photos/11111111-1111-4111-8111-111111111111','/api/staff/catalogue/photos/11111111-1111-4111-8111-111111111111']){const response=await page.request.get(base+path);assert.equal(response.status(),404);assert.equal(response.headers()['cache-control'],'private, no-store');assert.deepEqual(await response.json(),{error:'Photo unavailable.'});}
    for(const path of ['/workspace/customer/overview','/workspace/admin/requests','/workspace/admin/administration']){const response=await page.request.get(base+path);assert.equal(response.status(),200);assert.match(await response.text(),/Workspace access is not activated/);assert.equal(response.headers()['cache-control'],'private, no-store');}
    for(const path of ['/catalogue','/catalogue/11111111-1111-4111-8111-111111111111','/content/private-draft'])assert.equal((await page.request.get(base+path)).status(),404);
    assert.equal((await page.request.get(base+'/auth/confirm?type=invite&token_hash=bad&next=https://foreign.example')).status(),503);
    const recovery=await page.request.get(base+'/auth/confirm?type=recovery&token_hash=bad');assert.equal(recovery.status(),503);
    const recoveryUI=await page.request.get(base+'/customer-access/recovery');assert.match(await recoveryUI.text(),/Password recovery is not activated/);
    const robots=await page.request.get(base+'/robots.txt');assert.match(await robots.text(),/Disallow: \//);
    const sitemap=await page.request.get(base+'/sitemap.xml');assert.equal((await sitemap.text()).includes('<url>'),false);
    assert.deepEqual(errors,[]);
    const result={passed:true,checks:['release routes and standard pages load','mobile layouts do not overflow','no browser page errors','security header','staff redirects to provider setup barrier','production submissions disabled despite local-test flag','production preview hub/API blocked despite preview flag','live workspace reads/writes fail closed','unconfigured photo upload/staff preview/public image fail closed with private headers','robots indexing off and empty sitemap without approved origin']};
    await writeFile('evidence/release-results.json',JSON.stringify(result,null,2));
    console.log(JSON.stringify(result,null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
