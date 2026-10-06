let catalogRequestPending = false;
async function refreshCatalog() {
  if (catalogRequestPending) return;
  catalogRequestPending = true;
  try {
    const response = await fetch('/api/v1/venues', {credentials:'same-origin',cache:'no-store'});
    const result = await response.json();
    if (!response.ok || !Array.isArray(result.venues)) throw new Error('Catálogo indisponível');
    venues.splice(0, venues.length, ...result.venues);
    catalogReady = true;
    catalogError = '';
  } catch {
    catalogError = 'Não foi possível atualizar os lugares. Confira a conexão e tente novamente.';
  } finally {
    catalogRequestPending = false;
    render();
  }
}
document.addEventListener('click', event => {
  if (event.target.closest('[data-catalog-retry]')) void refreshCatalog();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') void refreshCatalog();
});
setInterval(() => { if (document.visibilityState === 'visible') void refreshCatalog(); },60000);
void refreshCatalog();
