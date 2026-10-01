document.querySelector('#header').innerHTML = Header();
document.querySelector('#footer').innerHTML = Footer();
document.querySelector('#events-heading').innerHTML = SectionHeader('events-title','Encontre sua noite','A noite está só começando. Encontre o seu lugar.','<span class="section-label">DADOS DEMONSTRATIVOS</span>');
document.querySelector('#nearby-heading').innerHTML = SectionHeader('nearby-title','Perto de você','Encontre lugares na sua região.');
document.querySelector('#upcoming-heading').innerHTML = SectionHeader('upcoming-title','Próximos eventos','Já pode marcar na agenda. As próximas noites prometem.','<span class="section-label">10 — 11 OUTUBRO</span>');
document.querySelector('#artists-heading').innerHTML = SectionHeader('artists-title','Artistas em destaque','Quem dá o tom da noite. Entre no ritmo.');
document.querySelector('#upcoming-list').innerHTML = events.filter(e=>['tomorrow','weekend'].includes(e.day)).map(UpcomingRow).join('');
document.querySelector('#artist-grid').innerHTML = artists.map(ArtistCard).join('');
document.querySelector('#artist-filter').insertAdjacentHTML('beforeend',artists.map(a=>`<option>${a.name}</option>`).join(''));
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
document.querySelectorAll('main .section').forEach(section=>section.setAttribute('aria-labelledby',section.querySelector('h2').id));
const state = {quick:'today',category:'Todos',query:''};
const quickFilters = [['today','Hoje'],['tomorrow','Amanhã'],['weekend','Este fim de semana'],['near','Perto de mim'],['open','Aberto agora']];
const panel = document.querySelector('#filter-panel');
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const matchDate = (e,date) => date==='weekend'?['today','tomorrow','weekend'].includes(e.day):e.day===date;
function filterEvents(filters) {
  return events.filter(e=>{
    if(state.query && !normalize([e.name,e.venue,e.artist,e.district].join(' ')).includes(normalize(state.query))) return false;
    if(state.category!=='Todos' && e.category!==state.category) return false;
    if(['today','tomorrow','weekend'].includes(state.quick) && !matchDate(e,state.quick)) return false;
    if(state.quick==='near' && (distanceToEvent(e) === null || distanceToEvent(e)>5 || e.day==='past')) return false;
    if((state.quick==='open' || filters.open) && !isOpen(e)) return false;
    if(filters.date!=='all' && !matchDate(e,filters.date)) return false;
    if(filters.distance && filters.distance!=='all' && (distanceToEvent(e) === null || distanceToEvent(e)>Number(filters.distance))) return false;
    if(filters.price!=='all' && (e.price == null || e.price>Number(filters.price))) return false;
    if(filters.occupancy!=='all' && (e.occupancy == null || e.occupancy!==Number(filters.occupancy))) return false;
    if(filters.artist!=='all' && e.artist!==filters.artist) return false;
    return !filters.tickets || canBook(e);
  });
}
function render() {
  document.querySelector('#quick-filters').innerHTML=quickFilters.map(([id,label])=>`<button class="chip ${state.quick===id?'selected':''}" data-quick="${id}" ${id === 'near' && locationAccess.status !== 'granted' ? 'aria-disabled="true" title="Permita a localização na seção Perto de você"' : ''} aria-pressed="${state.quick===id}">${id === 'near' ? icon(locationAccess.status === 'granted' ? 'pin' : 'pinOff') : ''}${label}</button>`).join('');
  document.querySelector('#categories').innerHTML=['Todos','Festas','Bares','Shows','Música ao vivo'].map(c=>`<button class="category ${state.category===c?'selected':''}" data-category="${c}" aria-pressed="${state.category===c}">${c}</button>`).join('');
  const filters=Object.fromEntries(new FormData(panel));
  const result=filterEvents(filters);
  if(state.quick==='near') result.sort((a,b)=>distanceToEvent(a)-distanceToEvent(b));
  document.querySelector('#event-grid').innerHTML=result.length?result.map(EventCard).join(''):`<div class="empty-state">${icon('search')}<h3>Nenhum rolê por aqui. Ainda.</h3><p>Tente outro artista, região ou uma combinação diferente de filtros.</p><button class="primary" id="clear-all">Limpar busca e filtros</button></div>`;
  document.querySelector('#results-message').textContent=`${result.length} eventos encontrados`;
  const count=Object.values(filters).filter(v=>v!=='all').length;
  document.querySelector('#filter-count').textContent=count?`(${count})`:'';
}
function clearAll() { panel.reset(); state.quick=''; state.category='Todos'; state.query=''; document.querySelector('#search').value=''; render(); }
document.querySelector('#search-form').addEventListener('submit',e=>{e.preventDefault();state.query=document.querySelector('#search').value.trim();state.quick='';render();document.querySelector('#explorar').scrollIntoView({behavior:'smooth'});});
document.querySelector('#search').addEventListener('input',e=>{state.query=e.target.value.trim();if(state.query) state.quick='';render();});
document.querySelector('#filter-toggle').addEventListener('click',e=>{panel.hidden=!panel.hidden;e.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));});
panel.addEventListener('change',e=>{if(e.target.name==='date') state.quick='';render();});
panel.addEventListener('submit',e=>e.preventDefault());
panel.addEventListener('reset',()=>setTimeout(render,0));
function openDialog(dialog) {dialog.showModal();document.body.classList.add('dialog-open');}
document.addEventListener('click',e=>{
  if(e.target.closest('[data-location-request]')) requestLocation();
  const quick=e.target.closest('[data-quick]');
  if(quick && quick.dataset.quick === 'near' && locationAccess.status !== 'granted') { document.querySelector('#perto').scrollIntoView({behavior:'smooth'}); return; }
  if(quick){state.quick=state.quick===quick.dataset.quick?'':quick.dataset.quick;panel.elements.date.value='all';render();}
  const category=e.target.closest('[data-category]');
  if(category){state.category=category.dataset.category;render();}
  const event=e.target.closest('[data-event]');
  if(event){document.querySelector('#event-detail').innerHTML=EventDetail(events.find(item=>item.id===event.dataset.event));openDialog(document.querySelector('#event-dialog'));}
  if(e.target.closest('.dialog-close')) e.target.closest('dialog').close();
  if(e.target.closest('[data-account]')) openDialog(document.querySelector('#account-dialog'));
  if(e.target.closest('#back-explore')) document.querySelector('#account-dialog').close();
  if(e.target.closest('#clear-all')) clearAll();
  const artist=e.target.closest('[data-artist]');
  if(artist){clearAll();panel.elements.artist.value=artist.dataset.artist;panel.hidden=false;document.querySelector('#filter-toggle').setAttribute('aria-expanded','true');render();document.querySelector('#explorar').scrollIntoView({behavior:'smooth'});}
  if(e.target.closest('[data-book]')) document.querySelector('#booking-message').textContent='Você está em uma demonstração. A reserva e a compra de ingressos ainda não estão disponíveis; nenhum valor será cobrado.';
});
document.querySelectorAll('dialog').forEach(dialog=>{dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close();}});});
document.querySelectorAll('header nav a').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('header nav a').forEach(a=>a.classList.remove('active'));link.classList.add('active');}));
render();

locationAccess.onChange = renderLocation;
renderLocation();
initializeLocation();
