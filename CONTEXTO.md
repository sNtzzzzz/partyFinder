# Contexto do NightOut

Atualizado em 05/10/2026 na reorganização documental. Resumo do código e dos registros disponíveis; disponibilidade do servidor e estado do banco precisam ser conferidos em cada sessão.

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

1. Definir com o usuário a próxima evolução: ampliar/revisar catálogo, melhorar experiência ou implementar administração e API de catálogo.
2. Revisar manualmente os 54 prioritários e conflitos de operação/horários, sem publicar candidatos automaticamente nem inventar dados/fotos.
3. Se necessário transferir contas entre PCs, conferir os bancos e planejar backup/importação preservando os dados existentes, seguindo `docs/ambiente-local.md`.
4. Antes de publicar: envio real de e-mails, HTTPS, origem e credenciais de produção, revisão dos limites, backups/restauração e política de privacidade.

## Troca de computador e histórico

Atualizar este resumo com mudanças, verificações realmente executadas e pendências. Revisar o diff e versionar código/documentos quando solicitado. Bancos não sincronizam pelo Git; não versionar credenciais, backups ou sessões. Workspace `../Nightout.code-workspace` fica fora do repositório; `.vscode/tasks.json` fica dentro.

Histórico completo anterior preservado em [docs/historico-contexto-2026-10-05.md](docs/historico-contexto-2026-10-05.md). Para novas tarefas, priorizar este resumo e os relatórios específicos; o histórico contém decisões e totais substituídos por revisões posteriores.
