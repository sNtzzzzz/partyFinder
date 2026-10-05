const currentPasswordField = '<label>Senha atual<input name="currentPassword" type="password" autocomplete="current-password" required maxlength="72"></label>';
const accountBack = '<button type="button" class="auth-switch" data-account-view="settings">Voltar para configurações</button>';

function renderAccountSettings() {
  if (['verify', 'verified'].includes(account.mode)) {
    accountContent.innerHTML = `<h2 id="account-title">${account.mode === 'verified' ? 'Sua conta foi verificada!' : 'Verificando seu e-mail…'}</h2><p id="auth-message" role="status" aria-live="polite"></p><button type="button" class="primary account-ok" id="account-ok">Ok</button>`;
    return;
  }
  if (!account.user) { account.mode = 'login'; renderAccount(); return; }
  if (account.mode === 'settings') {
    accountContent.innerHTML = `<span class="eyebrow">SUA CONTA</span><h2 id="account-title">Configurações</h2><p class="account-email">${escapeAccount(account.user.email)}</p><p class="verification-status">${account.user.emailVerified ? 'E-mail confirmado' : 'E-mail ainda não confirmado'}</p>${!account.user.emailVerified ? '<button class="auth-switch" type="button" data-resend-verification>Reenviar confirmação</button>' : ''}<div class="account-menu"><button data-account-view="profile">Editar nome</button><button data-account-view="email">Alterar e-mail</button><button data-account-view="password">Alterar senha</button><button data-account-view="sessions">Sair de todos os dispositivos</button><button data-account-view="export">Baixar meus dados</button><button class="danger-link" data-account-view="delete">Excluir minha conta</button></div><a class="auth-switch" href="/">Voltar para explorar</a><p id="auth-message" role="status" aria-live="polite"></p>`;
    return;
  }
  const views = {
    profile: { title: 'Como quer ser chamado?', action: 'update-profile', description: 'Esse nome aparece no seu perfil.', fields: `<label>Nome<input name="name" autocomplete="name" required minlength="2" maxlength="100" value="${escapeAccount(account.user.name)}"></label>`, button: 'Salvar nome' },
    email: { title: 'Alterar e-mail', action: 'change-email', description: 'Seu endereço atual continua valendo até você confirmar o link no novo e-mail. Depois, será necessário entrar novamente.', fields: '<label>Novo e-mail<input name="email" type="email" autocomplete="email" required maxlength="254"></label>' + currentPasswordField, button: 'Enviar confirmação' },
    password: { title: 'Alterar senha', action: 'change-password', description: 'Após a troca, todos os dispositivos serão desconectados.', fields: currentPasswordField + '<label>Nova senha<input name="password" type="password" autocomplete="new-password" required minlength="8" maxlength="72"></label><small>Use pelo menos 8 caracteres</small><label>Confirme a nova senha<input name="confirmation" type="password" autocomplete="new-password" required minlength="8" maxlength="72"></label>', button: 'Salvar nova senha' },
    sessions: { title: 'Sair de todos os dispositivos', action: 'logout-all', description: 'Encerra todas as sessões, inclusive esta. Confirme com sua senha atual.', fields: currentPasswordField, button: 'Encerrar todas as sessões' },
    export: { title: 'Seus dados, com você', action: 'export-data', description: 'Baixe seu nome, e-mail e datas do cadastro em um arquivo JSON. Senhas e tokens não fazem parte do arquivo.', fields: currentPasswordField, button: 'Baixar meus dados' },
    delete: { title: 'Excluir minha conta', action: 'delete-account', description: 'Esta ação é definitiva. Seu cadastro e os links de acesso serão removidos, e todos os dispositivos serão desconectados. Você pode baixar seus dados antes de continuar.', fields: currentPasswordField + '<label>Digite EXCLUIR para confirmar<input name="confirmation" autocomplete="off" required pattern="EXCLUIR"></label>', button: 'Excluir definitivamente' }
  };
  const view = views[account.mode];
  accountContent.innerHTML = `<span class="eyebrow">SUA CONTA</span><h2 id="account-title">${view.title}</h2><p>${view.description}</p><form id="settings-form" class="auth-form" data-action="${view.action}">${view.fields}<button class="primary" type="submit">${view.button}</button><p id="auth-message" role="status" aria-live="polite"></p></form>${accountBack}`;
  installPasswordToggles();
}

document.addEventListener('click', async event => {
  if (account.busy) return;
  const view = event.target.closest('[data-account-view]');
  if (view) {
    account.mode = view.dataset.accountView;
    renderAccount();
    accountContent.querySelector('input, button')?.focus();
  }
  if (event.target.closest('[data-account-home]')) {
    account.mode = 'login';
    renderAccount();
  }
  const resend = event.target.closest('[data-resend-verification]');
  if (resend) {
    account.busy = true;
    ++accountRevision;
    resend.disabled = true;
    accountMessage('Enviando…');
    try {
      account.csrf = (await authRequest('me')).csrf;
      const result = await authRequest('resend-verification', {});
      ++accountRevision;
      applySession(result);
      accountMessage(result.message);
    } catch (error) {
      if ([401, 403].includes(error.status)) await syncAccount(true);
      showAuthError(error);
    } finally {
      resend.disabled = false;
      finishAccountOperation();
    }
  }
});

document.addEventListener('submit', async event => {
  if (event.target.id !== 'settings-form') return;
  event.preventDefault();
  if (account.busy) return;
  const form = event.target;
  const action = form.dataset.action;
  const data = Object.fromEntries(new FormData(form));
  if (action === 'change-password') {
    if (data.password !== data.confirmation) { accountMessage('As senhas não coincidem.'); return; }
    if (!checkPasswordInput(data.password)) return;
    delete data.confirmation;
  }
  account.busy = true;
  ++accountRevision;
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  accountMessage('Aguarde…');
  try {
    account.csrf = (await authRequest('me')).csrf;
    const result = await authRequest(action, data);
    ++accountRevision;
    form.reset();
    if (action === 'export-data') {
      const url = URL.createObjectURL(new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url; link.download = 'nightout-meus-dados.json';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    account.mode = result.user ? 'settings' : 'login';
    applySession(result);
    renderAccount();
    accountMessage(result.message);
    announceAccountChange();
    accountContent.querySelector('input, button')?.focus();
  } catch (error) {
    if ([401, 403].includes(error.status)) await syncAccount(true);
    showAuthError(error);
  } finally {
    submit.disabled = false;
    finishAccountOperation();
  }
});

async function openVerificationLink() {
  const fragment = window.location.hash;
  if (!fragment.startsWith('#verify-email=')) return;
  const token = fragment.slice('#verify-email='.length);
  history.replaceState(null, '', window.location.pathname + window.location.search);
  if (account.busy) return;
  account.busy = true;
  ++accountRevision;
  account.mode = 'verify';
  renderAccount();
  const dialog = document.querySelector('#account-dialog');
  if (!dialog.open && !isAccountPage) openDialog(dialog);
  try {
    if (!/^[a-f0-9]{64}$/.test(token)) throw new Error('Link inválido. Solicite outra confirmação.');
    account.csrf = (await authRequest('me')).csrf;
    const result = await authRequest('verify-email', { token });
    ++accountRevision;
    account.mode = 'verified';
    applySession(result);
    renderAccount();
    if (!result.user) accountMessage(result.message);
    announceAccountChange();
  } catch (error) {
    document.querySelector('#account-title').textContent = 'Não foi possível verificar';
    showAuthError(error);
  } finally {
    finishAccountOperation();
    document.querySelector('#account-ok')?.focus();
  }
}
window.addEventListener('hashchange', openVerificationLink);
openVerificationLink();
