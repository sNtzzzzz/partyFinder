const isAccountPage = document.body.hasAttribute('data-settings-page');
if (isAccountPage) {
  document.querySelector('#header').innerHTML = Header();
  document.querySelectorAll('#header a').forEach(link => { link.href = '/' + link.getAttribute('href'); link.classList.remove('active'); });
}
const headerAccountButton = document.querySelector('[data-account]');
const accountDropdown = document.createElement('div');
accountDropdown.id = 'account-dropdown';
accountDropdown.className = 'account-dropdown';
accountDropdown.hidden = true;
headerAccountButton.parentElement.classList.add('account-anchor');
headerAccountButton.after(accountDropdown);
headerAccountButton.setAttribute('aria-controls', 'account-dropdown');
headerAccountButton.setAttribute('aria-expanded', 'false');
function closeAccountMenu(restoreFocus = false) {
  accountDropdown.hidden = true;
  headerAccountButton.setAttribute('aria-expanded', 'false');
  if (restoreFocus) headerAccountButton.focus();
}
function refreshAccountMenu() {
  if (!account.user) { closeAccountMenu(); accountDropdown.innerHTML = ''; return; }
  accountDropdown.innerHTML = '<strong>' + escapeAccount(account.user.name) + '</strong>' + (account.user.role === 'admin' ? '<a href="/admin.html">Administrar lugares</a>' : '') + '<a href="/conta.html">Configurações da conta</a><button type="button" data-menu-logout class="logoutButtonIndex">Sair da conta</button><p data-menu-message role="status"></p>';
}
document.addEventListener('click', async event => {
  if (event.target.closest('[data-account]')) {
    if (account.user) {
      accountDropdown.hidden = !accountDropdown.hidden;
      headerAccountButton.setAttribute('aria-expanded', String(!accountDropdown.hidden));
    } else if (isAccountPage) {
      account.mode = 'login'; renderAccount(); accountContent.querySelector('input')?.focus();
    } else {
      account.mode = 'login'; renderAccount(); openDialog(document.querySelector('#account-dialog'));
    }
    return;
  }
  const logout = event.target.closest('[data-menu-logout]');
  if (logout && !account.busy) {
    account.busy = true; ++accountRevision; logout.disabled = true;
    try {
      await logoutAccount();
      ++accountRevision; account.mode = 'login'; applySession({ user: null });
      renderAccount(); announceAccountChange(); closeAccountMenu(true);
    } catch (error) {
      accountDropdown.querySelector('[data-menu-message]').textContent = error.message;
    } finally { logout.disabled = false; finishAccountOperation(); }
  }
  if (!event.target.closest('.account-anchor')) closeAccountMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !accountDropdown.hidden) { event.preventDefault(); closeAccountMenu(true); }
});
document.addEventListener('focusin', event => {
  if (!event.target.closest('.account-anchor')) closeAccountMenu();
});
