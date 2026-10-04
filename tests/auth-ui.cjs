const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup() {
  const pending = [], timers = [], listeners = {}, nodes = new Map();
  const element = selector => {
    if (!nodes.has(selector)) nodes.set(selector, {
      innerHTML: '', textContent: '', disabled: false,
      setAttribute() {}, focus() {}, close() {}, insertAdjacentHTML() {},
      querySelector: child => element(`${selector} ${child}`), querySelectorAll: () => [],
      addEventListener: (name, cb) => { listeners[`${selector}:${name}`] = cb; }
    });
    return nodes.get(selector);
  };
  const context = vm.createContext({
    document: { querySelector: element, visibilityState: 'visible', addEventListener: (name, cb) => { listeners[`document:${name}`] = cb; } },
    window: { addEventListener: (name, cb) => { listeners[`window:${name}`] = cb; } },
    BroadcastChannel: class { postMessage() {} addEventListener(name, cb) { listeners[`channel:${name}`] = cb; } },
    localStorage: { setItem() {} }, icon: () => '', TextEncoder,
    setTimeout: cb => { timers.push(cb); return timers.length; }, clearTimeout() {},
    fetch: (url, options) => new Promise(resolve => pending.push({ url, options, resolve }))
  });
  vm.runInContext(fs.readFileSync('js/auth.js', 'utf8'), context);
  const run = code => vm.runInContext(code, context);
  async function answer(index, body, status = 200) {
    pending[index].resolve({ ok: status < 400, status, json: async () => body });
    await new Promise(resolve => setImmediate(resolve));
  }
  return { run, pending, answer, listeners, element, timers };
}
const user = { id: 1, name: 'sNtzz', email: 'test@example.com' };
const session = { user, csrf: 'fresh', expiresAt: Math.floor(Date.now()/1000) + 7200 };

test('expired identity becomes login without reload; unchanged anonymous state preserves form', async () => {
  const app = setup();
  await app.answer(0, session);
  assert.match(app.element('[data-account]').innerHTML, /sNtzz/);
  app.listeners['window:focus']();
  await app.answer(1, { user: null, csrf: 'anonymous' });
  assert.equal(app.run('account.user'), null);
  assert.match(app.element('[data-account]').innerHTML, /Entrar/);
  assert.match(app.element('#auth-message').textContent, /encerrada/);
  app.element('#account-dialog .account-content').innerHTML = 'form in progress';
  app.listeners['window:focus']();
  await app.answer(2, { user: null, csrf: 'anonymous' });
  assert.equal(app.element('#account-dialog .account-content').innerHTML, 'form in progress');
});

test('old me response cannot overwrite a more recent login', async () => {
  const app = setup();
  app.run(`++accountRevision; applySession(${JSON.stringify(session)})`);
  await app.answer(0, { user: null, csrf: 'old' });
  assert.equal(app.run('account.user.name'), 'sNtzz');
  assert.equal(app.run('account.csrf'), 'fresh');
});

test('cross-tab notifications reconcile state and defer during mutations', async () => {
  const app = setup();
  await app.answer(0, session);
  app.run('account.busy = true');
  app.listeners['channel:message']();
  assert.equal(app.pending.length, 1);
  app.run('finishAccountOperation()');
  await app.answer(1, { user: null, csrf: 'new' });
  assert.equal(app.run('account.user'), null);
  app.listeners['window:storage']({ key: 'nightout-auth-change' });
  await app.answer(2, session);
  assert.equal(app.run('account.user.name'), 'sNtzz');
});

test('logout after expiry needs no page reload and no invalid POST', async () => {
  const app = setup();
  await app.answer(0, session);
  const logout = app.run('logoutAccount()');
  await app.answer(1, { user: null, csrf: 'new' });
  await logout;
  assert.equal(app.pending.length, 2);
});

test('logout retries once after concurrent CSRF change with fresh token', async () => {
  const app = setup();
  await app.answer(0, session);
  const logout = app.run('logoutAccount()');
  await app.answer(1, session);
  await app.answer(2, { message: 'changed' }, 403);
  await app.answer(3, { ...session, csrf: 'rotated' });
  assert.equal(app.pending[4].options.headers['X-CSRF-Token'], 'rotated');
  await app.answer(4, { user: null });
  await logout;
});

test('expiry timer clears identity even before network returns', async () => {
  const app = setup();
  await app.answer(0, session);
  app.timers[0]();
  assert.equal(app.run('account.user'), null);
  assert.match(app.element('[data-account]').innerHTML, /Entrar/);
  await app.answer(1, { user: null, csrf: 'new' });
});
