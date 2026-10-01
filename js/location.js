// Coordinates stay in memory. No storage or external request is made here.
const locationAccess = {
  status: 'idle',
  coordinates: null,
  requestId: 0,
  permission: null,
  onChange: () => {}
};

function updateLocation(status, coordinates = null) {
  locationAccess.status = status;
  locationAccess.coordinates = coordinates;
  locationAccess.onChange();
}

function requestLocation() {
  if (locationAccess.status === 'loading') return;
  if (!window.isSecureContext) {
    updateLocation('insecure');
    return;
  }
  if (!navigator.geolocation) {
    updateLocation('unsupported');
    return;
  }
  const requestId = ++locationAccess.requestId;
  updateLocation('loading');
  navigator.geolocation.getCurrentPosition(
    position => {
      if (requestId !== locationAccess.requestId) return;
      updateLocation('granted', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    error => {
      if (requestId !== locationAccess.requestId) return;
      updateLocation(error.code === 1 ? 'denied' : error.code === 3 ? 'timeout' : 'unavailable');
    },
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
  );
}

async function initializeLocation() {
  requestLocation();
  if (!navigator.permissions?.query) return;
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    locationAccess.permission = permission;
    permission.addEventListener('change', () => {
      ++locationAccess.requestId;
      if (permission.state === 'granted') {
        locationAccess.status = 'idle';
        requestLocation();
      } else {
        updateLocation(permission.state === 'denied' ? 'denied' : 'idle');
      }
    });
  } catch {
    // Safari and other browsers can still use getCurrentPosition directly.
  }
}

function distanceToEvent(event) {
  const origin = locationAccess.coordinates;
  const destination = event.coordinates;
  if (locationAccess.status !== 'granted' || !origin || !destination) return null;
  if (![destination.latitude, destination.longitude].every(Number.isFinite)) return null;
  const radians = value => value * Math.PI / 180;
  const latitudeDelta = radians(destination.latitude - origin.latitude);
  const longitudeDelta = radians(destination.longitude - origin.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(origin.latitude)) * Math.cos(radians(destination.latitude))
    * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}

function distanceLabel(event) {
  const distance = distanceToEvent(event);
  return distance === null ? '' : `${distance.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
}

function renderLocation() {
  const status = locationAccess.status;
  const granted = status === 'granted';
  const messages = {
    idle: ['Descubra o que está perto de você', 'Permita o acesso à localização para encontrar lugares na sua região. A busca por nome continua disponível.'],
    loading: ['Aguardando sua localização', 'Autorize o acesso na mensagem do navegador. Você pode continuar explorando enquanto isso.'],
    denied: ['Acesso à localização negado', 'Você pode continuar buscando normalmente. Se o navegador não perguntar novamente, abra as permissões deste site na barra de endereço, permita Localização e tente de novo.'],
    timeout: ['A localização demorou para responder', 'Verifique se a localização do dispositivo está ligada e tente novamente. A busca continua disponível.'],
    unavailable: ['Não foi possível obter sua localização', 'Verifique a localização do dispositivo e tente novamente. Você ainda pode pesquisar por nome.'],
    insecure: ['Localização indisponível nesta conexão', 'Abra o site em HTTPS ou pelo Live Server em localhost para permitir o acesso à localização.'],
    unsupported: ['Localização não disponível', 'Este navegador não oferece acesso à localização. Você pode continuar usando a busca.'],
    granted: ['Localização permitida', 'Ainda não há lugares com localização cadastrada para exibir aqui. Por enquanto, explore os exemplos pela busca.']
  };
  const [title, description] = messages[status];
  const nearby = granted ? events.filter(e => {
    const distance = distanceToEvent(e);
    return distance !== null && distance <= 5 && e.day !== 'past';
  }).sort((a, b) => distanceToEvent(a) - distanceToEvent(b)).slice(0, 3) : [];
  const retry = !['granted', 'insecure', 'unsupported'].includes(status);
  document.querySelector('#nearby-grid').innerHTML = nearby.length
    ? nearby.map(NearbyCard).join('')
    : `<div class="location-state" role="status">${icon(granted ? 'pin' : 'pinOff')}<div><h3>${title}</h3><p>${description}</p></div>${retry ? `<button class="primary" data-location-request ${status === 'loading' ? 'disabled' : ''}>${status === 'loading' ? 'Aguardando permissão…' : ['timeout', 'unavailable'].includes(status) ? 'Tentar novamente' : 'Permitir acesso'}</button>` : ''}</div>`;
  document.querySelector('.location-note').textContent = granted
    ? 'Localização disponível nesta sessão. Os lugares exibidos na busca ainda são demonstrativos.'
    : 'Sua localização é opcional. Continue explorando pela busca.';
  const nav = document.querySelector('header nav a[href="#perto"]');
  nav.innerHTML = `${icon(granted ? 'pin' : 'pinOff')} Perto de mim`;
  nav.classList.toggle('location-locked', !granted);
  nav.setAttribute('aria-label', granted ? 'Perto de mim, localização permitida' : 'Perto de mim, localização indisponível. Ver como permitir');
  document.querySelector('.city').innerHTML = `${icon(granted ? 'pin' : 'pinOff')} ${granted ? 'Localização ativada' : 'Localização desativada'}`;
  const distanceFilter = document.querySelector('[name="distance"]');
  distanceFilter.disabled = !granted;
  distanceFilter.title = granted ? '' : 'Permita a localização para filtrar por distância';
  if (!granted) {
    distanceFilter.value = 'all';
    if (state.quick === 'near') state.quick = '';
  }
  render();
}
