const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const {writeFile}=require('node:fs/promises');
const {chromium}=require(process.env.CPS_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.CPS_BASE_URL||'http://127.0.0.1:4317';
const target=new URL(base);assert.equal(target.protocol,'http:');assert.ok(['127.0.0.1','localhost','[::1]'].includes(target.hostname),'Local fixture only');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CPS_CHROMIUM_PATH});
 const errors=[],consoleErrors=[],expectedConsoleErrors=[];let expectedFailure=false;const marker=randomUUID().slice(0,8);
 try{
  const page=await browser.newPage({viewport:{width:1360,height:960}});
    page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error'){if(expectedFailure&&/503/.test(message.text()))expectedConsoleErrors.push(message.text());else consoleErrors.push(message.text())}});
  await page.emulateMedia({reducedMotion:'reduce'});
  const go=async path=>{const response=await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(response.status(),200,path);await page.locator('.ws-main h1').waitFor();await page.waitForFunction(()=>!document.body.innerText.includes('Loading synthetic workspace'));};
  const saved=async()=>{await page.getByRole('status').filter({hasText:'Saved in the local synthetic workspace'}).waitFor();};
  await go('/preview/customer/requests');
  await page.getByLabel('Part 1 description',{exact:true}).fill('Synthetic browser filter '+marker);
  await page.getByLabel('Part 1 number (optional)',{exact:true}).fill('DEMO-'+marker);
  await page.getByLabel('Part 1 quantity',{exact:true}).fill('2');
  await page.getByRole('button',{name:'Add another part',exact:true}).click();
  await page.getByLabel('Part 2 description',{exact:true}).fill('Synthetic browser seal '+marker);
  const retryKeys=[];let releaseFailure,seenFirst;
  const firstPending=new Promise(resolve=>{seenFirst=resolve}),failureRelease=new Promise(resolve=>{releaseFailure=resolve});
  expectedFailure=true;
  await page.route('**/api/preview?actor=customer-a',async route=>{if(route.request().method()!=='POST')return route.continue();retryKeys.push(route.request().postDataJSON().key);if(retryKeys.length===1){seenFirst();await failureRelease;return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Synthetic storage outage. Retry keeps the draft.'})});}return route.continue();});
  await page.getByRole('button',{name:'Save synthetic request',exact:true}).click();await firstPending;
  assert.equal(await page.getByLabel('Part 1 description',{exact:true}).isDisabled(),true);
  assert.equal(await page.getByRole('button',{name:'Add another part',exact:true}).isDisabled(),true);
  releaseFailure();await page.getByRole('alert').filter({hasText:'Synthetic storage outage'}).waitFor();expectedFailure=false;
  assert.equal(await page.getByLabel('Part 1 description',{exact:true}).inputValue(),'Synthetic browser filter '+marker);
  await page.getByRole('button',{name:'Save synthetic request',exact:true}).click();await saved();assert.equal(retryKeys.length,2);assert.equal(retryKeys[0],retryKeys[1]);await page.unroute('**/api/preview?actor=customer-a');
  await page.getByLabel('Comment',{exact:true}).fill('Customer conversation '+marker);
  await page.getByRole('button',{name:'Add local comment',exact:true}).click();await saved();
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('button').filter({hasText:'Synthetic browser filter '+marker}).click();
  await page.getByText('Customer conversation '+marker,{exact:true}).waitFor();
  const data=await page.request.get(base+'/api/preview?actor=customer-a');const snapshot=await data.json();
  const request=snapshot.requests.find(item=>item.items.some(line=>line.description.includes(marker)));assert.ok(request);assert.equal(request.items.length,2);
  await go('/preview/admin/requests?actor=north-agent');
  await page.getByRole('button').filter({hasText:'Synthetic browser filter '+marker}).click();
  await page.getByLabel('Review status',{exact:true}).selectOption('Needs information');
  await page.getByLabel('Internal note — staff only',{exact:true}).fill('PRIVATE-'+marker);
  await page.getByRole('button',{name:'Save local draft',exact:true}).click();await saved();
  await page.getByLabel('Comment',{exact:true}).fill('INTERNAL-COMMENT-'+marker);
  await page.getByLabel('Visible to',{exact:true}).selectOption('internal');
  await page.getByRole('button',{name:'Add local comment',exact:true}).click();await saved();
  await go('/preview/customer/requests?actor=customer-a');
  await page.getByRole('button').filter({hasText:'Synthetic browser filter '+marker}).click();
  assert.equal((await page.locator('body').innerText()).includes('PRIVATE-'+marker),false);assert.equal((await page.locator('body').innerText()).includes('INTERNAL-COMMENT-'+marker),false);
  await page.getByText('Needs information',{exact:true}).last().waitFor();
  await page.getByLabel('Synthetic actor',{exact:true}).selectOption('customer-b');
  await page.waitForFunction(text=>!document.body.innerText.includes(text),'Synthetic browser filter '+marker);
  const denied=await page.request.post(base+'/api/preview?actor=customer-b',{headers:{Origin:base},data:{key:randomUUID(),type:'request.comment',input:{id:request.id,version:request.version,body:'IDOR'}}});assert.equal(denied.status(),404);
  await go('/preview/admin/catalogue');
  await page.getByLabel('Product name',{exact:true}).fill('Synthetic catalogue '+marker);
  await page.getByLabel('Category',{exact:true}).fill('Filters');
  await page.getByLabel('Description',{exact:true}).fill('Synthetic catalogue entry; no fitment promise.');
  await page.getByLabel('Preview visibility',{exact:true}).selectOption('draft');
  await page.getByRole('button',{name:'Save local draft',exact:true}).click();await saved();
  await go('/preview/customer/catalogue');assert.equal((await page.locator('body').innerText()).includes('Synthetic catalogue '+marker),false);
  await go('/preview/admin/catalogue');await page.getByRole('button',{name:'Synthetic catalogue '+marker+' draft',exact:true}).click();
  await page.getByLabel('Preview visibility',{exact:true}).selectOption('preview');await page.getByRole('button',{name:'Save local draft',exact:true}).click();await saved();
  await go('/preview/customer/catalogue');await page.getByRole('button',{name:'Synthetic catalogue '+marker+' preview',exact:true}).click();await page.getByRole('heading',{name:'Synthetic catalogue '+marker,exact:true}).waitFor();
  await go('/preview/admin/orders?actor=north-agent');await page.getByLabel('Source request',{exact:true}).selectOption(request.id);
  await page.getByRole('button',{name:'Create internal order draft',exact:true}).click();await saved();
  const orderReference=await page.locator('.ws-detail-head h2').innerText();
  await page.getByLabel('Event title',{exact:true}).fill('Synthetic review '+marker);
  await page.getByLabel('Event description',{exact:true}).fill('No shipping booked.');
  await page.getByRole('button',{name:'Add synthetic tracking event',exact:true}).click();await saved();
  const staffSnapshot=await (await page.request.get(base+'/api/preview?actor=north-agent')).json();const order=staffSnapshot.orders.find(item=>item.reference===orderReference);assert.ok(order);
  await go('/preview/admin/invoices?actor=north-agent');await page.getByLabel('Order',{exact:true}).selectOption(order.id);
  await page.getByLabel('Currency code',{exact:true}).fill('AED');
  await page.getByLabel('Invoice line 1',{exact:true}).fill('Synthetic browser line '+marker);
  await page.getByLabel('Line 1 unit amount in minor units',{exact:true}).fill('12500');
  await page.getByRole('button',{name:'Save local draft',exact:true}).click();await saved();
  await page.getByText('Awaiting tax review',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Issue invoice — setup required',exact:true}).isDisabled(),true);
  await page.emulateMedia({media:'print'});assert.equal(await page.locator('.ws-invoice').isVisible(),true);assert.equal(await page.locator('.ws-record-list').isVisible(),false);assert.equal(await page.locator('.ws-invoice').innerText().then(text=>text.includes('NOT A TAX INVOICE')),true);await page.emulateMedia({media:'screen',reducedMotion:'reduce'});
  // New drafts are private; review/share through the same local API before customer viewing.
  const preShare=await (await page.request.get(base+'/api/preview?actor=customer-a')).json();assert.equal(preShare.orders.some(x=>x.id===order.id),false);
  await go('/preview/admin/orders');await page.getByRole('button',{name:orderReference+' Draft '+request.items[0].description,exact:true}).click();
  const orderReview=page.locator('.ws-copy-preview').first();await orderReview.getByLabel('Internal review evidence',{exact:true}).fill('Synthetic browser order review');await orderReview.getByRole('button',{name:'Record draft review',exact:true}).click();await saved();await orderReview.getByRole('button',{name:'Share in synthetic preview',exact:true}).click();await saved();
  const trackingReview=page.locator('.ws-copy-preview').nth(1);await trackingReview.getByLabel('Internal review evidence',{exact:true}).fill('Synthetic browser tracking review');await trackingReview.getByRole('button',{name:'Record draft review',exact:true}).click();await saved();await page.locator('.ws-detail-head h2').filter({hasText:orderReference}).waitFor();await trackingReview.getByRole('button',{name:'Share in synthetic preview',exact:true}).click();await saved();
  await go('/preview/admin/administration');await page.getByLabel('Office label',{exact:true}).fill('Browser inactive office '+marker);await page.getByRole('button',{name:'Save local draft',exact:true}).click();await saved();await page.reload({waitUntil:'networkidle'});await page.getByRole('button').filter({hasText:'Browser inactive office '+marker}).click();assert.equal(await page.getByLabel('Active office',{exact:true}).isChecked(),false);
  await page.getByRole('button',{name:'Staff access',exact:true}).click();await page.getByRole('button').filter({hasText:'Demo North office agent'}).click();assert.equal(await page.getByLabel('Demo account',{exact:true}).inputValue(),'north-agent');
  await go('/preview/customer/orders');await page.getByRole('button',{name:orderReference+' Draft '+request.items[0].description,exact:true}).click();await page.getByText('Synthetic review '+marker,{exact:true}).waitFor();
  await go('/preview/customer/support');await page.getByLabel('Subject',{exact:true}).fill('Synthetic support '+marker);await page.getByLabel('Message',{exact:true}).fill('Local request for update');await page.getByRole('button',{name:'Save local support request',exact:true}).click();await saved();
  await go('/preview/admin/support?actor=north-agent');await page.getByRole('button',{name:'Synthetic support '+marker+' Open',exact:true}).click();await page.getByLabel('Reply',{exact:true}).fill('Local reply '+marker);await page.getByRole('button',{name:'Save local reply',exact:true}).click();await saved();
  await go('/preview/customer/support');await page.getByRole('button',{name:'Synthetic support '+marker+' Open',exact:true}).click();await page.getByText('Local reply '+marker,{exact:true}).waitFor();
  await go('/preview/admin/content');await page.getByLabel('Page title',{exact:true}).fill('Content draft '+marker);await page.getByLabel('Page slug',{exact:true}).fill('draft-'+marker);await page.getByLabel('Draft copy',{exact:true}).fill('<script>throw new Error("XSS")</script> Synthetic plain text');await page.getByRole('button',{name:'Save local draft',exact:true}).click();await saved();assert.equal(await page.locator('.ws-copy-preview script').count(),0);
  await go('/preview/admin/audit');await page.getByText('catalogue.save',{exact:true}).first().waitFor();
  for(const [device,viewport] of [['desktop',{width:1360,height:960}],['mobile',{width:390,height:844}]]){
   await page.setViewportSize(viewport);
   for(const [mode,section] of [['admin','overview'],['admin','catalogue'],['admin','customers'],['admin','orders'],['admin','invoices'],['admin','payments'],['admin','content'],['admin','administration'],['customer','requests'],['customer','support']]){
    await go(`/preview/${mode}/${section}`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,device+mode+section);assert.deepEqual(await page.locator('img').evaluateAll(images=>images.filter(image=>image.complete&&image.naturalWidth===0).map(image=>image.src)),[]);if(['overview','requests','invoices'].includes(section))await page.screenshot({path:`evidence/workspace-${mode}-${section}-${device}.png`});
   }
  }
  for(const path of ['/information/about','/information/contact','/information/faqs','/information/how-it-works','/information/shipping']){const response=await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(response.status(),200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,path);}
  // Failure/size checks through a separate HTTP context avoid expected rejected
  // requests polluting the UI console collection.
  const invalid=await page.request.post(base+'/api/preview?actor=admin',{headers:{Origin:base},data:{key:randomUUID(),type:'catalogue.save',input:{title:'x'.repeat(70000)}}});assert.equal(invalid.status(),413);
  const foreign=await page.request.post(base+'/api/preview?actor=admin',{headers:{Origin:'https://foreign.test'},data:{key:randomUUID(),type:'payment.start'}});assert.equal(foreign.status(),403);
  const payment=await page.request.post(base+'/api/preview?actor=admin',{headers:{Origin:base},data:{key:randomUUID(),type:'payment.start'}});assert.equal(payment.status(),503);
  const live=await page.request.get(base+'/api/workspace?mode=customer&resource=requests&actor=admin');assert.equal(live.status(),503);assert.equal(live.headers()['cache-control'],'private, no-store');
  assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);
  const result={passed:true,synthetic:true,liveServices:false,expectedInjected503ConsoleErrors:expectedConsoleErrors.length,checks:['customer multi-part request save/reload/comments','storage outage retains draft and same retry key; controls disabled pending','staff review/internal notes hidden from customer','cross-company IDOR denied','catalogue draft/preview visibility','new drafts private until explicit synthetic review/share; parent-gated tracking','administrator office/staff screens and inactive office default','invoice unknown tax/no issuance/print draft','support two-way local conversation','content plain-text XSS safety','audit records','desktop/mobile screens no document overflow or broken assets','standard information pages','oversize/foreign-origin/disabled payment/live workspace barriers','no unexpected page or browser console errors']};
  await writeFile('evidence/workspace-browser-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
