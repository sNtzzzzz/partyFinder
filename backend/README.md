# API local do NightOut

API PHP conectada ao banco `nightout`, com cadastro, login e logout. A migration cria `users` e `auth_limits`, sem apagar registros existentes.

## Executar

1. Inicie MySQL no XAMPP e mantenha o banco `nightout` criado.
   Na primeira instalação, execute `C:\xampp\php\php.exe backend/database/migrate.php` na raiz do projeto. Essa migration já foi aplicada neste ambiente.
2. No terminal PowerShell do projeto, execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\start.ps1
```

3. Abra http://127.0.0.1:8000/ para usar o site e clique em **Entrar → Ainda não tenho conta. Cadastrar**. A verificação da conexão continua em http://127.0.0.1:8000/api/v1/health.

A resposta esperada contém `"status": "ok"` e `"database": "connected"`. Mantenha o terminal aberto; `Ctrl+C` encerra a API.

Este servidor usa o PHP instalado pelo XAMPP e seu MySQL/MariaDB. Não precisa mover o projeto para `htdocs` nem alterar o Apache. O servidor PHP é exclusivo para desenvolvimento local. O router serve a interface e a API na mesma origem, sem CORS. Somente o HTML e os arquivos JS/CSS públicos são permitidos; banco, configuração, testes e Git não são expostos. Use sempre o mesmo endereço (`127.0.0.1`) durante o teste.

Se o servidor já estava aberto antes da atualização do router, encerre com `Ctrl+C` e execute novamente o comando.

## Configuração

Os padrões locais estão em `config/database.example.php`: host `127.0.0.1`, porta `3306`, banco `nightout`, usuário `root`, senha vazia. Essa é uma hipótese para uma instalação local padrão, não uma configuração de produção.

Se a sua instalação for diferente, copie o arquivo para `config/local.php` e ajuste. O arquivo local é ignorado pelo Git. Não coloque credenciais no JavaScript da interface.

Somente `public/` é servido. Erros de conexão retornam uma mensagem genérica; detalhes ficam no terminal do PHP.

## Autenticação implementada

- `GET /api/v1/auth/me`: usuário da sessão (ou `null`) e token CSRF.
- `POST /api/v1/auth/register`: nome, e-mail e senha; cria usuário comum e inicia sessão.
- `POST /api/v1/auth/login`: e-mail e senha.
- `POST /api/v1/auth/logout`: encerra a sessão no servidor e remove o cookie.

Os POSTs recebem JSON e o cabeçalho `X-CSRF-Token`. Senhas usam `password_hash`/`password_verify`; consultas são parametrizadas. E-mail é único. A senha deve ter de 8 a 72 bytes; caracteres acentuados podem ocupar mais de um byte. A sessão dura no máximo duas horas e é identificada por cookie `HttpOnly`, `SameSite=Lax`, com `Secure` quando houver HTTPS. O identificador muda ao autenticar. Arquivos de sessão ficam em `backend/storage/sessions`, fora da área pública e do Git.

O limite inicial é de 15 tentativas por IP e operação em 15 minutos, compartilhado entre sessões. Esse limite simples precisará ser revisto para produção e redes compartilhadas. Não há criação pública de administradores, painel administrativo ou confirmação de e-mail nesta etapa. Recuperação de senha está disponível com entrega local de teste.

A sessão tem prazo absoluto máximo de duas horas, informado ao frontend; o tempo de coleta dos arquivos PHP está alinhado a esse prazo. Fechar o navegador pode encerrar o cookie antes disso. A interface revalida ao abrir a conta, retomar a aba e receber avisos de outra aba. Um temporizador remove a identidade exibida ao alcançar o prazo. Login/logout enviam apenas um sinal via BroadcastChannel e storage; credenciais e dados pessoais não são compartilhados por esses canais. Em falha de rede, a interface informa o erro e o servidor continua sendo a autoridade sobre a sessão.

O logout consulta a sessão e atualiza o CSRF antes de agir; se a sessão já acabou, volta ao formulário. Se houver uma troca concorrente de token, repete somente o logout, no máximo uma vez. Cadastros não são reenviados automaticamente.

## Testes

Execute na raiz do projeto (MySQL do XAMPP deve estar ligado):

```powershell
C:\xampp\php\php.exe tests/run-auth.php
node --test --test-isolation=none tests/auth-ui.cjs tests/location.cjs
```

O runner PHP cria um banco `nightout_test_<identificador aleatório>`, aplica migrations, inicia servidor em porta temporária e valida sua identidade antes de testar. Ao terminar, encerra o servidor e remove somente esse banco temporário. Sessões de teste usam cookie e diretório separados. O banco `nightout` e seus contadores não são usados. A conta de banco local precisa poder criar/remover bancos para executar esse runner. Logs e sessões temporárias ficam em `backend/storage/`, ignorado pelo Git.

Não execute `tests/auth.php` diretamente; ele rejeita execução sem ambiente de teste identificado. Não configure `NIGHTOUT_TEST_RUN` no servidor manual. A suíte verifica também expiração forçada da sessão de teste, rejeição do token antigo e novo login/logout após expiração. Os testes JavaScript simulam rede, temporizador e eventos entre abas; ainda é necessária uma conferência em navegador real.

Próximas etapas: revisar a experiência no navegador e escolher entre recuperação de senha ou início do catálogo de estabelecimentos.

## Recuperação de senha local

A opção **Esqueci minha senha** está no modal de login. A migration `002_password_reset.sql` já foi aplicada neste ambiente: adiciona `auth_version` a usuários e cria `password_reset_tokens`, preservando contas existentes.

1. Abra http://127.0.0.1:8000/ e clique em Entrar → Esqueci minha senha.
2. Informe um e-mail já cadastrado.
3. No terminal da raiz do projeto, execute:

```powershell
C:\xampp\php\php.exe backend/mailbox.php
```

4. Copie o link exibido e abra no navegador com o servidor ligado.
5. Defina e confirme a nova senha. Depois entre novamente.

Nenhuma mensagem é enviada pela internet. Os últimos dez e-mails de teste podem ser lidos pelo comando; todos ficam em arquivos JSON em `backend/storage/outbox/`, fora do Git e inacessíveis pelo servidor HTTP. Eles contêm links de recuperação e devem ser tratados como dados privados locais. O link usa a origem fixa de desenvolvimento `http://127.0.0.1:8000`. Em produção precisaremos substituir a entrega em arquivos por envio real e configurar o domínio HTTPS.

O token tem 32 bytes aleatórios e somente seu hash SHA-256 fica no banco. O link vale 30 minutos, é de uso único e substituído por um novo pedido. A atualização da senha e o consumo do token ocorrem na mesma transação. O token do link usa fragmento e é removido da barra de endereço pelo frontend; não é gravado no histórico como query nem enviado nas requisições de carregamento do HTML.

Ao trocar a senha, `auth_version` aumenta. Todas as sessões anteriores são rejeitadas na próxima consulta autenticada, inclusive em outros navegadores; não há login automático. O formulário mantém a mesma mensagem de solicitação para e-mails cadastrados e não cadastrados, sem expor existência de conta no corpo da resposta. Há limite separado de cinco tentativas por IP/operação em 15 minutos.

Os testes de recuperação fazem parte de `php tests/run-auth.php` e usam banco e caixa de e-mails separados. Confirmação de e-mail ainda não foi implementada. A experiência visual precisa de conferência em navegador real.
