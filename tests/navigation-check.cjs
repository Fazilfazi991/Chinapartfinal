const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const {writeFile}=require('node:fs/promises');
const {chromium}=require(process.env.CPS_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.CPS_BASE_URL||'http://127.0.0.1:4318';
const target=new URL(base);
assert.equal(target.protocol,'http:');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(target.hostname),'Local fixture only');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CPS_CHROMIUM_PATH});
  const pageErrors=[],consoleErrors=[],externalFonts=[];
  try {
    const page=await browser.newPage({viewport:{width:1280,height:960}});
    page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(120000);
    await page.emulateMedia({reducedMotion:'reduce'});
    page.on('pageerror',error=>pageErrors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
    page.on('request',request=>{if(/fonts\.(?:googleapis|gstatic)\.com/.test(request.url()))externalFonts.push(request.url());});
    for(const [name,viewport] of [['desktop',{width:1280,height:960}],['tablet',{width:768,height:1024}],['mobile',{width:390,height:844}]]) {
      await page.setViewportSize(viewport);
      const response=await page.goto(base,{waitUntil:'networkidle'});
      assert.equal(response.status(),200);await page.getByRole('heading',{name:/The Right Part/}).waitFor();
      assert.equal(await page.locator('.header-search,.finder,.products,.browse-discovery,.quick-browse,.popular-searches').count(),0);
      // Some faces are used only by alternate themes. Explicitly load them for
      // asset verification rather than assuming every face renders on this page.
      await page.evaluate(async()=>{await Promise.all(['400 16px Manrope','400 16px "DM Mono"','600 16px "Playfair Display"','italic 600 16px "Playfair Display"'].map(font=>document.fonts.load(font)));await document.fonts.ready;});
      const loadedFonts=await page.evaluate(()=>Array.from(document.fonts).filter(font=>font.status==='loaded').map(font=>font.family.replaceAll('"','')));
      for(const family of ['Manrope','DM Mono','Playfair Display'])assert.ok(loadedFonts.includes(family),family+' must load locally');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,name);
      assert.deepEqual(await page.locator('img').evaluateAll(images=>images.filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.getAttribute('src'))),[],name);
      assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(links=>links.map(link=>link.getAttribute('href')).filter(href=>!document.getElementById(decodeURIComponent(href.slice(1))))),[],name);
      await page.screenshot({path:`evidence/navigation-${name}.png`});
    }
    for(const [label,anchor] of [['About','about'],['Contact','contact']]) {
      await page.getByRole('button',{name:'Open navigation',exact:true}).click();
      await page.locator('.mobile-menu').getByRole('link',{name:label,exact:true}).click();
      assert.equal(new URL(page.url()).hash,'#'+anchor);
      assert.equal(await page.locator('.mobile-menu').count(),0);
      await page.waitForFunction(id=>{const bounds=document.getElementById(id).getBoundingClientRect();return bounds.top<innerHeight&&bounds.bottom>0;},anchor,{timeout:3000});
    }
    await page.setViewportSize({width:1280,height:960});await page.goto(base,{waitUntil:'networkidle'});
    await page.locator('.commerce-subnav').getByRole('link',{name:'Vehicle & Equipment',exact:true}).click();
    assert.equal(new URL(page.url()).hash,'#vehicle-equipment');
    for(const [label,href] of [['About','#about'],['How It Works','#how-it-works'],['Quality Options','/guides/quality-options'],['Worldwide Service','#worldwide-service'],['FAQs','#faqs']]) {
      assert.equal(await page.locator('footer').getByRole('link',{name:label,exact:true}).first().getAttribute('href'),href);
    }
    assert.equal(await page.locator('footer').getByRole('link',{name:'Passenger Vehicles',exact:true}).getAttribute('href'),'/request?part=Passenger%20Vehicles');
    for(const path of ['/request','/customer-access','/policies','/guides/quality-options','/staff']) {
      const response=await page.goto(base+path,{waitUntil:'networkidle'});
      assert.equal(response.status(),200,path);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,path);
      assert.equal(await page.locator('[data-nextjs-dialog],.vite-error-overlay').count(),0,path);
    }
    assert.match(page.url(),/\/staff\/login\?error=access$/);
    assert.match(await page.locator('body').innerText(),/not configured/);
    const denied=await page.request.post(base+'/api/rfq',{headers:{Origin:base}});
    assert.equal(denied.status(),503);
    const attachment=await page.request.get(base+'/api/staff/attachments/'+randomUUID());
    assert.equal(attachment.status(),503);assert.equal(attachment.headers()['cache-control'],'private, no-store');
    assert.deepEqual(await attachment.json(),{error:'Staff access is not configured.'});
    assert.deepEqual(pageErrors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(externalFonts,[]);
    const result={date:new Date().toISOString().slice(0,10),passed:true,localOnly:true,checks:['sparse catalogue/search presentation hidden','all homepage anchors resolve','desktop vehicle navigation','mobile About/Contact navigation and menu close','footer destinations and requirement prefill','desktop/tablet/mobile layout and images','original brand fonts load locally without Google requests','routes and no error overlay','no browser console/page errors','unconfigured submissions and private staff download fail closed'],pageErrors,consoleErrors,externalFonts};
    await writeFile('evidence/navigation-results.json',JSON.stringify(result,null,2));
    console.log(JSON.stringify(result,null,2));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
