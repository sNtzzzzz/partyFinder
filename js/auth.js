// Interface e API usam a mesma origem. Nenhuma senha ou token de sessão no localStorage.
const account = { user: null, csrf: null, mode: 'login', busy: false };
let accountRevision = 0;
let sessionTimer;
let syncPending = false;
const accountChannel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('nightout-auth') : null;
const accountContent = document.querySelector('#account-dialog .account-content');
const escapeAccount = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

async function authRequest(action, data) {
  let response;
  try {
    response = await fetch(`/api/v1/auth/${action}`, {
      method: data === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: data === undefined ? {} : { 'Content-Type': 'application/json', 'X-CSRF-Token': account.csrf || '' },
      body: data === undefined ? undefined : JSON.stringify(data)
    });
  } catch {
    throw new Error('Não foi possível acessar a API. Confira se o servidor está ligado.');
  }
  let result;
  try { result = await response.json(); }
  catch { throw new Error('Para entrar, abra o NightOut em http://127.0.0.1:8000 com o servidor PHP ligado.'); }
  if (!response.ok) {
    const error = new Error(result.message || 'Não foi possível concluir. Tente novamente.');
    error.status = response.status;
    throw error;
  }
  return result;
}

function applySession(result) {
  const changed = JSON.stringify(account.user) !== JSON.stringify(result.user);
  const wasConnected = Boolean(account.user);
  account.user = result.user;
  account.csrf = result.csrf || null;
  clearTimeout(sessionTimer);
  if (account.user && result.expiresAt) {
    sessionTimer = setTimeout(() => {
      // Retirar o estado autenticado da tela mesmo se a rede estiver indisponível.
      if (account.busy) { syncPending = true; return; }
      ++accountRevision;
      applySession({ user: null });
      void syncAccount();
    }, Math.max(0, result.expiresAt * 1000 - Date.now()));
  }
  if (changed) {
    if (!account.user) account.mode = 'login';
    renderAccount();
    if (wasConnected && !account.user) accountMessage('Sua sessão foi encerrada. Entre novamente para continuar.');
  }
}

async function syncAccount(force = false) {
  if (account.busy && !force) { syncPending = true; ++accountRevision; return; }
  const revision = ++accountRevision;
  try {
    const result = await authRequest('me');
    if (revision !== accountRevision) return;
    applySession(result);
  } catch (error) {
    if (revision === accountRevision) accountMessage(error.message);
  }
}

function announceAccountChange() {
  accountChannel?.postMessage('changed');
  // Só um sinal, sem nome, senha, cookie ou token armazenado.
  try { localStorage.setItem('nightout-auth-change', `${Date.now()}-${Math.random()}`); } catch {}
}

function finishAccountOperation() {
  account.busy = false;
  if (syncPending) { syncPending = false; void syncAccount(); }
}

async function logoutAccount() {
  // Atualizar o CSRF também quando a sessão expirou ou mudou em outra aba.
  for (let attempt = 0; attempt < 2; attempt++) {
    const current = await authRequest('me');
    account.csrf = current.csrf;
    if (!current.user) return;
    try { await authRequest('logout', {}); return; }
    catch (error) { if (error.status !== 403 || attempt === 1) throw error; }
  }
}

function renderAccount() {
  const button = document.querySelector('[data-account]');
  button.innerHTML = `${icon('user')} <span>${account.user ? escapeAccount(account.user.name) : 'Entrar'}</span>`;
  button.setAttribute('aria-label', account.user ? `Abrir conta de ${account.user.name}` : 'Entrar');
  button.title = account.user ? account.user.name : 'Entrar';
  if (account.user) {
    accountContent.innerHTML = `<span class="eyebrow">Olá,</span><h2 id="account-title">${escapeAccount(account.user.name)}</h2><p>A noite começa agora.</p><div class="account-actions"><button class="primary" id="account-logout">Sair da conta</button><button class="primary account-ok" id="account-ok">Ok</button></div><p id="auth-message" role="status"></p>`;
    return;
  }
  const register = account.mode === 'register';
  accountContent.innerHTML = `<span class="eyebrow">SUA PRÓXIMA NOITE</span><h2 id="account-title">${register ? 'Crie sua conta' : 'Entre no NightOut'}</h2><p>${register ? 'Um lugar para suas próximas noites.' : 'Bom ter você por aqui.'}</p><form id="auth-form" class="auth-form">${register ? '<label>Nome<input name="name" autocomplete="name" required minlength="2" maxlength="100"></label>' : ''}<label>E-mail<input name="email" type="email" autocomplete="username" required maxlength="254"></label><label>Senha<input name="password" type="password" autocomplete="${register ? 'new-password' : 'current-password'}" required minlength="8" maxlength="72" aria-describedby="password-help"></label><small id="password-help">Use pelo menos 8 caracteres</small>${register ? '<label>Confirme sua senha<input name="confirmation" type="password" autocomplete="new-password" required minlength="8" maxlength="72"></label>' : ''}<button class="primary" type="submit">${register ? 'Criar conta' : 'Entrar'}</button><p id="auth-message" role="status" aria-live="polite"></p></form><button class="auth-switch" id="account-switch">${register ? 'Já tem uma conta? Entrar' : 'Ainda não tem uma conta? Cadastrar'}</button>`;
}

function accountMessage(message) {
  document.querySelector('#auth-message').textContent = message;
}

document.addEventListener('click', async event => {
  if (event.target.closest('[data-account]')) void syncAccount();
  if (event.target.closest('#account-ok')) {
    document.querySelector('#account-dialog').close();
  }
  if (event.target.closest('#account-switch') && !account.busy) {
    account.mode = account.mode === 'login' ? 'register' : 'login';
    renderAccount();
    accountContent.querySelector('input').focus();
  }
  if (event.target.closest('#account-logout') && !account.busy) {
    account.busy = true;
    ++accountRevision;
    clearTimeout(sessionTimer);
    event.target.closest('button').disabled = true;
    try {
      await logoutAccount();
      ++accountRevision;
      applySession({ user: null });
      announceAccountChange();
      accountMessage('Você saiu da conta.');
    } catch (error) {
      await syncAccount(true);
      accountMessage(error.message);
      const logoutButton = document.querySelector('#account-logout');
      if (logoutButton) logoutButton.disabled = false;
    } finally { finishAccountOperation(); }
  }
});

document.addEventListener('submit', async event => {
  if (event.target.id !== 'auth-form') return;
  event.preventDefault();
  if (account.busy) return;
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  if (account.mode === 'register' && data.password !== data.confirmation) {
    accountMessage('As senhas não coincidem.');
    return;
  }
  if (Array.from(data.password).length < 8) {
    accountMessage('Use pelo menos 8 caracteres');
    return;
  }
  if (new TextEncoder().encode(data.password).length > 72) {
    accountMessage('A senha ficou muito longa. Use uma senha mais curta.');
    return;
  }
  delete data.confirmation;
  account.busy = true;
  ++accountRevision;
  form.querySelector('button').disabled = true;
  accountMessage('Aguarde…');
  try {
    account.csrf = (await authRequest('me')).csrf;
    const result = await authRequest(account.mode, data);
    ++accountRevision;
    form.reset();
    applySession(result);
    announceAccountChange();
    document.querySelector('#account-ok').focus();
  } catch (error) {
    if (error.status === 403) await syncAccount(true);
    accountMessage(error.message);
    form.querySelector('button').disabled = false;
  } finally { finishAccountOperation(); }
});

document.querySelector('#account-dialog').addEventListener('close', () => {
  accountContent.querySelectorAll('input[type="password"]').forEach(input => input.value = '');
});
renderAccount();
accountChannel?.addEventListener('message', () => { void syncAccount(); });
window.addEventListener('storage', event => {
  if (event.key === 'nightout-auth-change') void syncAccount();
});
window.addEventListener('focus', () => { void syncAccount(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') void syncAccount();
});
void syncAccount();
