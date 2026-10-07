const assert=require('node:assert/strict');

const {spawn}=require('node:child_process');

const {openSync,closeSync,writeFileSync}=require('node:fs');

const {chromium}=require(process.env.CPS_PLAYWRIGHT_MODULE||'playwright');

module.exports=async function({fixture,sql,customerA,customerB,inactive,agent,other,admin,companyA,createdId}){

 const base='http://127.0.0.1:4320';

 for(const id of [customerA,customerB,inactive,agent,other,admin])fixture.passwords.set(id+'@example.test',id);

 // Fixed loopback test port is reserved by this invocation only. Refuse collisions.

 const net=require('node:net');const reservation=net.createServer();await new Promise((resolve,reject)=>reservation.once('error',reject).listen(4320,'127.0.0.1',resolve));await new Promise(resolve=>reservation.close(resolve));

 const output=openSync('evidence/provider-browser-server.log','w');

 const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','-p','4320','-H','127.0.0.1'],{cwd:process.cwd(),env:{...process.env,NODE_ENV:'development',CPS_DEV_PROFILE:'provider-test',CPS_BACKEND:'supabase',NEXT_PUBLIC_SUPABASE_URL:fixture.origin,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:fixture.publicKey,SUPABASE_SECRET_KEY:fixture.secretKey,CPS_SITE_ORIGIN:base,CPS_WORKSPACE_READS_ENABLED:'true',CPS_WORKSPACE_WRITES_ENABLED:'true',CPS_CUSTOMER_AUTH_ENABLED:'true',CPS_CUSTOMER_RECOVERY_ENABLED:'true',CPS_PUBLICATION_ENABLED:'true',CPS_PUBLIC_CATALOGUE_ENABLED:'true',CPS_RFQ_LINKING_ENABLED:'true',CPS_CATALOGUE_PHOTOS_ENABLED:'true',CPS_SCANNER_URL:fixture.origin+'/scanner',CPS_SCANNER_TOKEN:'synthetic-scanner-token',CPS_DOCUMENT_VISIBILITY_ENABLED:'true',CPS_DOCUMENT_POLICY_JSON:JSON.stringify({reference:'synthetic-browser-policy',allow:{order:true,invoice:true,tracking:true}}),CPS_SUBMISSIONS_ENABLED:'false',CPS_UPLOADS_ENABLED:'false',CPS_LOCAL_TEST_BACKEND:'false',CPS_PREVIEW_ENABLED:'false'},stdio:['ignore',output,output],windowsHide:true});

 writeFileSync('evidence/provider-browser-server.pid',String(child.pid));

 let browser,diagnosticPage;

 try{

  const deadline=Date.now()+60000;for(;;){try{const response=await fetch(base+'/customer-access');if(response.status===200)break}catch{}if(Date.now()>deadline||child.exitCode!==null)throw new Error('Isolated provider dev server did not start');await new Promise(resolve=>setTimeout(resolve,500));}

  browser=await chromium.launch({headless:true,executablePath:process.env.CPS_CHROMIUM_PATH});

  const errors=[],unexpectedConsole=[];let expectedError=false;const context=await browser.newContext({viewport:{width:1360,height:960}}),page=await context.newPage();

  diagnosticPage=page;
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error'&&!expectedError)unexpectedConsole.push(message.text())});

  const go=async path=>{const response=await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(response.status(),200,path);assert.equal(await page.locator('[data-nextjs-dialog]').count(),0);assert.equal(await page.evaluate(()=>document.body.innerText.trim().length>0),true);return response;};

  const ready=async()=>{await page.locator('.ws-main h1').waitFor();await page.waitForFunction(()=>!document.body.innerText.includes('Loading workspace.'));};

  const login=async(id,staff=false)=>{await go(staff?'/staff/login':'/customer-access');await page.getByLabel('Email',{exact:true}).fill(id+'@example.test');await page.getByLabel('Password',{exact:true}).fill('Synthetic-password-123!');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL(staff?'**/staff':'**/workspace/customer/overview');if(!staff)await ready();};

  await go('/customer-access');expectedError=true;

  assert.equal((await page.request.get(base+'/api/workspace?mode=customer&resource=snapshot&actor='+admin)).status(),401);expectedError=false;

  await login(customerA);assert.equal(await page.getByLabel('Synthetic actor').count(),0);assert.equal(await page.getByText('LOCAL SYNTHETIC PREVIEW',{exact:true}).count(),0);

  await go('/workspace/customer/requests?actor='+admin);await ready();

  await page.getByRole('button',{name:'New',exact:true}).click();await page.getByLabel('Part 1 description',{exact:true}).fill('Browser provider gasket');await page.getByLabel('Part 1 quantity',{exact:true}).fill('3');

  let attempts=[];let release,seen;const waitPending=new Promise(resolve=>seen=resolve),waitRelease=new Promise(resolve=>release=resolve);

  await page.route('**/api/workspace?mode=customer',async route=>{if(route.request().method()!=='POST')return route.continue();attempts.push(route.request().postDataJSON().key);if(attempts.length===1){seen();await waitRelease;return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Synthetic provider outage. Retry keeps your fields.'})});}return route.continue();});

  expectedError=true;await page.getByRole('button',{name:'Save request',exact:true}).click();await waitPending;assert.equal(await page.getByLabel('Part 1 description',{exact:true}).isDisabled(),true);release();await page.getByRole('alert').filter({hasText:'Synthetic provider outage'}).waitFor();expectedError=false;

  assert.equal(await page.getByLabel('Part 1 description',{exact:true}).inputValue(),'Browser provider gasket');await page.getByRole('button',{name:'Save request',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();assert.equal(attempts[0],attempts[1]);await page.unroute('**/api/workspace?mode=customer');

  await page.getByLabel('Comment',{exact:true}).fill('Provider browser comment');await page.getByRole('button',{name:'Add comment',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();

  await page.reload({waitUntil:'networkidle'});await ready();await page.getByRole('button').filter({hasText:'Browser provider gasket'}).click();await page.getByText('Provider browser comment',{exact:true}).waitFor();

  const snapshot=await (await page.request.get(base+'/api/workspace?mode=customer&resource=snapshot')).json();assert.equal(snapshot.synthetic,false);assert.equal(JSON.stringify(snapshot).includes('STRICTLY PRIVATE'),false);const record=snapshot.requests.find(x=>x.items[0]?.description==='Browser provider gasket');assert.equal(record.company,companyA);

  const forged=await page.request.post(base+'/api/workspace?mode=customer&actor='+admin,{headers:{Origin:base},data:{key:require('node:crypto').randomUUID(),type:'request.update',input:{id:createdId,version:2,status:'Closed',internalNote:'attack'}}});assert.equal(forged.status(),403);

  const origin=await page.request.post(base+'/api/workspace?mode=customer',{headers:{Origin:'https://foreign.example'},data:{}});assert.equal(origin.status(),403);

  const huge=await page.request.post(base+'/api/workspace?mode=customer',{headers:{Origin:base,'Content-Type':'application/json'},data:JSON.stringify({padding:'x'.repeat(66000)})});assert.equal(huge.status(),413);

  await page.setViewportSize({width:390,height:844});for(const section of ['overview','requests','catalogue','orders','invoices','payments','support']){await go('/workspace/customer/'+section);await ready();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,section);}

  await page.screenshot({path:'evidence/provider-customer-mobile.png',fullPage:true});

  await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL('**/customer-access');expectedError=true;assert.equal((await page.request.get(base+'/api/workspace?mode=customer&resource=snapshot')).status(),401);expectedError=false;

  await login(customerA);
  const oldRequest=require('node:crypto').randomUUID();sql(`insert into public.cps_portal_requests(id,company_id,reference,items,created_at) values('${oldRequest}','${companyA}','BROWSER-OLDEST','[{"description":"Older browser requirement","quantity":1,"partNumber":""}]','1990-01-01');insert into public.cps_portal_requests(company_id,reference,items,created_at) select '${companyA}','BROWSER-PAGE-'||g,'[{"description":"Synthetic paged part","quantity":1,"partNumber":""}]'::jsonb,'2000-01-01'::timestamptz+g*interval '1 minute' from generate_series(1,61)g;insert into public.cps_portal_comments(request_id,author_id,body,visibility) select '${oldRequest}','${agent}','Browser older conversation '||g,'customer' from generate_series(1,65)g;`);
  await go('/workspace/customer/requests');await ready();await page.getByRole('button',{name:'Next requests page',exact:true}).click();await ready();await page.getByRole('button').filter({hasText:'BROWSER-OLDEST'}).click();await ready();assert.equal(new URL(page.url()).searchParams.get('page'),'1');assert.equal(new URL(page.url()).searchParams.get('record'),oldRequest);await page.getByRole('button',{name:'Next comments page',exact:true}).click();await ready();assert.equal(await page.locator('.ws-conversation article').count(),15);await page.reload({waitUntil:'networkidle'});await ready();await page.getByRole('heading',{name:'BROWSER-OLDEST',exact:true}).waitFor();assert.equal(await page.locator('.ws-conversation article').count(),50);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL('**/customer-access');await page.getByRole('link',{name:'Forgot your password?',exact:true}).click();await page.getByLabel('Account email',{exact:true}).fill(customerA+'@example.test');await page.getByRole('button',{name:'Request password reset',exact:true}).click();await page.getByRole('status').filter({hasText:'If this address belongs'}).waitFor();const recoveryMessage=await page.getByRole('status').textContent();await page.getByLabel('Account email',{exact:true}).fill('unknown@example.test');await page.getByRole('button',{name:'Request password reset',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('button.request-primary')?.disabled);assert.equal(await page.getByRole('status').textContent(),recoveryMessage);
  const recoveryToken='fixture-recovery-'+customerA+'-'+require('node:crypto').randomUUID();await page.goto(base+'/auth/confirm?type=recovery&token_hash='+recoveryToken+'&next=https://foreign.example',{waitUntil:'networkidle'});assert.equal(new URL(page.url()).pathname,'/customer-access/set-password');await page.getByLabel('New password',{exact:true}).fill('Browser-recovery-password-123!');await page.getByLabel('Confirm password',{exact:true}).fill('Browser-recovery-password-123!');await page.getByRole('button',{name:'Save password',exact:true}).click();await page.waitForURL('**/workspace/customer/overview');await ready();await page.goto(base+'/auth/confirm?type=recovery&token_hash='+recoveryToken,{waitUntil:'networkidle'});assert.equal(new URL(page.url()).pathname,'/customer-access');

  // The actual confirmation route ignores attacker-supplied redirects.

  await page.goto(base+'/auth/confirm?type=invite&token_hash=fixture-invite-'+customerA+'&next=https://foreign.example',{waitUntil:'networkidle'});assert.equal(new URL(page.url()).pathname,'/customer-access/set-password');await page.getByLabel('New password',{exact:true}).fill('Browser-synthetic-password-123!');await page.getByLabel('Confirm password',{exact:true}).fill('Browser-synthetic-password-123!');await page.getByRole('button',{name:'Save password',exact:true}).click();await page.waitForURL('**/workspace/customer/overview');await ready();

  await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL('**/customer-access');

  await go('/customer-access');await page.getByLabel('Email',{exact:true}).fill(inactive+'@example.test');await page.getByLabel('Password',{exact:true}).fill('Synthetic-password-123!');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByRole('alert').filter({hasText:'Sign in could not be completed'}).waitFor();assert.equal(new URL(page.url()).pathname,'/customer-access');

  await login(admin,true);sql(`insert into public.cps_rfqs(id,reference,digest,data,created_at) select gen_random_uuid(),'BROWSER-INBOX-'||g,repeat('a',64),'{"name":"Synthetic inbox","description":"Fixture only"}'::jsonb,'2000-01-01'::timestamptz+g*interval '1 minute' from generate_series(1,55)g;`);await go('/staff');await page.getByRole('link',{name:'Next inbox page',exact:true}).click();await page.getByRole('link',{name:'Previous inbox page',exact:true}).waitFor();assert.equal(new URL(page.url()).searchParams.get('page'),'1');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);sql(`delete from public.cps_rfqs where reference like 'BROWSER-INBOX-%';`);await go('/workspace/admin/content');await ready();await page.getByLabel('Page title',{exact:true}).fill('Browser approved information');await page.getByLabel('Page slug',{exact:true}).fill('browser-approved');await page.getByLabel('Draft copy',{exact:true}).fill('<script>window.fixtureXss=true</script> Approved plain text');await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();

  assert.equal(await page.getByRole('button',{name:'Publish approved version',exact:true}).isDisabled(),true);await page.getByRole('button',{name:'Approve current version',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();await page.getByRole('button',{name:'Publish approved version',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();

  await go('/content/browser-approved');assert.equal(await page.evaluate(()=>window.fixtureXss),undefined);await page.getByText('<script>window.fixtureXss=true</script> Approved plain text',{exact:true}).waitFor();

  await go('/workspace/admin/content');await ready();await page.getByRole('button').filter({hasText:'Browser approved information'}).click();await page.getByRole('button',{name:'Withdraw publication',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();expectedError=true;assert.equal((await page.request.get(base+'/content/browser-approved')).status(),404);expectedError=false;

  await go('/workspace/admin/requests?page=0&record='+oldRequest);await ready();assert.equal(await page.locator('.ws-select-list').getByRole('button').filter({hasText:'BROWSER-OLDEST'}).count(),0);await page.getByLabel('Internal note',{exact:false}).fill('  Older request note  ');await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();assert.equal(await page.getByLabel('Internal note',{exact:false}).inputValue(),'Older request note');await page.reload({waitUntil:'networkidle'});await ready();assert.equal(await page.getByLabel('Internal note',{exact:false}).inputValue(),'Older request note');
  await go('/workspace/admin/orders');await ready();await page.getByRole('button',{name:'New',exact:true}).click();await page.getByRole('button',{name:'Next requests choices',exact:true}).click();await page.getByLabel('Source request',{exact:true}).selectOption(oldRequest);await page.getByRole('button',{name:'Previous requests choices',exact:true}).click();await page.getByLabel('Source request',{exact:true}).waitFor();assert.equal(await page.getByLabel('Source request',{exact:true}).inputValue(),oldRequest);
  await go('/workspace/admin/administration');await ready();await page.getByLabel('Office label',{exact:true}).fill('Browser inactive office');await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();await page.reload({waitUntil:'networkidle'});await ready();await page.getByRole('button').filter({hasText:'Browser inactive office'}).click();assert.equal(await page.getByLabel('Active office',{exact:true}).isChecked(),false);

  await page.getByRole('button',{name:'Staff access',exact:true}).click();await page.getByRole('button').filter({hasText:agent}).click();assert.equal(await page.getByLabel('Existing provider account ID',{exact:true}).inputValue(),agent);

  await go('/workspace/admin/catalogue');await ready();await page.getByLabel('Product name',{exact:true}).fill('Browser catalogue filter');await page.getByLabel('Category',{exact:true}).fill('Browser filters');await page.getByLabel('Brand / equipment make (optional)',{exact:true}).fill('Browser Make');await page.getByLabel('Description',{exact:true}).fill('Synthetic part only');await page.getByLabel('Managed illustration',{exact:true}).selectOption('/parts-catalogue.png');await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();await page.getByRole('button',{name:'Approve current version',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();await page.getByRole('button',{name:'Publish approved version',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();

  await go('/catalogue');await page.getByLabel('Search part details',{exact:true}).fill('filter');await page.getByLabel('Category',{exact:true}).selectOption('Browser filters');await page.getByRole('button',{name:'Find parts',exact:true}).click();await page.waitForURL('**/catalogue?**');await page.getByRole('link',{name:'Browser catalogue filter',exact:true}).click();await page.getByRole('heading',{name:'Browser catalogue filter',exact:true}).waitFor();await page.getByText(/^Illustration only/).waitFor();assert.equal(await page.locator('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)),true);

  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'catalogue detail mobile');

  await go('/workspace/admin/catalogue');await ready();await page.getByRole('button').filter({hasText:'Browser catalogue filter'}).click();
  const pixels=await require('sharp')({create:{width:2,height:2,channels:4,background:{r:255,g:255,b:255,alpha:1}}}).png().toBuffer();
  await page.getByLabel('PNG / JPEG photo',{exact:true}).setInputFiles({name:'synthetic-photo.png',mimeType:'image/png',buffer:pixels});await page.getByLabel('Photo description',{exact:true}).fill('Synthetic uploaded test pixels');
  const photoKeys=[];await page.route('**/api/staff/catalogue/photos',async route=>{if(route.request().method()==='POST')photoKeys.push(route.request().postDataJSON().key);return route.continue();});fixture.scannerMode='outage';expectedError=true;await page.getByRole('button',{name:'Upload private photo',exact:true}).click();await page.getByRole('alert').filter({hasText:'could not be verified by the scanner'}).waitFor();expectedError=false;
  assert.equal(await page.getByLabel('Photo description',{exact:true}).inputValue(),'Synthetic uploaded test pixels');assert.equal(await page.getByLabel('PNG / JPEG photo',{exact:true}).evaluate(input=>input.files[0].name),'synthetic-photo.png');fixture.scannerMode='clean';await page.getByRole('button',{name:'Upload private photo',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();assert.equal(photoKeys[0],photoKeys[1]);await page.unroute('**/api/staff/catalogue/photos');
  const photoEntry=(await (await page.request.get(base+'/api/workspace?mode=staff&resource=snapshot')).json()).catalogue.find(x=>x.title==='Browser catalogue filter');assert.equal(photoEntry.visibility,'draft');assert.equal((await page.request.get(base+'/api/catalogue/photos/'+photoEntry.id)).status(),404);
  await page.getByRole('button',{name:'Approve current version',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();await page.getByRole('button',{name:'Publish approved version',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();
  await go('/catalogue/'+photoEntry.id);await page.getByRole('img',{name:'Synthetic uploaded test pixels',exact:true}).waitFor();assert.equal(await page.getByRole('img',{name:'Synthetic uploaded test pixels',exact:true}).evaluate(image=>image.complete&&image.naturalWidth===2),true);await page.screenshot({path:'evidence/catalogue-photo-mobile.png',fullPage:true});
  const exposed=await page.request.get(base+'/api/catalogue/photos/'+photoEntry.id);assert.equal(exposed.status(),200);assert.equal(exposed.headers()['cache-control'],'private, no-store');
  await go('/workspace/admin/catalogue');await ready();await page.getByRole('button').filter({hasText:'Browser catalogue filter'}).click();await page.getByRole('button',{name:'Remove current photo',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved. The workspace acknowledged'}).waitFor();assert.equal((await page.request.get(base+'/api/catalogue/photos/'+photoEntry.id)).status(),404);
  const foreignPhoto=await page.request.post(base+'/api/staff/catalogue/photos',{headers:{Origin:'https://foreign.test'},data:{}});assert.equal(foreignPhoto.status(),403);
  const largePhoto=await page.request.post(base+'/api/staff/catalogue/photos',{headers:{Origin:base,'Content-Type':'application/json'},data:JSON.stringify({padding:'x'.repeat(1500001)})});assert.equal(largePhoto.status(),413);
  await page.setViewportSize({width:1360,height:960});for(const section of ['overview','requests','catalogue','customers','orders','invoices','payments','support','content','audit','administration']){await go('/workspace/admin/'+section);await ready();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,section);}

  await page.screenshot({path:'evidence/provider-staff-desktop.png',fullPage:true});

  sql(`delete from public.cps_portal_notes where request_id='${oldRequest}';delete from public.cps_portal_comments where request_id='${oldRequest}';delete from public.cps_portal_requests where reference='BROWSER-OLDEST' or reference like 'BROWSER-PAGE-%';`);
  assert.deepEqual(errors,[]);assert.deepEqual(unexpectedConsole,[]);

  const result={passed:true,liveProvider:false,SSR:'actual Next server actions, Supabase SSR cookies and authoritative membership, against synthetic local Auth fixture',checks:['customer login and no actor spoof switch','durable write/reload/comment through real SQL','failed save retains draft and operation key; pending fields disabled','raw admin bypass, foreign origin and 64KB body denied','7 customer mobile screens without overflow','invite confirmation ignores external next; matching password setup/logout','inactive account denied','admin review/publish/withdraw controls with safe plain text','11 staff desktop screens without overflow; administrator roster UI and private new office','anonymous catalogue search/detail and labelled illustration on mobile','photo picker/scanner outage retains file/fields/key; private upload, review/publish, mediated mobile image, remove/withdraw, origin/size gates','older list/detail reload and conversation page2; native parent selector keeps older selection','recovery request known/unknown same copy; official callback ignores external next; password update and replay denial','no unexpected console/page errors']};writeFileSync('evidence/provider-workspace-browser-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));

 }catch(error){if(diagnosticPage)try{writeFileSync('evidence/pagination-recovery-browser-failure.txt',await diagnosticPage.locator('body').innerText());await diagnosticPage.screenshot({path:'evidence/pagination-recovery-browser-failure.png',fullPage:true});}catch{}throw error;}finally{

  if(browser)await browser.close();

  // Signal only the child created above, never enumerate/terminate unrelated apps.

  if(child.exitCode===null){child.kill('SIGINT');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),new Promise(resolve=>setTimeout(resolve,5000))]);}

  closeSync(output);

 }

};

