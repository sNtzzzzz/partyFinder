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
    URL,
    setInterval: () => 0,
    setTimeout: callback => callback()
  });
  for (const file of ['data', 'places', 'components', 'location', 'app']) vm.runInContext(fs.readFileSync(`js/${file}.js`, 'utf8'), context);
  return { context, pending, node, fields, run: code => vm.runInContext(code, context), permission, revoke: () => permissionChange() };
}

test('requests location on startup, locks proximity and keeps default search working', () => {
  const app = setup();
  assert.equal(app.pending.length, 1);
  assert.equal(app.run('locationAccess.status'), 'loading');
  assert.equal(app.fields.distance.disabled, true);
  assert.match(app.node('#event-grid').innerHTML, /Sem informação/);
  assert.doesNotMatch(app.node('#event-grid').innerHTML, /R\$|class="filled"|1,4 km/);
  app.run("state.query='adega'; state.quick=''; render()");
  assert.match(app.node('#event-grid').innerHTML, /Mais Adega Point Bar/);
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
  assert(app.run('distanceToEvent(events[0])') > 5);
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
  assert.match(app.run('EventDetail(events[0])'), /[Ss]em informação/);
  assert.doesNotMatch(app.run('EventDetail(events[0])'), /R\$|class="filled"/);
});

test('real coordinates produce nearby places at the Fundação without storing the position', () => {
  const app = setup();
  app.pending[0].success({coords:{latitude:-23.66145,longitude:-46.55402}});
  assert.match(app.node('#nearby-grid').innerHTML, /nearby-card/);
  app.run("state.quick='near'; render()");
  assert.equal(app.run("filterEvents({date:'all',distance:'all',price:'all',occupancy:'all',artist:'all'}).length"), app.run('venues.filter(v=>v.coordinates).length'));
  assert.doesNotMatch(app.node('#event-grid').innerHTML, /Vintage Culture|Subsolo Club/);
});

test('schedule uses São Paulo time, overnight intervals and exclusive closing boundaries', () => {
  const app = setup();
  assert.equal(app.run("openingState(venues.find(v=>v.id==='vede'), new Date('2026-10-11T04:30:00Z'))"), true);
  assert.equal(app.run("openingState(venues.find(v=>v.id==='vede'), new Date('2026-10-11T05:00:00Z'))"), false);
  assert.equal(app.run("openingState(events[0], new Date('2026-10-10T03:00:00Z'))"), false);
  assert.equal(app.run("openingState(venues.find(v=>v.id==='supra-berno'), new Date('2026-10-11T04:30:00Z'))"), null);
  assert.equal(app.run("operatesOn(venues.find(v=>v.id==='supra-berno'), 'weekend')"), false);
});

test('historical popular times are separate from live occupancy and escape source values', () => {
  const app = setup();
  assert.match(app.run('PeakTimes(events[0])'), /indisponíveis/);
  const html = app.run("PeakTimes({popularTimes:{sourceUrl:'https://www.google.com/maps',checkedAt:'2026-10-05',days:[{day:6,hours:[{hour:22,relativePopularity:80}]}]}})");
  assert.match(html, /Sábado/);
  assert.match(html, /22h: 80%/);
  assert.match(html, /Não representa lotação em tempo real/);
  assert.equal(app.run("safeUrl('javascript:alert(1)')"), '#');
});

test('catalog limit follows two rows, expands and resets on a new search', () => {
  const app = setup();
  app.run("window.getComputedStyle=()=>({gridTemplateColumns:'100px 100px'}); render()");
  assert.equal((app.node('#event-grid').innerHTML.match(/class="event-card/g)||[]).length,4);
  assert.equal(app.node('#show-more').hidden,false);
  app.run('state.visibleRows+=2; render()');
  assert.equal((app.node('#event-grid').innerHTML.match(/class="event-card/g)||[]).length,8);
  app.run("state.query='mais adega'; render()");
  assert.equal(app.run('state.visibleRows'),2);
  assert.equal(app.node('#show-more').hidden,true);
  assert.doesNotMatch(app.run("PlaceDetail(venues.find(v=>v.id==='mais-adega-principe'))"),/Referências|NaN|Fonte das coordenadas/);
  assert.equal(app.run("venues.some(v=>['supra-dom-pedro','adega-tonel'].includes(v.id))"),false);
});
