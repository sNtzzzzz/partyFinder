// O token fica somente na memória; o fragmento é removido da barra de endereço.
let recoveryToken = null;

function renderRecoveryForm() {
  const reset = account.mode === 'reset';
  accountContent.innerHTML = `<span class="eyebrow">SUA CONTA</span><h2 id="account-title">${reset ? 'Defina sua nova senha' : 'Esqueceu sua senha?'}</h2><p>${reset ? 'Escolha uma nova senha para voltar à sua noite.' : 'Informe seu e-mail para receber um link de recuperação.'}</p><form id="recovery-form" class="auth-form">${reset ? '<label>Nova senha<input name="password" type="password" autocomplete="new-password" required minlength="8" maxlength="72" aria-describedby="password-help"></label><small id="password-help">Use pelo menos 8 caracteres</small><label>Confirme sua senha<input name="confirmation" type="password" autocomplete="new-password" required minlength="8" maxlength="72"></label>' : '<label>E-mail<input name="email" type="email" autocomplete="email" required maxlength="254"></label>'}<button class="primary" type="submit">${reset ? 'Salvar nova senha' : 'Enviar link'}</button><p id="auth-message" role="status" aria-live="polite"></p></form><div class="recovery-actions"><button type="button" class="auth-switch" id="recovery-back">Voltar para entrar</button>${reset ? '<button type="button" class="auth-switch" data-recovery-open>Solicitar outro link</button>' : ''}</div>`;
  installPasswordToggles();
}

document.addEventListener('click', event => {
  if (account.busy) return;
  if (event.target.closest('[data-recovery-open]')) {
    recoveryToken = null;
    account.mode = 'forgot';
    renderAccount();
    accountContent.querySelector('input').focus();
  }
  if (event.target.closest('#recovery-back')) {
    recoveryToken = null;
    account.mode = 'login';
    renderAccount();
  }
});

document.addEventListener('submit', async event => {
  if (event.target.id !== 'recovery-form') return;
  event.preventDefault();
  if (account.busy) return;
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const reset = account.mode === 'reset';
  if (reset && (data.password !== data.confirmation || Array.from(data.password).length < 8 || new TextEncoder().encode(data.password).length > 72)) {
    accountMessage(data.password !== data.confirmation ? 'As senhas não coincidem.' : 'Use pelo menos 8 caracteres e uma senha que não seja muito longa.');
    return;
  }
  delete data.confirmation;
  if (reset) data.token = recoveryToken;
  account.busy = true;
  ++accountRevision;
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  accountMessage('Aguarde…');
  try {
    account.csrf = (await authRequest('me')).csrf;
    const result = await authRequest(reset ? 'reset-password' : 'forgot-password', data);
    ++accountRevision;
    form.reset();
    if (reset) {
      recoveryToken = null;
      account.mode = 'login';
      applySession(result);
      renderAccount();
      announceAccountChange();
    }
    accountMessage(result.message);
  } catch (error) {
    if (error.status === 403) await syncAccount(true);
    accountMessage(error.message);
  } finally {
    submit.disabled = false;
    finishAccountOperation();
  }
});

function openRecoveryLink() {
  const fragment = window.location.hash;
  if (!fragment.startsWith('#reset-password=')) return;
  recoveryToken = fragment.slice('#reset-password='.length);
  history.replaceState(null, '', window.location.pathname + window.location.search);
  if (!/^[a-f0-9]{64}$/.test(recoveryToken)) {
    recoveryToken = null;
    account.mode = 'forgot';
  } else {
    account.mode = 'reset';
  }
  renderAccount();
  const dialog = document.querySelector('#account-dialog');
  if (!dialog.open) openDialog(dialog);
  accountContent.querySelector('input').focus();
  if (!recoveryToken) accountMessage('Link inválido. Solicite uma nova recuperação.');
}
window.addEventListener('hashchange', openRecoveryLink);
openRecoveryLink();
