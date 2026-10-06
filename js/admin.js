const admin = {records:[],csrf:'',selected:null,busy:false,dirty:false};
const form = document.querySelector('#place-form');
const message = document.querySelector('#admin-message');
const saveMessage = document.querySelector('#save-message');
const escapeAdmin = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const days = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const editableText = ['name','category','address','district','city','accessNote','mapsUrl','officialUrl','channelLabel','scheduleNote','imageSource'];

async function adminRequest(path, data) {
  const isFile = data instanceof FormData;
  let response;
  try { response = await fetch(path,{method:data===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',
    headers:data===undefined?{}:isFile?{'X-CSRF-Token':admin.csrf}:{'Content-Type':'application/json','X-CSRF-Token':admin.csrf},
    body:data===undefined?undefined:isFile?data:JSON.stringify(data)}); }
  catch { throw new Error('Não foi possível acessar o servidor. Suas alterações continuam no formulário.'); }
  const result = await response.json();
  if (!response.ok) {
    if (response.status===401 || response.status===403) { document.querySelector('#admin-access').hidden=false; document.querySelector('#save-place').disabled=true; }
    const error=new Error(result.message || 'Não foi possível concluir.'); error.status=response.status; throw error;
  }
  return result;
}

function renderAdminList() {
  const query=document.querySelector('#admin-search').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const filtered=admin.records.filter(r=>[r.venue.name,r.venue.city,r.venue.address].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query));
  document.querySelector('#admin-count').textContent=`${admin.records.filter(r=>r.published).length} publicados · ${admin.records.filter(r=>!r.published).length} ocultos`;
  document.querySelector('#admin-list').innerHTML=filtered.length?filtered.map(r=>`<button type="button" class="admin-place" data-place="${escapeAdmin(r.venue.id)}" aria-pressed="${admin.selected?.venue.id===r.venue.id}"><strong>${escapeAdmin(r.venue.name)}</strong><small>${r.published?'Publicado':'Oculto'} · ${escapeAdmin(r.venue.city)}</small></button>`).join(''):'<p>Nenhum lugar encontrado.</p>';
}

function intervalHtml(interval=['18:00','23:00']) {
  return `<div class="hours-interval"><input type="time" aria-label="Abertura" value="${escapeAdmin(interval[0])}" required><span>até</span><input type="time" aria-label="Fechamento" value="${escapeAdmin(interval[1])}" required><button type="button" class="hours-remove" aria-label="Remover intervalo">×</button></div>`;
}
function renderHours(hours) {
  document.querySelector('#hours-editor').innerHTML=days.map((day,i)=>{
    const intervals=hours?.[i]; const status=intervals==null?'unknown':intervals.length?'open':'closed';
    return `<div class="hours-day" data-day="${i}"><strong>${day}</strong><select aria-label="Funcionamento de ${day}" data-hours-status><option value="unknown" ${status==='unknown'?'selected':''}>Sem informação</option><option value="closed" ${status==='closed'?'selected':''}>Fechado</option><option value="open" ${status==='open'?'selected':''}>Informar horários</option></select><div data-day-intervals ${status!=='open'?'hidden':''}><div data-interval-list>${(intervals?.length?intervals:[['18:00','23:00']]).map(intervalHtml).join('')}</div><button class="hours-add" type="button">Adicionar intervalo</button></div></div>`;
  }).join('');
  updateHourRequired();
}
function updateHourRequired() {
  document.querySelectorAll('.hours-day').forEach(day=>{
    const open=day.querySelector('[data-hours-status]').value==='open';
    day.querySelector('[data-day-intervals]').hidden=!open;
    day.querySelectorAll('input[type=time]').forEach(input=>{input.disabled=!open;input.required=open;});
  });
}
function readHours() {
  const week=Array.from(document.querySelectorAll('.hours-day'),day=>{
    const status=day.querySelector('[data-hours-status]').value;
    return status==='unknown'?null:status==='closed'?[]:Array.from(day.querySelectorAll('.hours-interval'),row=>Array.from(row.querySelectorAll('input'),i=>i.value));
  });
  return week.every(day=>day===null)?null:week;
}
function canLeave() { return !admin.dirty || window.confirm('Descartar as alterações que ainda não foram salvas?'); }
function selectRecord(record) {
  admin.selected=record;
  form.reset();
  const venue=record.venue;
  editableText.forEach(key=>{form.elements[key].value=venue[key] || '';});
  form.elements.latitude.value=venue.coordinates?.latitude ?? '';
  form.elements.longitude.value=venue.coordinates?.longitude ?? '';
  form.elements.published.checked=record.published;
  form.elements.appointmentOnly.checked=Boolean(venue.appointmentHours);
  renderHours(venue.appointmentHours || venue.weeklyHours);
  const preview=document.querySelector('#photo-preview'); preview.hidden=!venue.image; preview.src=venue.image || '';
  document.querySelector('#editor-title').textContent=venue.id?venue.name:'Adicionar lugar';
  form.hidden=false; saveMessage.textContent=''; admin.dirty=false;
  renderAdminList();
}
async function loadAdmin(preserveSelection=false) {
  try {
    const session=await adminRequest('/api/v1/auth/me');
    if (!session.user) throw new Error('Entre na sua conta administradora para continuar.');
    const result=await adminRequest('/api/v1/admin/venues');
    admin.records=result.records;admin.csrf=result.csrf;
    document.querySelector('#admin-workspace').hidden=false;document.querySelector('#new-place').hidden=false;
    document.querySelector('#admin-access').hidden=true;document.querySelector('#save-place').disabled=false;
    message.textContent=`Conectado como ${session.user.name}.`;
    renderAdminList();
    if (!preserveSelection && admin.selected?.venue.id) {
      const fresh=admin.records.find(r=>r.venue.id===admin.selected.venue.id); if(fresh)selectRecord(fresh);
    }
  } catch(error) {message.textContent=error.message;document.querySelector('#admin-access').hidden=false;}
}
document.querySelector('#admin-search').addEventListener('input',renderAdminList);
document.querySelector('#retry-access').addEventListener('click',()=>void loadAdmin(true));
document.querySelector('#new-place').addEventListener('click',()=>{
  if(admin.busy || !canLeave())return;
  selectRecord({venue:{category:'Bares',city:'',name:'',weeklyHours:null},published:false,revision:0});
  form.elements.name.focus();
});
document.querySelector('#reload-place').addEventListener('click',()=>{
  if(admin.busy || !canLeave())return;
  if(!admin.selected?.venue.id) { selectRecord({venue:{category:'Bares',weeklyHours:null},published:false,revision:0});return; }
  void loadAdmin();
});
document.addEventListener('click',event=>{
  const item=event.target.closest('[data-place]');
  if(item && !admin.busy && canLeave())selectRecord(admin.records.find(r=>r.venue.id===item.dataset.place));
  const add=event.target.closest('.hours-add');
  if(add){const list=add.parentElement.querySelector('[data-interval-list]'); if(list.children.length<4){list.insertAdjacentHTML('beforeend',intervalHtml());admin.dirty=true;}}
  const remove=event.target.closest('.hours-remove');
  if(remove){const row=remove.closest('.hours-interval');if(row.parentElement.children.length>1){row.remove();admin.dirty=true;}}
});
form.addEventListener('input',()=>{admin.dirty=true;});
form.addEventListener('change',()=>{admin.dirty=true;updateHourRequired();});
window.addEventListener('beforeunload',event=>{if(admin.dirty){event.preventDefault();event.returnValue='';}});
form.addEventListener('submit',async event=>{
  event.preventDefault();if(admin.busy)return;
  const lat=form.elements.latitude.value, lng=form.elements.longitude.value;
  if(Boolean(lat)!==Boolean(lng)){saveMessage.textContent='Informe latitude e longitude juntas, ou deixe ambas vazias.';return;}
  const input=Object.fromEntries(editableText.map(key=>[key,form.elements[key].value]));
  input.id=admin.selected.venue.id || '';input.revision=admin.selected.revision;
  input.published=form.elements.published.checked;
  input.coordinates=lat!==''?{latitude:Number(lat),longitude:Number(lng)}:null;
  const hours=readHours();input.weeklyHours=form.elements.appointmentOnly.checked?null:hours;
  input.appointmentHours=form.elements.appointmentOnly.checked?hours:null;
  input.removePhoto=form.elements.removePhoto.checked;
  const photo=form.elements.photo.files[0];
  if(photo && input.removePhoto){saveMessage.textContent='Escolha entre enviar uma foto ou remover a atual.';return;}
  if(photo && photo.size>5*1024*1024){saveMessage.textContent='A foto deve ter até 5 MB.';return;}
  admin.busy=true;form.querySelectorAll('button').forEach(b=>b.disabled=true);saveMessage.textContent='Salvando…';
  try {
    if(photo){const data=new FormData();data.append('photo',photo);input.photo=await adminRequest('/api/v1/admin/venues/photo',data);}
    const result=await adminRequest('/api/v1/admin/venues',input);
    const index=admin.records.findIndex(r=>r.venue.id===result.record.venue.id);
    if(index<0)admin.records.push(result.record);else admin.records[index]=result.record;
    selectRecord(result.record);
    saveMessage.textContent=input.published?'Salvo e publicado. O site recebe a atualização ao recarregar ou em até um minuto.':'Salvo como oculto. O lugar não aparece no catálogo público.';
  } catch(error) {saveMessage.textContent=error.message;}
  finally{admin.busy=false;form.querySelectorAll('button').forEach(b=>b.disabled=false);}
});
void loadAdmin();
