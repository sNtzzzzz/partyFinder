const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const safeUrl = value => { try { const url = new URL(value); return url.protocol === 'https:' ? escapeHtml(url.href) : '#'; } catch { return '#'; } };
const weekDays = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
function localClock(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now).map(p => [p.type, p.value]));
  return { day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(parts.weekday), minute: Number(parts.hour) * 60 + Number(parts.minute) };
}
const clockMinutes = text => { const [h,m] = text.split(':').map(Number); return h * 60 + m; };
function openingState(place, now = new Date()) {
  if (!place.weeklyHours) return null;
  const { day, minute } = localClock(now);
  const current = place.weeklyHours[day];
  const previous = place.weeklyHours[(day + 6) % 7];
  if (previous?.some(([start,end]) => clockMinutes(end) < clockMinutes(start) && minute < clockMinutes(end))) return true;
  if (current === null || current === undefined) return null;
  return current.some(([start,end]) => {
    const from = clockMinutes(start), to = clockMinutes(end);
    return to <= from ? minute >= from : minute >= from && minute < to;
  });
}
function placeStatus(place, now = new Date()) {
  const open = openingState(place, now);
  return open === null ? 'Consulte a casa' : open ? 'Aberto pelo horário' : 'Fechado pelo horário';
}
function operatesOn(place, filter, now = new Date()) {
  if (!place.weeklyHours) return false;
  const day = localClock(now).day;
  const days = filter === 'weekend' ? [6,0] : [(day + (filter === 'tomorrow' ? 1 : 0)) % 7];
  return days.some(d => place.weeklyHours[d]?.length > 0);
}
function hoursForDay(place, day = localClock().day) {
  if (!place.weeklyHours || place.weeklyHours[day] == null) return 'Horário não confirmado';
  return place.weeklyHours[day].length ? place.weeklyHours[day].map(([a,b]) => `${a} — ${b}`).join(' / ') : 'Fechado neste dia';
}
function PeakTimes(place) {
  // Históricos relativos (0–100) são separados de presença/lotação ao vivo.
  const peaks = place.popularTimes;
  if (!peaks?.sourceUrl || !peaks.checkedAt || !Array.isArray(peaks.days) || !peaks.days.length) return '<p>Horários de pico indisponíveis.</p>';
  const rows = peaks.days.filter(d => Number.isInteger(d.day) && d.day >= 0 && d.day <= 6).map(d => `<tr><th>${weekDays[d.day]}</th><td>${(d.hours || []).filter(h => Number.isInteger(h.hour) && h.hour >= 0 && h.hour <= 23 && Number.isFinite(h.relativePopularity) && h.relativePopularity >= 0 && h.relativePopularity <= 100).map(h => `${h.hour}h: ${h.relativePopularity}%`).join(' · ')}</td></tr>`).join('');
  return `<p>Movimento habitual relativo ao pico da semana. Não representa lotação em tempo real.</p><table class="hours-table">${rows}</table><a href="${safeUrl(peaks.sourceUrl)}" target="_blank" rel="noopener noreferrer">Fonte dos horários de pico</a><p>Consulta: ${escapeHtml(peaks.checkedAt)}</p>`;
}
function PlaceCard(e) {
  return `<article class="event-card place-card"><button class="card-image place-art ${e.image ? 'has-place-photo' : ''}" data-event="${escapeHtml(e.id)}" aria-label="Ver ${escapeHtml(e.name)}"><span class="place-symbol" aria-hidden="true">${icon('pin')}</span>${e.image ? `<img data-place-photo src="${escapeHtml(e.imageCard || e.image)}" alt="Foto de ${escapeHtml(e.name)}" loading="lazy" decoding="async">` : ''}<span class="badge">${escapeHtml(placeStatus(e))}</span><span class="image-category">${escapeHtml(e.category)}</span></button><div class="card-body"><div class="venue-line">${escapeHtml(e.city)}<span>${distanceLabel(e)}</span></div><h3><button data-event="${escapeHtml(e.id)}">${escapeHtml(e.name)}</button></h3><p class="card-location">${escapeHtml(e.district)}</p><div class="card-time">${icon('clock')} ${escapeHtml(hoursForDay(e))}</div><p class="place-address">${escapeHtml(e.address)}</p><div class="card-bottom"><span class="occupancy">Sem informação de movimento</span></div><button class="card-action" data-event="${escapeHtml(e.id)}">Ver estabelecimento ${icon('arrow')}</button></div></article>`;
}
function PlaceDetail(e) {
  const weekly = weekDays.map((name,day) => `<tr><th scope="row">${name}</th><td>${escapeHtml(hoursForDay(e, day))}</td></tr>`).join('');
  return `${e.image ? `<img class="detail-cover" decoding="async" data-place-photo src="${escapeHtml(e.image)}" alt="Foto de ${escapeHtml(e.name)}">` : ''}<div class="detail-content place-detail"><span class="eyebrow">${escapeHtml(e.category)} / ${escapeHtml(placeStatus(e))}</span><h2 id="detail-title">${escapeHtml(e.name)}</h2><p>${escapeHtml(e.district)} · ${escapeHtml(e.city)}</p><div class="detail-columns"><section><h3>Funcionamento habitual</h3><table class="hours-table"><tbody>${weekly}</tbody></table><p>${escapeHtml(e.scheduleNote)}</p><h3>Movimento</h3>${PeakTimes(e)}<p>Movimento em tempo real: sem informação.</p></section><section><h3>Endereço</h3><p>${escapeHtml(e.address)}</p><p>${Number.isFinite(e.referenceDistanceKm) ? e.referenceDistanceKm.toLocaleString('pt-BR',{maximumFractionDigits:1}) + ' km da Fundação Santo André, em linha reta.' : ''}</p><a class="map-placeholder" href="${safeUrl(e.mapsUrl)}" target="_blank" rel="noopener noreferrer">${icon('pin')}<strong>Abrir no Google Maps</strong><span>Ver localização e informações da casa</span></a></section></div><div class="detail-booking"><a class="primary" href="${safeUrl(e.officialUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(e.channelLabel || (e.id === 'supra-berno' ? 'Consultar programação' : 'Visitar site da casa'))} ${icon('arrow')}</a></div></div>`;
}
