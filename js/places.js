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
  return open === null ? '-' : open ? 'ABERTO' : 'FECHADO';
}
function operatesOn(place, filter, now = new Date()) {
  if (!place.weeklyHours) return false;
  const day = localClock(now).day;
  const days = filter === 'weekend' ? [6,0] : [(day + (filter === 'tomorrow' ? 1 : 0)) % 7];
  return days.some(d => place.weeklyHours[d]?.length > 0);
}
function hoursForDay(place, day = localClock().day) {
  if (place.appointmentHours && !place.weeklyHours) return 'Festas conforme programação';
  if (!place.weeklyHours || place.weeklyHours[day] == null) return 'Horário não confirmado';
  return place.weeklyHours[day].length ? place.weeklyHours[day].map(([a,b]) => `${a} — ${b}`).join(' / ') : 'Fechado neste dia';
}
function PeakTimes(place) {
  // Históricos relativos (0–100) são separados de presença/lotação ao vivo.
  const peaks = place.popularTimes;
  if (!peaks?.sourceUrl || !peaks.checkedAt || !Array.isArray(peaks.days) || !peaks.days.length) return '<p>Horários de pico indisponíveis.</p>';
  const days = peaks.days.filter(d => Number.isInteger(d.day) && d.day >= 0 && d.day <= 6);
  if (!days.length) return '<p>Horários de pico indisponíveis.</p>';
  const today = localClock().day;
  const selected = days.some(d => d.day === today) ? today : days[0].day;
  const panels = days.map(d => {
    const hours = (d.hours || []).filter(h => Number.isInteger(h.hour) && h.hour >= 0 && h.hour <= 23 && Number.isFinite(h.relativePopularity) && h.relativePopularity >= 0 && h.relativePopularity <= 100);
    const bars = hours.map(h => `<div class="peak-hour"><span class="peak-bar" role="img" aria-label="${h.hour}h: ${h.relativePopularity}% do pico habitual da semana" title="${h.hour}h: ${h.relativePopularity}% do pico habitual da semana" style="--peak-height:${h.relativePopularity}%"></span><span class="peak-hour-label" aria-hidden="true">${h.hour}h</span></div>`).join('');
    return `<div data-peak-day="${d.day}"${d.day === selected ? '' : ' hidden'}>${hours.length ? `<div class="peak-chart" role="group" aria-label="Movimento habitual: ${weekDays[d.day]}">${bars}</div>` : '<p>O Google não exibe gráfico para este dia.</p>'}</div>`;
  }).join('');
  return `<div class="peak-times"><label class="peak-day-label">Horários de pico <select data-peak-select>${days.map(d => `<option value="${d.day}"${d.day === selected ? ' selected' : ''}>${weekDays[d.day]}${d.day === today ? ' (hoje)' : ''}</option>`).join('')}</select></label>${panels}<p class="peak-explanation">Movimento habitual relativo ao pico da semana. Não representa lotação em tempo real.</p></div>`;
}
function movementAt(place, now = new Date()) {
  const peaks = place.popularTimes;
  if (!peaks?.sourceUrl || !peaks.checkedAt || !Array.isArray(peaks.days)) return null;
  if (openingState(place, now) === false) return 0;
  const {day, minute} = localClock(now);
  const hour = Math.floor(minute / 60);
  // Barras após a virada pertencem ao dia da saída, como no gráfico do Google.
  const previous = peaks.days.find(d => d.day === (day + 6) % 7)?.hours || [];
  const overnight = previous.find((h, index) => h.hour === hour && previous.slice(0, index).some(p => p.hour > h.hour));
  const current = peaks.days.find(d => d.day === day)?.hours || [];
  const sample = overnight || current.find((h, index) => h.hour === hour && !current.slice(0, index).some(p => p.hour > h.hour));
  return Number.isFinite(sample?.relativePopularity) && sample.relativePopularity >= 0 && sample.relativePopularity <= 100 ? sample.relativePopularity : null;
}
function MovementBars(place, now = new Date()) {
  const value = movementAt(place, now);
  const level = value === null || value === 0 ? 0 : Math.ceil(value / 25);
  const label = value === null ? 'Movimento: -' : ['Vazio', 'Pouca gente', 'Normal', 'Movimentado', 'Lotado'][level];
  const description = value === null ? 'Sem estimativa de movimento para este horário.' : openingState(place, now) === false ? 'Fechado pelo horário cadastrado.' : `${level} de 4 barras: movimento habitual neste horário, baseado no Google. Não é uma leitura em tempo real nem percentual de lotação.`;
  return `<span class="movement-indicator${value === null ? ' movement-unknown' : ''}" title="${escapeHtml(description)}"><span class="movement-bars" role="img" aria-label="${escapeHtml(description)}">${[1,2,3,4].map(n => `<i${n <= level ? ' class="is-filled"' : ''}></i>`).join('')}</span><span>${label}</span></span>`;
}
function PlaceCard(e) {
  const status = placeStatus(e);
  const statusClass = status === 'ABERTO' ? 'status-open' : status === 'FECHADO' ? 'status-closed' : 'status-unknown';
  return `<article class="event-card place-card"><button class="card-image place-art ${e.image ? 'has-place-photo' : ''}" data-event="${escapeHtml(e.id)}" aria-label="Ver ${escapeHtml(e.name)}"><span class="place-symbol" aria-hidden="true">${icon('pin')}</span>${e.image ? `<img data-place-photo src="${escapeHtml(e.imageCard || e.image)}" alt="Foto de ${escapeHtml(e.name)}" loading="lazy" decoding="async">` : ''}<span class="badge ${statusClass}">${escapeHtml(status)}</span><span class="image-category">${escapeHtml(e.category)}</span></button><div class="card-body"><div class="venue-line">${escapeHtml(e.city)}<span>${distanceLabel(e)}</span></div><h3><button data-event="${escapeHtml(e.id)}">${escapeHtml(e.name)}</button></h3><p class="card-location">${escapeHtml(e.district)}</p><div class="card-time">${icon('clock')} ${escapeHtml(hoursForDay(e))}</div><p class="place-address">${escapeHtml(e.address)}</p><div class="card-bottom">${MovementBars(e)}</div><button class="card-action" data-event="${escapeHtml(e.id)}">Ver estabelecimento ${icon('arrow')}</button></div></article>`;
}
function PlaceDetail(e) {
  const schedule = e.appointmentHours ? {...e, weeklyHours:e.appointmentHours} : e;
  const weekly = weekDays.map((name,day) => `<tr><th scope="row">${name}</th><td>${escapeHtml(hoursForDay(schedule, day))}</td></tr>`).join('');
  return `${e.image ? `<img class="detail-cover" decoding="async" data-place-photo src="${escapeHtml(e.image)}" alt="Foto de ${escapeHtml(e.name)}">` : ''}<div class="detail-content place-detail"><span class="eyebrow">${escapeHtml(e.category)} / ${escapeHtml(placeStatus(e))}</span><h2 id="detail-title">${escapeHtml(e.name)}</h2><p>${escapeHtml(e.district)} · ${escapeHtml(e.city)}</p><div class="detail-columns"><section><h3>${e.appointmentHours ? 'Atendimento e visitas' : 'Funcionamento habitual'}</h3><table class="hours-table"><tbody>${weekly}</tbody></table><p>${escapeHtml(e.scheduleNote)}</p><h3>Movimento</h3>${PeakTimes(e)}</section><section><h3>Endereço</h3><p>${escapeHtml(e.address)}</p><p>${Number.isFinite(e.referenceDistanceKm) ? e.referenceDistanceKm.toLocaleString('pt-BR',{maximumFractionDigits:1}) + ' km da Fundação Santo André, em linha reta.' : ''}</p><a class="map-placeholder" href="${safeUrl(e.mapsUrl)}" target="_blank" rel="noopener noreferrer">${icon('pin')}<strong>Abrir no Google Maps</strong><span>Ver localização e informações da casa</span></a></section></div><div class="detail-booking"><a class="primary" href="${safeUrl(e.officialUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(e.channelLabel || (e.id === 'supra-berno' ? 'Consultar programação' : 'Visitar site da casa'))} ${icon('arrow')}</a></div></div>`;
}
