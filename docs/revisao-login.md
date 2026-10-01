# Revisão da autenticação — NightOut

Revisão do código em 01/10/2026, comparando a implementação com o README-v2. Escopo de hoje: acesso, cadastro e sessão. Nenhuma funcionalidade foi alterada nesta revisão.

> Atualização após a revisão: os quatro pontos prioritários abaixo foram corrigidos. A interface revalida sessão, recupera logout, sincroniza avisos entre abas e ignora respostas antigas. O prazo PHP foi alinhado e testes agora usam banco/servidor/sessões isolados. Passaram 31 verificações da API e 12 testes JavaScript (seis de autenticação e seis de localização). Os achados abaixo descrevem o estado anterior; recuperação de senha e a conferência em navegador real continuam pendentes.

## Implementado

| Planejamento | Situação encontrada |
| --- | --- |
| Backend e banco locais | PHP do XAMPP, MariaDB e banco `nightout`; interface e API na mesma origem |
| Usuários | Tabela `users`, e-mail único, nome, hash, papel e data de criação |
| Cadastro | Validação no servidor; nome, e-mail e senha; inicia sessão após cadastrar |
| Senha | Mínimo de oito caracteres no JS/PHP; máximo técnico de 72 bytes; hash e verificação nativos do PHP |
| E-mail | Validação de formato e unicidade; não verifica existência ou propriedade |
| Confirmação de senha | Comparação no formulário de cadastro |
| Login e logout | Rotas funcionais e cookie de sessão |
| Proteções básicas | Consultas parametrizadas, CSRF, cookie HttpOnly/SameSite, rotação do identificador e limite de tentativas |
| Papel de usuário | Cadastro sempre cria usuário comum, mesmo se alguém enviar `role: admin` |
| Interface | Modais, mensagens, nome escapado antes de inserir no HTML, botão Ok sem encerrar sessão |
| Testes de API | Cadastro, e-mail inválido/duplicado, senha curta/incorreta, hash, sessão, logout, CSRF, limite e arquivos privados |

## Diferenças em relação ao planejamento

- Sessões ficam em arquivos privados do PHP, não em uma tabela `sessions`. Isso é uma escolha válida para a etapa local, mas não fornece gestão de dispositivos ou revogação global por usuário.
- A coluna `role` existe, mas ainda não há rotas administrativas com autorização implementada. Impedir cadastro como administrador não equivale a ter o controle administrativo pronto.
- `users` ainda não possui situação da conta, verificação de e-mail ou data de atualização.
- O campo `name` é um nome de exibição, não um username exclusivo. O acesso usa e-mail.
- Recuperação de senha e envio de e-mail não existem.
- O README-v2 tinha trechos antigos dizendo que o login não existia; foram corrigidos nesta revisão.

## Correções prioritárias para o login

### 1. Recuperar sessão expirada e logout

Evidência: `js/auth.js`, funções `authRequest` e handler de `account-logout`.

Ao receber 403, o frontend apaga apenas `account.csrf`. Ele mantém `account.user`, e o logout seguinte envia um token vazio porque não consulta `auth/me` antes. A pessoa pode ficar vendo “Minha conta” e erros ao tentar sair até recarregar a página.

Próxima correção: consultar o estado da sessão após expiração, atualizar usuário/token e apresentar login quando a sessão não existir. Não repetir automaticamente operações de cadastro.

### 2. Atualizar o estado entre abas e ao reabrir a conta

Evidência: a consulta inicial a `auth/me` ocorre somente ao carregar `js/auth.js`.

Se a sessão expirar ou houver logout em outra aba, o modal antigo continua mostrando o usuário. O backend continua verificando a sessão; o problema observado é a interface desatualizada.

Próxima correção: revalidar ao abrir o modal/retomar a aba e tratar respostas antigas para que uma consulta anterior não sobrescreva um login ou logout mais recente.

### 3. Definir e testar a duração efetiva da sessão

Evidência: `backend/src/auth.php` define `expires = time() + 7200`, mas não configura `session.gc_maxlifetime`.

Duas horas é o teto imposto pelo código. O cookie é de sessão do navegador e a limpeza de arquivos depende também da configuração do PHP; portanto, não prometemos persistência garantida por duas horas nem “lembrar de mim”.

Próxima correção: alinhar a configuração à política escolhida e testar expiração sem esperar duas horas reais.

### 4. Melhorar o isolamento dos testes

Evidência: `tests/auth.php` cria e remove o usuário aleatório, mas restaura somente o contador de login. O contador de cadastro do IP recebe tentativas do teste e não é restaurado. O teste de limite também altera temporariamente o contador de login compartilhado com o uso manual local.

Próxima correção: usar banco de teste isolado ou preservar ambos os contadores com cuidado. Não executar testes de integração no banco de produção. A suíte não foi repetida nesta revisão para evitar adicionar tentativas ao contador compartilhado.

## Funcionalidades ainda pendentes

- Recuperação de senha com token de uso único, expiração e envio de e-mail em ambiente de teste.
- Verificação do endereço de e-mail antes de tratá-lo como confirmado.
- Alteração de senha autenticada e política de revogação das outras sessões.
- Autorização administrativa nas futuras rotas protegidas.
- Configuração de produção, HTTPS, usuário de banco com permissões adequadas e revisão do limite por IP compartilhado.

Melhorias opcionais de interface: mostrar/ocultar senha e aviso de Caps Lock. “Lembrar de mim” exige uma política própria e não está implementado.

## Validação ainda necessária

- Expiração real e recuperação da interface sem recarregar a página.
- Login/logout em duas abas.
- Atraso e indisponibilidade da API durante o envio do formulário.
- Fechar/reabrir o modal durante uma requisição.
- Teclado, foco, preenchimento automático e telas móveis em navegador real.
- Autorização de rotas administrativas quando forem criadas.

Os testes existentes cobrem a API, mas não equivalem a uma revisão visual ou a testes completos de navegador. As últimas execuções registradas passaram; esta revisão foi estática e não certifica prontidão para produção.

## Ordem sugerida para hoje

1. Corrigir expiração, logout e sincronização do estado da conta.
2. Isolar os testes e cobrir os cenários de sessão que faltam.
3. Revisar os formulários no navegador, incluindo celular e teclado.
4. Iniciar recuperação de senha com entrega de e-mail local de teste.
5. Depois, implementar confirmação de e-mail.

Catálogo, eventos, mapas e painel de estabelecimentos ficam fora do foco desta etapa.
