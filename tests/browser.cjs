const { chromium } = require('../backend/storage/browser-tools/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.argv[2], run = process.argv[3];
if (!base?.startsWith('http://127.0.0.1:') || !/^[a-f0-9]{16}$/.test(run || '')) throw Error('Use isolated runner --browser');
const output = path.resolve('backend/storage/browser-' + run);
fs.mkdirSync(output, { recursive: true });
function mailLink(email, kind) {
  const directory = path.resolve('backend/storage/outbox-test-' + run);
  const mails = fs.readdirSync(directory).map(f => JSON.parse(fs.readFileSync(path.join(directory, f),'utf8')))
    .filter(m => m.to === email && m.kind === kind).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
  assert(mails.length, 'mail created');
  return mails.at(-1).url;
}
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  try {
    for (const [label, viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:390,height:844}]]) {
      const context = await browser.newContext({viewport, acceptDownloads:true});
      await context.route('https://**/*', route => route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      const email = label + '-' + run + '@nightout.invalid';
      const renamedEmail = 'new-' + email;
      const password = 'Browser-password-123!';
      const changed = 'Changed-password-123!';
      const recovered = 'Recovered-password-123!';
      async function waitText(selector, text) {
        await page.waitForFunction(({selector,text}) => document.querySelector(selector)?.textContent.includes(text), {selector,text});
      }
      async function openAccount() {
        if (!page.url().includes('/conta.html') && !await page.locator('#account-dialog').evaluate(el=>el.open)) await page.locator('[data-account]').click();
      }
      async function settings(view) {
        if (!page.url().includes('/conta.html')) {
          await page.locator('#account-dialog').evaluate(el=>el.close());
          await page.locator('[data-account]').click();
          assert(await page.locator('#account-dropdown').isVisible());
          await page.mouse.move(0, 0);
          assert(await page.locator('#account-dropdown').isVisible(), 'menu remains after mouse leaves');
          assert.equal(await page.locator('#account-dialog').evaluate(el=>el.open), false);
          assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('dialog-open')), false);
          await page.screenshot({path:path.join(output,label+'-menu.png')});
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('#account-dropdown').isVisible(),false,'Escape closes menu');
          await page.locator('[data-account]').click();
          await page.mouse.click(5, viewport.height - 5);
          assert.equal(await page.locator('#account-dropdown').isVisible(),false,'outside click closes menu');
          await page.locator('[data-account]').click();
          await page.locator('#account-dropdown a').click();
          await page.waitForURL('**/conta.html');
          await page.locator('[data-account-view="profile"]').waitFor();
          await page.screenshot({path:path.join(output,label+'-settings.png')});
        }
        if (!await page.locator('[data-account-view="' + view + '"]').count()) await page.locator('[data-account-view="settings"]').click();
        await page.locator('[data-account-view="' + view + '"]').click();
      }
      async function login(address,pw) {
        await openAccount();
        await page.locator('#auth-form input[name="email"]').fill(address);
        await page.locator('#auth-form input[name="password"]').fill(pw);
        await page.locator('#auth-form button[type="submit"]').click();
      }
      await page.goto(base);
      await page.locator('[data-account]').click();
      await page.locator('#account-switch').click();
      await page.locator('#auth-form input[name="name"]').fill('Browser User');
      await page.locator('#auth-form input[name="email"]').fill(email);
      await page.locator('#auth-form input[name="password"]').fill(password);
      await page.locator('[data-password-toggle="auth-password"]').click();
      assert.equal(await page.locator('#auth-password').getAttribute('type'),'text');
      await page.locator('#auth-form input[name="confirmation"]').fill(password);
      await page.locator('#auth-form button[type="submit"]').click();
      await page.locator('#account-ok').waitFor();
      assert(await page.locator('.verification-notice').isVisible());
      assert(!(await page.locator('.account-content').innerText()).includes(email), 'overview hides email');
      const second = await context.newPage();
      second.on('pageerror', error=>errors.push(error.message));
      await second.goto(mailLink(email,'verification'));
      await second.waitForFunction(()=>document.querySelector('#account-title')?.textContent.includes('Sua conta foi verificada'));
      assert.equal(await second.locator('#settings-form').count(),0,'verification has no settings form');
      await page.waitForFunction(()=>!document.querySelector('.verification-notice'));
      await second.screenshot({path:path.join(output,label+'-verified.png')});
      await second.goto(base + '/conta.html#verify-email=invalid');
      await second.waitForFunction(()=>document.querySelector('#account-title')?.textContent.includes('Não foi possível verificar'));
      await second.locator('#account-ok').click();
      await second.locator('[data-account-view="profile"]').waitFor();
      assert.equal(await second.locator('#account-dialog').evaluate(el=>el.open), false, 'account link stays in dedicated page');
      await second.goto(mailLink(email,'verification'));
      await second.waitForFunction(()=>document.querySelector('#account-title')?.textContent.includes('Não foi possível verificar'));
      await second.close();
      await settings('profile');
      await page.locator('#settings-form input[name="name"]').fill('Teste <NightOut>');
      await page.locator('#settings-form button[type="submit"]').click();
      await waitText('#auth-message','Nome atualizado');
      assert((await page.locator('[data-account]').innerText()).includes('Teste <NightOut>'));
      await settings('export');
      await page.locator('input[name="currentPassword"]').fill(password);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#settings-form button[type="submit"]').click();
      const download = await downloadPromise;
      const file = path.join(output,label+'-export.json');
      await download.saveAs(file);
      const exported = JSON.parse(fs.readFileSync(file,'utf8'));
      assert.equal(exported.email,email);
      assert(!('password_hash' in exported));
      await settings('email');
      await page.locator('input[name="email"]').fill(renamedEmail);
      await page.locator('input[name="currentPassword"]').fill(password);
      await page.locator('#settings-form button[type="submit"]').click();
      await waitText('#auth-message','Confirme o link');
      await page.goto(mailLink(renamedEmail,'verification'));
      await waitText('#auth-message','E-mail atualizado');
      await page.locator('#account-ok').click();
      await login(renamedEmail,password);
      await page.locator('#account-ok').waitFor();
      await settings('password');
      await page.locator('input[name="currentPassword"]').fill(password);
      await page.locator('input[name="password"]').fill(changed);
      await page.locator('input[name="confirmation"]').fill(changed);
      await page.locator('#settings-form button[type="submit"]').click();
      await waitText('#auth-message','Senha atualizada');
      await login(renamedEmail,password);
      await waitText('#auth-message','E-mail ou senha incorretos');
      await page.locator('[data-recovery-open]').click();
      await page.locator('#recovery-form input[name="email"]').fill(renamedEmail);
      await page.locator('#recovery-form button[type="submit"]').click();
      await waitText('#auth-message','Se este e-mail');
      const resetLink=mailLink(renamedEmail,'recovery');
      await page.goto(resetLink.replace('/#reset-password=', '/conta.html#reset-password='));
      assert.equal(await page.locator('#account-dialog').evaluate(el=>el.open), false, 'recovery on account page does not open empty dialog');
      await page.locator('#recovery-form input[name="password"]').fill(recovered);
      await page.locator('#recovery-form input[name="confirmation"]').fill(recovered);
      const bounds=await page.locator('.recovery-actions').evaluate(el=>{
        const [a,b]=el.children;
        const r=a.getBoundingClientRect(), s=b.getBoundingClientRect();
        return s.top>=r.bottom || s.left>=r.right+1;
      });
      assert(bounds,'recovery links do not overlap');
      await page.screenshot({path:path.join(output,label+'-reset.png')});

      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
      await page.screenshot({path:path.join(output,label+'-reset.png')});
      await page.locator('#recovery-form button[type="submit"]').click();
      await waitText('#auth-message','Senha atualizada');
      await login(renamedEmail,recovered);
      await page.locator('[data-account-view="delete"]').waitFor();
      const tab=await context.newPage();
      await tab.goto(base);
      await tab.waitForFunction(()=>document.querySelector('[data-account]')?.textContent.includes('Teste <NightOut>'));
      await settings('sessions');
      await page.locator('input[name="currentPassword"]').fill(recovered);
      await page.locator('#settings-form button[type="submit"]').click();
      await waitText('#auth-message','Todas as sessões');
      await tab.waitForFunction(()=>document.querySelector('[data-account]')?.textContent.includes('Entrar'));
      await tab.close();
      await login(renamedEmail,recovered);
      await page.locator('[data-account-view="delete"]').waitFor();
      await settings('delete');
      await page.screenshot({path:path.join(output,label+'-delete.png')});
      await page.locator('input[name="currentPassword"]').fill(recovered);
      await page.locator('input[name="confirmation"]').fill('EXCLUIR');
      await page.locator('#settings-form button[type="submit"]').click();
      await waitText('#auth-message','Sua conta foi excluída');
      await context.close();
      console.log('OK: '+label+' full registration, verification, profile, export, email, password, recovery, multi-tab, deletion');
    }
    assert.deepEqual(errors, [], 'no JS errors');
    console.log('OK: browser errors absent; screenshots in '+output);
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
