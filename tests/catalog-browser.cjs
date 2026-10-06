const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require('../backend/storage/browser-tools/node_modules/playwright');
const [base,run]=process.argv.slice(2);
if(!/^[a-f0-9]{16}$/.test(run || ''))throw new Error('Use run-auth.php --browser');
if(!base?.startsWith('http://127.0.0.1:'))throw new Error('Catalog browser tests require isolated loopback server');
fs.mkdirSync('backend/storage/browser-'+run,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  for(const width of [1280,390]){
   const context=await browser.newContext({viewport:{width,height:900},geolocation:{latitude:-23.66145,longitude:-46.55402},permissions:['geolocation']});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/admin.html');await page.getByText('Entre na sua conta administradora para continuar.').waitFor();
   await page.goto(base+'/');await page.locator('.event-card').first().waitFor();
   const session=await (await context.request.get(base+'/api/v1/auth/me')).json();
   const login=await context.request.post(base+'/api/v1/auth/login',{data:{email:'catalog-'+run+'@nightout.invalid',password:process.env.NIGHTOUT_CATALOG_TEST_PASSWORD},headers:{'X-CSRF-Token':session.csrf}});
   assert.equal(login.status(),200);
   await page.reload();await page.locator('[data-account]').click();await page.getByRole('link',{name:'Administrar lugares'}).click();
   await page.locator('#new-place').click();
   await page.locator('[name=name]').fill('Browser fixture '+width);
   await page.locator('[name=address]').fill('Fixture address');await page.locator('[name=city]').fill('Santo André');
   await page.locator('[name=photo]').setInputFiles('assets/venues/supra-direito-fachada.webp');
   await page.locator('[name=published]').check();
   await page.locator('.hours-day').nth(1).locator('select').selectOption('open');
   await page.locator('.hours-day').nth(1).locator('input').nth(0).fill('18:00');
   await page.locator('.hours-day').nth(1).locator('input').nth(1).fill('02:00');
   await page.locator('#save-place').click();await page.getByText('Salvo e publicado.',{exact:false}).waitFor();
   await page.screenshot({path:'backend/storage/browser-'+run+'/catalog-admin-'+width+'.png',fullPage:true});
   assert(await page.locator('#photo-preview').evaluate(img=>img.complete&&img.naturalWidth>0));
   const publicPage=await context.newPage();await publicPage.goto(base+'/');await publicPage.getByRole('button',{name:'Browser fixture '+width,exact:true}).waitFor();
   await page.locator('[name=published]').uncheck();await page.locator('#save-place').click();await page.getByText('Salvo como oculto.',{exact:false}).waitFor();
   await publicPage.reload();await publicPage.locator('.event-card').first().waitFor();assert.equal(await publicPage.getByRole('button',{name:'Browser fixture '+width,exact:true}).count(),0);
   await context.route('**/api/v1/venues',route=>route.fulfill({status:503,contentType:'application/json',body:'{"message":"Unavailable"}'}));
   await publicPage.reload();await publicPage.getByRole('button',{name:'Tentar novamente',exact:true}).first().waitFor();assert.equal(await publicPage.locator('.event-card').count(),0);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
   await context.close();console.log('OK: catalog admin create, overnight hours, photo, publish/hide, public API and layout '+width+'px');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
