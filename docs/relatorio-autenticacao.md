# Relatório de autenticação — 04/10/2026

## Concluído para desenvolvimento local

- Cadastro, login, logout e recuperação de senha revisados.
- Confirmação de e-mail com link de uso único, válido por 24 horas, e reenvio limitado.
- Configurações da conta: editar nome; trocar e-mail após confirmar o novo endereço; alterar senha com a senha atual.
- Sair de todos os dispositivos; mudanças de senha e e-mail revogam sessões anteriores.
- Exportação do perfil em JSON, sem senha, hash ou tokens.
- Exclusão da própria conta com senha atual e confirmação EXCLUIR; remove tokens relacionados e mensagens locais da conta.
- Ações sensíveis exigem autenticação, CSRF e senha atual. O servidor determina o usuário pela sessão, nunca por um ID enviado pelo formulário.
- Senhas com mínimo de oito caracteres, hash no servidor e limite técnico de 72 bytes.
- Links de recuperação válidos por 30 minutos, uso único e armazenamento somente do hash no banco.
- Recuperar a senha não remove o bloqueio de tentativas de login. A interface mostra o tempo real restante.
- Sessão expirada e sincronização entre abas mantidas; dados não são enviados pelos sinais entre abas.
- Correção da quebra de texto que causava rolagem horizontal em telas pequenas.
- E-mails de confirmação e recuperação usam a mesma caixa local privada.

A migration 003 foi aplicada sem apagar contas existentes. Contas existentes começam com e-mail não confirmado; podem entrar e solicitar confirmação. A confirmação não é obrigatória para o login nesta etapa. Existem funções de autorização para futuras rotas restritas e administrativas; não foi criado um painel de administração.

## Verificação realizada

- Suíte PHP de API em banco temporário: cadastro, validações, CSRF, limites, expiração, recuperação, verificação, alteração de dados, revogação, exportação e exclusão.
- 12 testes JavaScript de sessão, sincronização e localização aprovados.
- Edge automatizado, desktop 1280×900 e celular emulado 390×844: fluxo completo de cadastro até exclusão aprovado, sem erros JavaScript.
- Screenshots gerados em backend/storage/browser-<identificador>/; captura de recuperação móvel inspecionada.
- Testes não alteram senhas nem contadores de tentativas das contas reais. Criam banco, contas, servidor e caixa de mensagens separados.
- Celular emulado não substitui uma conferência futura em aparelho físico.

## Antes de publicar

O fluxo local está implementado; ainda não é uma implantação de produção.

- Integrar provedor real de e-mail e configurar domínio remetente. Nenhum e-mail externo foi enviado.
- Configurar domínio HTTPS, servidor de produção, credenciais privadas e origem NIGHTOUT_APP_URL.
- Revisar limites para a infraestrutura de proxy e redes compartilhadas.
- Definir backup/restauração, retenção dos arquivos privados e política de privacidade. Não há rotina automática de backup nesta entrega.
- A caixa de mensagens local recusa uso com NIGHTOUT_ENV=production: deve ser substituída por transporte real antes de publicar.

MFA, login social, painel administrativo e catálogo de estabelecimentos são evoluções separadas, não incluídas nesta entrega.

## Navegação de conta atualizada

O header autenticado abre um menu por clique, sem overlay, com nome, Configurações da conta e Sair da conta. Escape e clique fora fecham o menu; mover o mouse não o fecha. As configurações ficam em `/conta.html`, com acesso direto protegido pelo estado da sessão e pelas validações da API. O link de confirmação inicia a verificação e mostra um modal simples de sucesso, sem encaminhar para configurações. Links inválidos/usados mostram erro, nunca sucesso. Login e recuperação continuam disponíveis; campos de conta são exibidos na página dedicada.
