const icons = {
  pinOff:'<path d="m3 3 18 18M9 3.7A7 7 0 0 1 19 10c0 1.4-.6 2.9-1.4 4.3M6.2 6.2A7 7 0 0 0 5 10c0 5 7 11 7 11s1.8-1.5 3.6-3.8"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
  sliders:'<path d="M4 7h7m4 0h5M4 17h3m4 0h9"/><circle cx="13" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  music:'<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>'
};
const icon = name => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.arrow}</svg>`;
const money = price => price == null ? '—' : price === 0 ? 'Gratuito' : `R$ ${price}`;
const isOpen = (e, now = new Date()) => openingState(e, now) === true;
const canBook = e => e.tickets && !['Encerrado','Esgotado'].includes(e.status);
function Header() { return `<div class="container header-inner"><a class="logo" href="#" aria-label="NightOut, início">nightout<span>.</span></a><nav aria-label="Navegação principal"><a href="#explorar" class="active">Explorar</a><a href="#proximos">Eventos</a><a href="#perto">Perto de mim</a></nav><div class="header-right"><span class="city">${icon('pin')} ABC Paulista</span><button class="login" data-account>${icon('user')} Entrar</button></div></div>`; }
function SectionHeader(id,title,subtitle,extra='') { return `<div class="section-header"><div><h2 id="${id}">${title}</h2><p>${subtitle}</p></div>${extra}</div>`; }
function OccupancyIndicator(level) { return `<span class="occupancy"><span class="bars" aria-hidden="true">${[1,2,3,4].map(n=>`<i class="${n<=level?'filled':''}"></i>`).join('')}</span>${['Tranquilo','Movimento normal','Cheio','Lotado'][level-1] || 'Sem informação'}</span>`; }
function EventCard(e) { return PlaceCard(e); }
function NearbyCard(e) { return `<button class="nearby-card place-nearby" data-event="${escapeHtml(e.id)}"><span class="place-mini" aria-hidden="true">${icon("pin")}</span><span class="nearby-content"><span class="nearby-top">${distanceLabel(e)} <small>${escapeHtml(placeStatus(e))}</small></span><strong>${escapeHtml(e.name)}</strong><span>${escapeHtml(e.district)} · ${escapeHtml(e.city)}</span></span>${icon("arrow")}</button>`; }
function UpcomingRow(e) { return `<button class="upcoming-row" data-event="${e.id}"><span class="date-block"><small>${e.weekday}</small><strong>${e.date.split(' ')[0]}</strong><small>OUT</small></span><img src="${e.image}" alt="" loading="lazy"><span class="upcoming-name"><strong>${e.name}</strong><span>${e.venue} <span class="district-extra">· ${e.district}</span></span></span><span class="upcoming-artist">${e.artist}</span><span class="upcoming-price">${money(e.price)}<small>${e.status==='Esgotado'?'Esgotado':'Ver evento'}</small></span>${icon('arrow')}</button>`; }
function ArtistCard(a) { const count=events.filter(e=>e.artist===a.name && e.day!=='past').length; return `<button class="artist-card" data-artist="${a.name}"><img src="${a.image}" alt="Fotografia musical ilustrativa" loading="lazy"><strong>${a.name}</strong><span>${count} ${count===1?'evento':'eventos'} na agenda</span></button>`; }
function EventDetail(e) { return PlaceDetail(e); }
function Footer() { return `<div class="footer-top"><a href="#" class="logo">nightout<span>.</span></a><span>A noite é sua. A cidade também.</span><a href="#explorar">Explore a cidade ${icon('arrow')}</a></div><div class="footer-bottom"><span>© 2026 NightOut</span><span>Feito para quem vive a cidade.</span><span>Locais pesquisados · horários sujeitos a alterações</span></div>`; }
