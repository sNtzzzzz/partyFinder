# Contexto do NightOut

Atualizado em 06/10/2026 após revisão dos 32 locais publicados. Resumo do código e dos registros disponíveis; disponibilidade do servidor e estado do banco precisam ser conferidos em cada sessão.

## Objetivo e arquitetura

Plataforma para descobrir estabelecimentos e rolês em São Paulo e no ABC. Interface HTML/CSS/JavaScript sem framework ou build; API de contas em PHP/PDO e MariaDB do XAMPP. Catálogo real local já implementado; painel administrativo e API de catálogo ainda não existem.

- `index.html`, `js/app.js`, `js/components.js`, `styles/styles.css`: exploração, filtros, cards e detalhes.
- `js/data.js`, `js/places.js`: catálogo local de 32 locais, com 29 grades habituais, 19 gráficos semanais históricos, 1 atendimento separado de eventos, 2 horários pendentes e 6 casas com fotos reais, conforme último registro da ampliação.
- `js/location.js`: geolocalização em memória e cálculo de distância. Distância do marco FSA é distinta da distância ao usuário.
- `conta.html`, `js/auth.js`, `js/recovery.js`, `js/account-settings.js`, `js/account-navigation.js`, `styles/auth.css`: autenticação e configurações da conta.
- `backend/public/router.php`: interface e API na mesma origem, com recursos públicos permitidos explicitamente.
- `backend/public/index.php`, `backend/src/`: rotas e regras de conta. Três migrations em `backend/database/migrations/`.

## Estado atual e decisões

- Catálogo e fotos locais, com atualização manual; Google Places adiado por custo. Não há reservas, pagamentos ou agenda confirmada de eventos.
- Lista em carrossel horizontal de uma linha, com setas por faixa, toque e teclado. Busca/filtros reiniciam posição; refresh de horários a preserva. Sem contador global visível.
- Funcionamento habitual no fuso `America/Sao_Paulo`, atualizado a cada minuto: ABERTO, FECHADO ou `-` quando desconhecido.
- Movimento é estimativa histórica, nunca lotação ao vivo. Quatro barras com rótulos Vazio, Pouca gente, Normal, Movimentado e Lotado; ausência de dados mostra `Movimento: -`. Modal com seletor dos sete dias; `liveOccupancy` permanece sem dados.
- Fotos reais de seis casas em WebP, miniaturas lazy nos cards e imagem maior nos detalhes. Originais privados em `backend/storage/`. Fontes e datas ficam nos dados/documentos, sem seção de referências na interface.
- Autenticação: cadastro, login/logout, sessão de até duas horas, CSRF, limites, recuperação, confirmação de e-mail, edição de nome/e-mail/senha, revogação de sessões, exportação JSON e exclusão da própria conta. Confirmação de e-mail ainda não obrigatória para login. E-mails entregues somente em arquivos privados locais.
- Menu autenticado leva a `/conta.html`; boas-vindas com botão Ok. Confirmação mostra modal de sucesso após validação.

## Curadoria e pendências do catálogo

Lista central `docs/locais-5km.csv` e curadoria JSON: último registro de 539 candidatos, 32 publicados e 54 prioritários ainda fora. Prioridade editorial não comprova público universitário, preço ou operação atual. Adegas precisam de evidência de consumo/permanência.

- Excluir Tonel do Rudge e Supra Dom Pedro; não reativar este último pelo site antigo.
- Mais Adega Point Bar: Av. Príncipe de Gales, 466.
- Virtus e After Bar: horários pendentes. Ocean Drive: atendimento separado das festas.
- Leandrini: divergência de horários documentada; aplicada grade detalhada do Maps com aviso.
- Revisão dos seis campos dos 32 em 06/10: [docs/revisao-catalogo-2026-10-06.md](docs/revisao-catalogo-2026-10-06.md)/.json. Três grades corrigidas por bios públicas próprias (TO THE SEA, Mocergo e 52’s Rock Bar), nome de exibição Casinha Bar corrigido sem mudar ID, endereço do Djack completado, CEP oficial do Charllu e Sobreloja do Lajje acrescentados. Outros conflitos recebem avisos. As 31 coordenadas existentes correspondem às fontes cadastradas, sem certificação da entrada física; Mais Adega continua sem ponto. Cissão continua com rua/número e município pendentes. Virtus e After têm respostas conflitantes de identidade nas fontes secundárias; nenhuma grade de outra operação foi importada. Google de 05/10 não reconsultado: Maps inacessível e nenhum navegador disponível nesta sessão. Bios públicas/cadastros não certificam operação presencial atual.
- Tatu Bola Kennedy 1250 excluído por evidências de fechamento/substituição; Espaço Aberto aguarda reabertura; Muquiranas conflita com Casa Areal; Adega 99 permanece candidata sem publicação.

Referências atuais: `docs/curadoria-role-5km.md/.json`, `docs/locais-role-prioritarios.csv`, `docs/ampliacao-catalogo-2026-10-05.md/.json`, `docs/revisao-horarios-2026-10-05.md/.json`. Preservar dados originais da pesquisa e registrar conflitos.

## Executar e ambiente

Na pasta `partyFinder`, com MySQL do XAMPP ligado, acesso pela rede:

```powershell
C:\xampp\php\php.exe -S 0.0.0.0:8000 -t .\backend\public .\backend\public\router.php
```

Usar `http://IPv4-atual:8000/` nos dispositivos da mesma rede; consultar o IPv4 a cada pedido. Nesta reorganização, `ipconfig` mostrou Ethernet `192.168.15.89`; esse endereço pode mudar. No próprio computador: `http://127.0.0.1:8000/`. Manter terminal aberto; Ctrl+C encerra. `backend/start.ps1` continua restrito a loopback.

HTTP pelo IP da rede não permite geolocalização; loopback no próprio computador é exceção. HTTPS confiável para celular permanece pendente. Links de e-mail usam `NIGHTOUT_APP_URL`, cujo padrão é loopback; para testes de links em outro dispositivo, configurar a origem explicitamente.

Banco padrão: `nightout`, host `127.0.0.1`, porta 3306, usuário `root`, senha vazia como padrão de desenvolvimento. Configuração privada em `backend/config/local.php`; sessões e mensagens em `backend/storage/`, ignorados pelo Git.

O histórico registra PHP 8.2.12 e três migrations aplicadas em um ambiente anterior de 05/10/2026, sem importar backup de casa. Isso não confirma instalações, usuários, migrations ou serviços deste computador agora. Não assumir banco vazio nem recriá-lo. Conferir conexão em `/api/v1/health` e seguir `docs/ambiente-local.md` para transferência preservando contas.

## Verificações

Em 06/10/2026, nesta máquina, na revisão do catálogo: consultas web e HTTP público a fontes oficiais/perfis e diretórios dos 32 locais; extração de JSON-LD/links de rota, com correspondência dos 31 pontos cadastrados. Capturas em `backend/storage/catalog-review-2026-10-06/`, ignoradas pelo Git. Executados 19 testes Node de conta/localização, todos aprovados; sintaxe de `js/data.js` aprovada; conferência pontual dos 32 IDs/fichas, 31 pontos, preservação de fotos/preços/movimento/coordenadas e dos limites de abertura/fechamento/madrugada das três grades alteradas aprovada. CSV central mantém 539 registros e as 11 colunas originais, com atualização apenas dos campos atuais dos 32; CSV publicado regenerado para refletir o catálogo atual. `git diff --check` aprovado. Não houve teste de navegador, celular físico, suíte PHP ou consulta ao banco; falhas de acesso externo e diferenças entre conteúdo indexado/HTTP foram documentadas.

Em 06/10/2026, nesta máquina: a tabela de funcionamento no modal destaca o dia atual pelo fuso `America/Sao_Paulo`, com classe `hours-today` e `aria-current="date"`. Dia e horário em branco/negrito, sem alterar fonte ou espaçamento. Executados os 13 testes de `tests/location.cjs`, aprovados, e conferência pontual em Node simulando os sete dias para garantir uma única linha destacada correspondente, aprovada. `git diff --check` aprovado. Sem verificação visual no navegador ou acesso ao banco nesta alteração.

Em 06/10/2026, nesta máquina: o card inteiro passou a abrir o modal via `data-event` no artigo de `PlaceCard`, com cursor de clique. Botões existentes preservados para acesso pelo teclado. Os 13 testes de `tests/location.cjs` passaram; conferência pontual em Node validou a abertura única do modal pelo artigo e a presença do botão existente. As tentativas iniciais dessa conferência tiveram erros no harness por ausência de `URL` e `document.body`, corrigidos antes da execução aprovada. `git diff --check` aprovado. Sem navegador ou banco nesta alteração.

Em 06/10/2026, nesta máquina: ajustado `js/places.js` para locais fechados exibirem `Movimento: -`, com quatro barras sem preenchimento e descrição de fechado. Zero de popularidade continua como `Vazio` quando aberto; os dados permanecem estimativas históricas. Executados os 13 testes de `tests/location.cjs`, todos aprovados, e conferência pontual em Node dos estados fechado/aberto com popularidade zero, aprovada. As tentativas iniciais dessa conferência falharam por aspas e codificação na chamada PowerShell; a execução via stdin com asserções sem acentos passou. Sem teste de navegador ou banco nesta alteração.

Resultados anteriores registrados, não reexecutados nesta reorganização:

- Última ampliação: 19 testes Node (13 catálogo/localização e 6 conta), validador de curadoria (539 únicos, 32 publicados, 54 prioritários) e Edge em 1280/768/390px aprovados, conforme registro anterior.
- Revisão de contas de 05/10/2026: `C:\xampp\php\php.exe tests/run-auth.php --browser` aprovado com banco temporário e Edge desktop/celular emulado; detalhes em `docs/revisao-contas-2026-10-05.md`.
- Relatório de autenticação de 04/10/2026 pertence ao ambiente anterior: `docs/relatorio-autenticacao.md`.

Nesta tarefa: leitura e comparação dos documentos com `.gitignore`, script de servidor, router e estrutura de testes/migrations; consulta do IPv4 por `ipconfig`; revisão do diff e `git diff --check`. Nenhuma suíte PHP/Node, navegador ou consulta ao banco executada. Alterações somente documentais.

Comandos de teste na raiz (MySQL ligado para PHP):

```powershell
node --test --test-isolation=none tests/auth-ui.cjs tests/location.cjs
C:\xampp\php\php.exe tests/run-auth.php
```

Nunca executar `tests/auth.php` diretamente. Runner PHP usa banco temporário identificado, preservando contas reais. Com `--browser`, também valida Edge; setup em `backend/README.md`.

## Próximos passos

Prioridade acordada em 06/10/2026: **completar os 32 lugares e conferir no celular → criar o painel administrativo e a API do catálogo → preparar a publicação**. Finalizar essa sequência antes de antecipar a agenda, que pode entrar depois conforme houver eventos confirmados. Plano e critérios de conclusão em [docs/prioridades-projeto.md](docs/prioridades-projeto.md).

Projeto retomado em 06/10/2026. Primeiro item da etapa 1 concluído como revisão dos 32, com lacunas documentadas, sem declarar todos os campos confirmados. Próxima frente: resolver identidade/operação/horários de Virtus e After, coordenadas da Mais Adega e endereço/entrada do Cissão; depois continuar os demais itens da etapa 1. Não antecipar administração/publicação nem agenda antes da sequência acordada.

Revisão dos 54 candidatos permanece no backlog, sem importação automática. Se necessário transferir contas entre PCs, seguir `docs/ambiente-local.md`, preservando dados existentes. Google Places, movimento ao vivo, pagamentos, ingressos e reservas continuam adiados.

## Troca de computador e histórico

Atualizar este resumo com mudanças, verificações realmente executadas e pendências. Revisar o diff e versionar código/documentos quando solicitado. Bancos não sincronizam pelo Git; não versionar credenciais, backups ou sessões. Workspace `../Nightout.code-workspace` fica fora do repositório; `.vscode/tasks.json` fica dentro.

Histórico completo anterior preservado em [docs/historico-contexto-2026-10-05.md](docs/historico-contexto-2026-10-05.md). Para novas tarefas, priorizar este resumo e os relatórios específicos; o histórico contém decisões e totais substituídos por revisões posteriores.
