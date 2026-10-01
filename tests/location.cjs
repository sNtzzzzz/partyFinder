const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup({ secure = true, supported = true } = {}) {
  const nodes = new Map();
  const listeners = {};
  const pending = [];
  const fields = Object.fromEntries(['date', 'distance', 'price', 'occupancy', 'artist'].map(name => [name, { value: 'all', disabled: false }]));
  function node(selector) {
    if (selector === '[name="distance"]') return fields.distance;
    if (!nodes.has(selector)) nodes.set(selector, {
      innerHTML: '', textContent: '', value: '', hidden: true,
      elements: fields,
      classList: { toggle() {}, add() {}, remove() {} },
      setAttribute() {}, insertAdjacentHTML() {}, scrollIntoView() {},
      addEventListener(name, callback) { listeners[`${selector}:${name}`] = callback; },
      reset() { Object.values(fields).forEach(field => field.value = 'all'); }
    });
    return nodes.get(selector);
  }
  let permissionChange;
  const permission = { state: 'prompt', addEventListener(_, callback) { permissionChange = callback; } };
  const context = vm.createContext({
    window: { isSecureContext: secure },
    navigator: {
      geolocation: supported ? { getCurrentPosition(success, failure) { pending.push({ success, failure }); } } : undefined,
      permissions: { query: async () => permission }
    },
    document: { querySelector: node, querySelectorAll: () => [], addEventListener(name, cb) { listeners[name] = cb; } },
    FormData: class { constructor() { return Object.entries(fields).filter(([, field]) => !field.disabled).map(([name, field]) => [name, field.value]); } },
    setTimeout: callback => callback()
  });
  for (const file of ['data', 'components', 'location', 'app']) vm.runInContext(fs.readFileSync(`js/${file}.js`, 'utf8'), context);
  return { context, pending, node, fields, run: code => vm.runInContext(code, context), permission, revoke: () => permissionChange() };
}

test('requests location on startup, locks proximity and keeps default search working', () => {
  const app = setup();
  assert.equal(app.pending.length, 1);
  assert.equal(app.run('locationAccess.status'), 'loading');
  assert.equal(app.fields.distance.disabled, true);
  assert.match(app.node('#event-grid').innerHTML, /Sem informação/);
  assert.doesNotMatch(app.node('#event-grid').innerHTML, /R\$|class="filled"|1,4 km/);
  app.run("state.query='jazz'; state.quick=''; render()");
  assert.match(app.node('#event-grid').innerHTML, /Jazz à meia-luz/);
});

test('denial explains browser settings, retries, then unlocks without fake nearby results', () => {
  const app = setup();
  app.pending[0].failure({ code: 1 });
  assert.match(app.node('#nearby-grid').innerHTML, /Acesso à localização negado/);
  assert.match(app.node('#nearby-grid').innerHTML, /barra de endereço/);
  app.run('requestLocation()');
  app.pending[1].success({ coords: { latitude: -23.55, longitude: -46.63 } });
  assert.equal(app.fields.distance.disabled, false);
  assert.match(app.node('#nearby-grid').innerHTML, /Localização permitida/);
  assert.doesNotMatch(app.node('#nearby-grid').innerHTML, /nearby-card/);
  assert.equal(app.run('distanceToEvent(events[0])'), null);
  assert.equal(app.run('distanceToEvent({coordinates:{latitude:-23.55,longitude:-46.63}})'), 0);
});

test('revocation clears coordinates, resets distance and ignores stale success', async () => {
  const app = setup();
  await new Promise(resolve => setImmediate(resolve));
  app.permission.state = 'denied';
  app.revoke();
  app.pending[0].success({ coords: { latitude: 1, longitude: 1 } });
  assert.equal(app.run('locationAccess.status'), 'denied');
  assert.equal(app.run('locationAccess.coordinates'), null);
  assert.equal(app.fields.distance.disabled, true);
});

test('timeout and unavailable position keep retry available', () => {
  for (const code of [2, 3]) {
    const app = setup();
    app.pending[0].failure({ code });
    assert.match(app.node('#nearby-grid').innerHTML, /Tentar novamente/);
    assert.equal(app.fields.distance.disabled, true);
  }
});

test('insecure and unsupported contexts do not request location', () => {
  for (const options of [{ secure: false }, { supported: false }]) {
    const app = setup(options);
    assert.equal(app.pending.length, 0);
    assert.equal(app.fields.distance.disabled, true);
    assert.match(app.node('#event-grid').innerHTML, /event-card/);
  }
});

test('unknown prices are not free; unknown occupancy never matches numeric filters', () => {
  const app = setup();
  const defaults = "{date:'all',distance:'all',price:'all',occupancy:'all',artist:'all'}";
  assert.equal(app.run(`filterEvents({...${defaults},price:'0'}).length`), 0);
  assert.equal(app.run(`filterEvents({...${defaults},occupancy:'1'}).length`), 0);
  assert.equal(app.run('money(null)'), '—');
  assert.match(app.run('EventDetail(events[0])'), /Sem informação/);
  assert.doesNotMatch(app.run('EventDetail(events[0])'), /R\$|class="filled"/);
});
