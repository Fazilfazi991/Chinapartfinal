// Isolated headless browser; hosted disposable accounts from the acceptance run.
const assert=require('node:assert/strict');
const {readFileSync,writeFileSync}=require('node:fs');
const {chromium}=require(process.env.CPS_PLAYWRIGHT_MODULE||'playwright');
const {createClient}=require('@supabase/supabase-js');
require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const base=process.env.CPS_BASE_URL||'http://127.0.0.1:4419',target=new URL(base);
assert.equal(target.protocol,'http:');assert.equal(target.hostname,'127.0.0.1');
const state=JSON.parse(readFileSync('evidence/hosted-test-state.json','utf8'));
assert.equal(process.env.NEXT_PUBLIC_SUPABASE_URL,`https://${state.ref}.supabase.co`);
assert.equal(process.env.CPS_LOCAL_TEST_BACKEND,'false');
const service=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const phase=process.argv[2]||'first',checks=[];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CPS_CHROMIUM_PATH});
 const errors=[],consoleErrors=[];
 try{
  const context=await browser.newContext({viewport:{width:1360,height:960},...(phase==='after-restart'?{storageState:'evidence/hosted-browser-session.json'}:{})});
  const page=await context.newPage();page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
  const go=async(path)=>{await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(await page.locator('[data-nextjs-dialog]').count(),0);};
  const login=async(role)=>{await go('/staff/login');await page.getByLabel('Email',{exact:true}).fill(state.users[role].email);await page.getByLabel('Password',{exact:true}).fill(state.users[role].password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/staff');await page.getByRole('heading',{name:'Request inbox',exact:true}).waitFor();};
  if(phase==='review'){
   await login('agentA');await go('/staff/'+state.rfq);
   await page.getByLabel('Status',{exact:true}).selectOption('UnderReview');await page.getByLabel('Internal note',{exact:true}).fill('Hosted synthetic internal review only');await page.getByRole('button',{name:'Save internal review',exact:true}).click();await page.getByText(/Review updated: UnderReview/).waitFor();
   const saved=await service.from('cps_rfqs').select('status,status_version,internal_note').eq('id',state.rfq).single();assert.equal(saved.error,null);assert.equal(saved.data.status,'UnderReview');assert.equal(saved.data.internal_note,'Hosted synthetic internal review only');assert.ok(saved.data.status_version>0);checks.push('Real server action persists staff review and audit');
   await page.setViewportSize({width:390,height:844});await go('/staff/'+state.rfq);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.screenshot({path:'evidence/hosted-rfq-detail-mobile.png',fullPage:true});checks.push('Real saved RFQ detail is responsive on mobile');
  }else if(phase==='after-restart'){
   await go('/staff');await page.getByText(state.reference,{exact:true}).waitFor();checks.push('Real SSR cookie and persisted RFQ survive application restart');
   await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL('**/staff/login');await go('/staff');assert.ok(page.url().includes('/staff/login'));checks.push('Real SSR logout removes protected access');
  }else{
   await go('/staff');assert.ok(page.url().includes('/staff/login'));checks.push('Direct protected page redirects anonymous browser');
   await page.getByLabel('Email',{exact:true}).fill(state.users.admin.email);await page.getByLabel('Password',{exact:true}).fill('Incorrect-acceptance-password');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByText('Sign in could not be completed. Check your details or contact your administrator.',{exact:true}).waitFor();checks.push('Invalid real Auth credentials show honest failure');
   await login('agentA');await page.getByText(state.reference,{exact:true}).waitFor();checks.push('Office A real login and SSR request inbox');
   await go('/staff/'+state.rfq);await page.getByText('Disposable hosted acceptance',{exact:true}).waitFor();await page.screenshot({path:'evidence/hosted-rfq-desktop.png',fullPage:true});checks.push('Staff retrieves actual persisted RFQ detail');
   const denied=await page.request.get(base+'/staff/'+state.otherRfq);assert.equal(denied.status(),404);checks.push('Cross-office direct detail returns 404');
   const inactive=await service.from('cps_staff_members').update({active:false}).eq('user_id',state.users.agentA.id);assert.equal(inactive.error,null);
   try{await go('/staff');assert.ok(page.url().includes('/staff/login'));checks.push('Revoked member loses SSR access with existing cookies');}finally{assert.equal((await service.from('cps_staff_members').update({active:true}).eq('user_id',state.users.agentA.id)).error,null);}
   await login('admin');await go('/workspace/admin/overview');await page.locator('.ws-main h1').waitFor();await page.waitForFunction(()=>!document.body.innerText.includes('Loading workspace.'));assert.equal(await page.getByText('LOCAL SYNTHETIC PREVIEW',{exact:true}).count(),0);await page.screenshot({path:'evidence/hosted-crm-desktop.png',fullPage:true});checks.push('Administrator CRM uses real provider without preview actors');
   await go('/staff');await context.storageState({path:'evidence/hosted-browser-session.json'});checks.push('Real SSR cookie state retained for restart acceptance');
   await page.setViewportSize({width:390,height:844});await go('/staff');await page.getByText(state.reference,{exact:true}).waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.screenshot({path:'evidence/hosted-staff-mobile.png',fullPage:true});checks.push('Hosted staff inbox renders at mobile width');
   await go('/request');await page.getByLabel('Full name',{exact:false}).waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.screenshot({path:'evidence/hosted-rfq-mobile-gated.png',fullPage:true});checks.push('Public mobile enquiry remains gated with honest copy');
   const gated=await page.request.post(base+'/api/rfq',{headers:{Origin:base},data:{}});assert.equal(gated.status(),503);assert.equal((await gated.json()).reference,undefined);checks.push('Unconfigured anti-abuse route returns 503 without a reference');
  }
  assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);
  writeFileSync(`evidence/hosted-browser-${phase}-results.json`,JSON.stringify({passed:true,liveSupabase:true,checks,pageErrors:errors,unexpectedConsoleErrors:consoleErrors},null,2));
  console.log(JSON.stringify({passed:true,phase,checks:checks.length}));await context.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
