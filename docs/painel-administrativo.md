# Painel de lugares

Primeira versão em 06/10/2026. Acesse `/admin.html` ou entre na conta administradora e abra **Administrar lugares** no menu da conta. A conta escolhida é `santiago@gmail.com`; a autorização é o papel `admin` no banco, não uma comparação de e-mail no navegador. O e-mail precisa estar confirmado. Outros usuários continuam comuns e não podem consultar ou alterar o catálogo administrativo.

## Uso

Selecione um lugar na lista ou clique em **Adicionar lugar**. Edite nome, categoria, endereço, bairro/cidade, orientação de acesso, coordenadas, links, horários semanais e foto. Coordenadas são opcionais; sem elas, o lugar não aparece em Perto de mim. Não use números aproximados como se fossem uma entrada confirmada.

Cada dia aceita sem informação, fechado ou até quatro intervalos. Fechamento anterior à abertura atravessa a madrugada. Horários de atendimento/visitas são distintos do funcionamento de festas; a opção correspondente mantém essa distinção do Ocean Drive. Gráficos históricos e referências pesquisadas são preservados, sem inventar movimento ao vivo. O editor ainda não altera os gráficos de popularidade.

**Publicar este lugar no site** controla visibilidade, não o cálculo de aberto/fechado pelo horário. Desmarque para esconder sem excluir o registro; novos lugares começam ocultos. Salvar torna a alteração disponível na API imediatamente. A página principal carrega ao abrir, ao voltar à aba e a cada minuto enquanto visível. Falha inicial da API mostra opção de tentar novamente; nunca restaura um catálogo estático que possa ressuscitar lugares ocultos. Se uma atualização posterior falhar, mantém o que já foi carregado e informa a falha.

Fotos: JPG, PNG ou WebP, até 5 MB e 12 megapixels. PHP/GD decodifica e reencoda WebP de até 1200px, com versão de até 600px para cards. Não salva o arquivo original enviado nem executa conteúdo enviado como foto. A origem informada é um registro textual; use fotos reais da própria casa. Enviar uma foto e remover a atual simultaneamente é rejeitado. Fotos enviadas ficam em `backend/storage/catalog-images/`, fora do Git; os arquivos reencodados são servidos pela rota restrita `/media/venues/`.

Alterações concorrentes usam revisão do registro: se outra aba salvou primeiro, recarregue o lugar antes de salvar novamente. O formulário avisa ao abandonar alterações não salvas.

## Banco e instalação em outro PC

O catálogo ativo é a tabela `venues`, com documento completo, publicação, ordem, revisão, autor e data da última edição. Os dados iniciais dos 31 lugares estão em `backend/database/catalog-seed.json`. `js/data.js` é um retrato histórico usado pelos testes e não é mais servido na página. CSVs e documentos de pesquisa também são retratos da curadoria; não são sincronizados automaticamente pelo painel.

Com MySQL ligado, na pasta partyFinder:

```powershell
C:\xampp\php\php.exe backend/database/migrate.php
C:\xampp\php\php.exe backend/database/import-catalog.php
```

A importação insere somente IDs ausentes. Repetir não substitui edições ou reativa ocultos. Não use a importação inicial para sincronizar edições administrativas entre PCs. Para continuar com o catálogo editado e as contas, transfira o banco existente conforme `ambiente-local.md`, preservando usuários, e copie separadamente `backend/storage/catalog-images/`. Git não transporta o banco nem as fotos enviadas. Fotos originais do catálogo em `assets/venues/` continuam no repositório.

Promoção explícita de uma conta existente, somente via CLI local:

```powershell
C:\xampp\php\php.exe backend/database/set-admin.php santiago@gmail.com
```

Esse comando não cria conta, não troca senha e não confirma e-mail. Não existe endpoint público de promoção. Em outro PHP, habilite `extension=gd` em php.ini e reinicie o processo PHP para upload; a extensão foi habilitada neste XAMPP, com cópia anterior privada em backend/storage. MySQL e comando HTTPS continuam os mesmos.

## API e verificações

- `GET /api/v1/venues`: somente publicados, sem sessão obrigatória.
- `GET /api/v1/admin/venues`: todos os registros, exige administrador confirmado.
- `POST /api/v1/admin/venues`: cadastro/edição/publicação; exige sessão, CSRF, validação e revisão na edição.
- `POST /api/v1/admin/venues/photo`: upload multipart; mesmas permissões e CSRF.

O nome de arquivo recebido não define destino. Headers de HTTPS/IP continuam restritos ao proxy local confiável. `tests/run-auth.php --browser` usa banco temporário e verifica contas, guardas de administrador, CSRF, validação, importação repetida, preservação de gráficos, conflito de revisão, fotos válidas/disfarçadas, editor em 1280/390px, publicação/ocultação e falha inicial da API.

Referência técnica: [PHP — leitura e validação de imagens](https://www.php.net/manual/en/function.imagecreatefromstring.php).
