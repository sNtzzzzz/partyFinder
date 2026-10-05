# Contexto do NightOut

Atualizado em 05/10/2026 após leitura do código neste computador.

## Objetivo e arquitetura

Plataforma para descobrir eventos e estabelecimentos em São Paulo e no ABC, com futuro catálogo próprio e cadastro administrativo. A interface usa HTML, CSS e JavaScript; a API atual usa PHP/PDO e MariaDB do XAMPP. Sem framework ou etapa de build.

- `index.html`, `js/app.js`, `js/components.js` e `styles/styles.css`: exploração, cards, filtros e detalhes.
- `js/data.js`: catálogo de 22 locais para rolê, 18 com grade semanal publicada e 6 com fotos reais; `js/places.js` renderiza estabelecimentos e calcula funcionamento habitual no fuso de São Paulo. Não há API de catálogo, reservas, pagamentos ou Google Places.
- `js/location.js`: geolocalização em memória e cálculo de distância usando as coordenadas pesquisadas dos lugares.
- `conta.html`, `js/auth.js`, `js/recovery.js`, `js/account-settings.js`, `js/account-navigation.js` e `styles/auth.css`: autenticação, menu e página dedicada de configurações.
- `backend/public/router.php`: serve interface e API na mesma origem, permitindo somente arquivos públicos explícitos.
- `backend/public/index.php` e `backend/src/`: rotas e regras de autenticação/conta.

## Estado implementado

Curadoria de perfil para rolê/resenha em 05/10/2026: pesquisados os 533 registros com 906 consultas HTTP às fontes originais e fichas secundárias, mais buscas complementares/site oficial/portais de eventos. docs/locais-5km.csv preserva todos os dados originais e recebeu classificação, prioridade, perfil, motivo, público universitário não comprovado, operação não confirmada diretamente, próxima ação, data e fontes/resultados das consultas. Resultado: 17 já publicados, 67 prioritários ainda fora, 160 potenciais, 71 pendentes (38 consumo, 26 perfil, 4 conflitos, 3 operação/agenda), 163 de baixa prioridade, 29 fora do foco e 26 com indicação de fechamento. docs/locais-role-prioritarios.csv contém os 67; relatório e evidências em docs/curadoria-role-5km.md e .json. Adegas exigem consumo/permanência, não apenas venda de bebidas; infantis/fornecedores fora; casas noturnas não aprovadas automaticamente. Prioridade é inferência editorial do perfil, não prova de audiência universitária, preço acessível ou abertura hoje. Catálogo do site mantém 22 registros, sem novos imports nesta etapa. Preferência do usuário: manter dados/fotos locais e atualizações manuais no início do desenvolvimento; adiar API paga do Google. Validados totais e cobertura única dos 533 registros, preservação das 11 colunas originais, correspondência dos 17 publicados e consistência do CSV prioritário/JSON. Nenhuma mudança de interface ou banco nesta tarefa.

Otimização de fotos em 05/10/2026: seis originais somavam 7205483 bytes; versões WebP de detalhes somam 427984 bytes e miniaturas 191134 bytes. Cards usam imageCard (até 600px), loading="lazy" e decoding="async"; detalhes usam image (até 1200px), somente quando abertos. Originais preservados em backend/storage/original-venue-photos, pasta privada ignorada pelo Git; somente versões otimizadas ficam em assets/venues. Google Places ainda não integrado.


Ampliação/correção do catálogo em 05/10/2026: 22 lugares, 18 com horários (sites oficiais e fichas públicas secundárias; não afirmar leitura direta do Google Maps). Removidos Supra Dom Pedro, após indicação do usuário e ficha corroborando fechamento, e Adega Tonel por ser loja de vinho fora do foco. Candidatos com ficha de encerramento ou sem correspondência confiável não importados. Incluída Mais Adega Point Bar, Av. Príncipe de Gales 466, endereço fornecido pelo usuário e nome corroborado no cadastro; horário e ponto exato pendentes, sem inventar coordenadas. Fotos locais de 6 casas em assets/venues: Ocean Drive de post público Instagram; São Bento, Figueiras, Vedê, Charllu e Djack de galerias oficiais quando redes não forneceram foto válida. Demais sem foto. Referências/data retiradas da interface, preservadas em metadados/documentação. Lista inicial tem duas linhas, Exibir mais adiciona duas linhas conforme 4/2/1 colunas; filtros/busca reiniciam limite. Router permite apenas imagens jpg/webp dessa pasta, preservando whitelist dos demais recursos. Verificados 16 testes Node, sintaxe PHP do router e Edge desktop/tablet/celular (2 linhas, expansão, reinício por filtros/busca, ausência dos excluídos, fotos HTTP 200, modal sem referências e sem erros JS/rolagem horizontal). Relatório atualizado em docs/catalogo-real.md; curadoria bruta em docs/curadoria-locais.json. Detalhes dos parágrafos seguintes registram etapas anteriores, não o estado atual do catálogo.

Aplicação inicial do catálogo real em 05/10/2026: seis locais (Supra Direito, Supra Dom Pedro, Supra Bernô, Adega Tonel, Ocean Drive e Boteco São Bento) substituíram os oito eventos fictícios em `js/data.js`. Cards mostram locais, endereço e funcionamento; detalhes exibem grade semanal, fontes/data e link Google Maps. Removidas da apresentação agenda/artistas fictícios, preços e lotação sem fonte, fotos de locais fictícios. Hero continua com fotografia ilustrativa genérica. Horários oficiais disponíveis para Direito, Dom Pedro e Tonel; demais desconhecidos ou dependentes de eventos. Google Maps não expôs fichas/gráficos ao mecanismo de consulta: nenhum pico de movimento foi inventado, campos popularTimes/liveOccupancy permanecem null. Distância do marco FSA é identificada separadamente da distância à posição do usuário. Status é calculado a partir do horário habitual, com fuso America/Sao_Paulo e madrugada, atualizado a cada minuto. Os 533 candidatos NÃO foram importados automaticamente como ativos; pendências permanecem no levantamento. Relatório: `docs/catalogo-real.md`. Verificados 15 testes Node e smoke Edge desktop/celular (busca, modal, mapa, localização/distância, sem erros JS/rolagem horizontal); autenticação PHP não alterada ou retestada nesta tarefa.

Pesquisa de locais em 05/10/2026: `docs/levantamento-locais-5km.md`, `docs/lista-locais-5km.md`, `docs/locais-5km.csv` e `docs/levantamento-locais-5km.json`. Marco FSA (-23.66145, -46.55402), raio de 5 km em linha reta. Consultadas 115 páginas de diretório nas quatro cidades próximas: 994 registros, 530 no raio; mais 3 complementares = 533 candidatos, não estabelecimentos ativos confirmados nem censo completo. Supra Direito (Rua Java 299) e Bernô (Rua Marli 26) a aproximadamente 3,18 km; coordenadas quase iguais exigem confirmar relação das operações. Horário semanal do Bernô não localizado; preservar horários de eventos separadamente. Submundo 808 adiado por ser itinerante. Fontes, conflitos e pendências nos documentos; catálogo e banco ainda demonstrativos para locais/eventos. Scripts auxiliares privados em backend/storage; JSON/CSV/documentos são os artefatos da pesquisa. O diretório inverte latitude/longitude; normalização e valores brutos registrados.

Inventário do catálogo demonstrativo concluído em 05/10/2026: `docs/inventario-dados-demonstrativos.md` reúne os 8 eventos, 7 nomes de locais, 5 artistas, campos ausentes, imagens, textos fixos e dados necessários para pesquisa. Nenhum dado real foi pesquisado/inserido ainda. Próxima etapa: selecionar locais e buscar fontes oficiais; separar funcionamento semanal da casa da agenda de eventos. Backend atual continua restrito a contas.

Modal de boas-vindas autenticado simplificado a pedido do usuário: ações mostram apenas Ok; logout e configurações continuam no menu do header. Hover de Ok escurece o fundo claro, sem trocar para vermelho. Aviso de confirmação de e-mail permanece quando aplicável.

Revisão de contas em 05/10/2026 concluída: corrigidas recuperação por link na página dedicada, ação do botão Ok nessa página e leitura da sessão antes de rejeitar token de confirmação malformado. Suíte PHP completa e Edge em desktop/celular emulado aprovados, sem erros JavaScript; 12 testes JavaScript também passaram. Detalhes em `docs/revisao-contas-2026-10-05.md`. Estrutura de pastas preservada; criado `.vscode/tasks.json` e workspace `../Nightout.code-workspace` para abrir `partyFinder` e executar tarefas locais. O workspace está fora do repositório Git e não acompanha push/pull; tarefas e documentos acompanham quando versionados.

Em 05/10/2026, removido o texto “DO SEU JEITO” da lateral de `conta.html`, a pedido do usuário.

Cadastro, login/logout, sessões com prazo de duas horas, CSRF, limites de tentativas, recuperação de senha, confirmação de e-mail, edição de nome, mudança de e-mail, alteração de senha, revogação de sessões, exportação JSON e exclusão da própria conta. Senhas são verificadas por hash no servidor. E-mails são arquivos privados locais, sem envio externo.

O menu autenticado leva a `/conta.html`. A confirmação de e-mail mostra um modal de sucesso. A confirmação ainda não é obrigatória para login. Há três migrations para usuários, limites, recuperação e verificação de e-mail.

Alguns trechos de `README-v2.md` e `backend/README.md` preservam pendências antigas ou dizem que migrations já foram aplicadas “neste ambiente”. Isso não comprova instalação nem banco neste PC. Para estado funcional, conferir código e o relatório consolidado de autenticação.

## Ambiente deste PC

Em 05/10/2026, após instalação pelo usuário, PHP 8.2.12 está disponível em `C:\xampp\php\php.exe` e MySQL/MariaDB está ligado na porta 3306. Criamos `nightout` vazio com autorização do usuário e aplicamos as três migrations; nenhum backup de casa foi importado. Servidor iniciado em `http://127.0.0.1:8000`, com health conectado e página inicial respondendo HTTP 200. Node está disponível. O repositório Git fica em `partyFinder`, não na pasta pai `Nightout`.

O banco padrão é `nightout`, host `127.0.0.1`, porta `3306`, usuário `root`, senha vazia. Configuração diferente deve ficar em `backend/config/local.php`. O clone contém migrations, mas não usuários do banco de casa. É necessário importar um backup SQL para trazer essas contas.

## Verificações

Após otimizar as fotos em 05/10/2026, os 16 testes Node passaram e o Edge validou desktop (1280px), tablet (768px) e celular (390px): miniaturas WebP com carregamento lazy, foto maior nos detalhes, imagens HTTP 200, busca, filtros e expansão de duas linhas sem erros JavaScript ou rolagem horizontal. Conferida visualmente a versão otimizada da foto do Vedê. Google Places permanece pendente.

O relatório de 04/10/2026 registra testes PHP e Edge aprovados no ambiente anterior. Neste PC, em 05/10/2026, `node --test --test-isolation=none tests/auth-ui.cjs tests/location.cjs` passou nos 12 testes, sem falhas. Após as correções da revisão, `C:\xampp\php\php.exe tests/run-auth.php --browser` passou na suíte de API e nos fluxos completos do Edge em desktop e celular emulado, usando banco temporário isolado.

## Próximos passos

1. Cadastrar conta local de teste pela interface. O banco vazio já está preparado e a API foi verificada.
2. Quando tiver acesso ao PC de casa, exportar o banco e planejar importação sem sobrescrever dados locais inadvertidamente. Seguir `docs/ambiente-local.md`.
3. Confirmar com o usuário a próxima evolução de produto; o planejamento propõe catálogo real e painel administrativo.
4. Antes de publicar: envio real de e-mails, HTTPS, credenciais de produção, backups e política de privacidade.

## Troca de computador

Em 05/10/2026, o usuário mostrou erro de confirmação com a mensagem frontend “Link inválido. Solicite outra confirmação.” Essa mensagem indica que o fragmento recebido não tinha o formato de 64 caracteres hexadecimais, antes de consultar a API. A inspeção local encontrou um link de confirmação ativo, com formato válido; provável cópia incompleta ou com caracteres extras, ainda sem confirmação da causa pelo usuário. Orientação: copiar a URL inteira, sem quebras de linha, ou extrair a linha do comando mailbox para a área de transferência.

Atualizar este arquivo, revisar alterações e fazer commit/push do código e documentos. No outro PC, fazer pull e pedir ao Codex para ler este contexto. Bancos locais são independentes e não sincronizam pelo Git.

