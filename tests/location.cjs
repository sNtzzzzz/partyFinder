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
  assert.match(app.node('#event-grid').innerHTML, /movement-bars/);
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
  assert.match(app.run('EventDetail(events[0])'), /Movimento habitual/);
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
  assert.equal(app.run("openingState(venues.find(v=>v.id==='supra-berno'), new Date('2026-10-11T04:30:00Z'))"), true);
  assert.equal(app.run("openingState(venues.find(v=>v.id==='supra-berno'), new Date('2026-10-11T08:00:00Z'))"), false);
  assert.equal(app.run("operatesOn(venues.find(v=>v.id==='supra-berno'), 'weekend')"), true);
  assert.equal(app.run("openingState({weeklyHours:null})"), null);
});

test('historical popular times are separate from live occupancy and escape source values', () => {
  const app = setup();
  assert.match(app.run('PeakTimes({popularTimes:null})'), /indisponíveis/);
  const html = app.run("PeakTimes({popularTimes:{sourceUrl:'https://www.google.com/maps',checkedAt:'2026-10-05',days:[{day:6,hours:[{hour:22,relativePopularity:80}]}]}})");
  assert.match(html, /Sábado/);
  assert.match(html, /22h: 80%/);
  assert.match(html, /Não representa lotação em tempo real/);
  assert.equal(app.run("safeUrl('javascript:alert(1)')"), '#');
});

test('peak charts default to São Paulo weekday and keep invalid values out of markup', () => {
  const app = setup();
  const html=app.run("PeakTimes({popularTimes:{sourceUrl:'https://www.google.com/maps',checkedAt:'2026-10-05',days:[{day:localClock().day,hours:[{hour:18,relativePopularity:65},{hour:99,relativePopularity:10},{hour:20,relativePopularity:101}]},{day:(localClock().day+1)%7,hours:[]}]}})");
  assert.match(html, /\(hoje\)/);
  assert.match(html, /--peak-height:65%/);
  assert.doesNotMatch(html, /99h|--peak-height:101%/);
  assert.match(html, / hidden/);
  assert.match(html, /não exibe gráfico para este dia/);
  assert.doesNotMatch(html, /Fonte dos horários|Consulta:/);
});

test('office hours never imply an event is open and conditional Sundays remain unknown', () => {
  const app=setup();
  assert.equal(app.run("placeStatus(venues.find(v=>v.id==='ocean-drive'),new Date('2026-10-05T15:00:00Z'))"), '-');
  assert.match(app.run("PlaceDetail(venues.find(v=>v.id==='ocean-drive'))"), /Atendimento e visitas/);
  assert.equal(app.run("openingState(venues.find(v=>v.id==='a-gruta-rock-bar'),new Date('2026-10-11T18:00:00Z'))"), null);
  assert.equal(app.run("openingState(venues.find(v=>v.id==='mais-adega-principe'),new Date('2026-10-10T04:59:00Z'))"), true);
  assert.equal(app.run("openingState(venues.find(v=>v.id==='mais-adega-principe'),new Date('2026-10-10T05:00:00Z'))"), false);
});


test('card movement follows the current hour and the preceding overnight graph', () => {
  const app=setup();
  assert.equal(app.run("movementAt(venues.find(v=>v.id==='mais-adega-principe'),new Date('2026-10-06T00:00:00Z'))"),78);
  const html=app.run("MovementBars(venues.find(v=>v.id==='mais-adega-principe'),new Date('2026-10-06T00:00:00Z'))");
  assert.equal((html.match(/class="is-filled"/g)||[]).length,4);
  assert.match(html,/Lotado/);
  assert.equal(app.run("movementAt({weeklyHours:[null,null,null,null,null,null,[['20:00','03:00']]],popularTimes:{sourceUrl:'https://www.google.com/maps',checkedAt:'2026-10-05',days:[{day:6,hours:[{hour:23,relativePopularity:70},{hour:0,relativePopularity:80},{hour:1,relativePopularity:90}]},{day:0,hours:[{hour:1,relativePopularity:10}]}]}},new Date('2026-10-11T04:30:00Z'))"),90);
  const unknown=app.run("MovementBars({popularTimes:null})");
  assert.doesNotMatch(unknown,/is-filled/);
  assert.match(unknown,/movement-unknown/);
  assert.doesNotMatch(app.run('PlaceDetail(events[0])'),/Movimento em tempo real: sem/);
});

test('catalog carousel resets after search and preserves position on refresh', () => {
  const app = setup();
  const grid=app.node('#event-grid');
  grid.clientWidth=800;grid.scrollWidth=4400;grid.scrollLeft=0;
  app.run('render()');
  assert.equal((grid.innerHTML.match(/class="event-card/g)||[]).length,app.run('venues.length'));
  assert.equal(app.node('#catalog-prev').disabled,true);
  assert.equal(app.node('#catalog-next').disabled,false);
  grid.scrollLeft=1600;app.run('render()');
  assert.equal(grid.scrollLeft,1600);
  grid.scrollLeft=3600;app.run('updateCatalogNavigation()');
  assert.equal(app.node('#catalog-next').disabled,true);
  grid.scrollWidth=800;
  app.run("state.query='mais adega'; render()");
  assert.equal(grid.scrollLeft,0);
  assert.equal((grid.innerHTML.match(/class="event-card/g)||[]).length,1);
  assert.equal(app.node('#catalog-next').hidden,true);
  assert.doesNotMatch(app.run("PlaceDetail(venues.find(v=>v.id==='mais-adega-principe'))"),/Referências|NaN|Fonte das coordenadas/);
  assert.equal(app.run("venues.some(v=>['supra-dom-pedro','adega-tonel'].includes(v.id))"),false);
});
