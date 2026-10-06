# Revisão dos 32 estabelecimentos — 06/10/2026

Revisão dos seis campos solicitados: nome, categoria, endereço, operação, horários e coordenadas. Todos os 32 registros foram examinados; campos sem confirmação continuam pendentes. Registro estruturado e antes/depois em [revisao-catalogo-2026-10-06.json](revisao-catalogo-2026-10-06.json).

## Resultado

- 32 locais preservados; nenhuma inclusão, remoção ou alteração de ID.
- 31 pares de coordenadas conferidos diretamente contra JSON-LD/links de rota das fontes cadastradas: todos coincidem, com tolerância de 0,000001 grau. Isso confirma transcrição, não precisão da entrada física. Mais Adega segue sem coordenadas.
- 3 grades corrigidas por bios públicas das próprias casas: TO THE SEA, Mocergo e 52’s Rock Bar. Fontes secundárias divergentes permanecem documentadas.
- Nome de exibição Casinha Bar corrigido; endereço do Djack completado, CEP oficial do Charllu acrescentado e complemento Sobreloja do Lajje preservado no endereço.
- Virtus e After continuam sem grade, com divergências de identidade/endereço que impedem importar horários de outras operações.
- Nenhuma categoria mudou. Adegas/bares continuam avaliados pelo serviço e possibilidade de permanência; não são promessa de público universitário ou preço acessível.

## Método e limites

Consultados sites oficiais e diretórios pela ferramenta web e por HTTP público. Bios de Instagram foram lidas em metadados públicos de HTML, sem login: nome e horário disponíveis não significam leitura de stories, posts atuais ou confirmação presencial. Alguns conteúdos falharam na ferramenta web e puderam ser obtidos por HTTP; respostas genéricas de Instagram/Facebook e erros não contam como confirmação. Restaurant Guru apresentou diferença entre conteúdo indexado e HTTP atual em Virtus; a diferença está registrada, sem misturar os locais.

Tentativas de Google Maps para Mais Adega, Virtus e After não entregaram fichas nesta sessão. A ferramenta de navegador informou que Edge não estava disponível e inventário vazio. Não houve consulta direta nova ao Google nem contorno de CAPTCHA. As consultas documentadas de 05/10 continuam como evidência anterior; não foram atualizadas artificialmente.

CNPJ ativo, cadastro disponível, bio pública ou avaliações são indícios de atividade, não confirmação de operação presencial hoje. Não contatamos casas nem realizamos visita. Endereço de evento antigo não substitui endereço atual sem correspondência confiável.

Capturas HTTP e extrações completas desta revisão ficam em `backend/storage/catalog-review-2026-10-06/`, privado e ignorado pelo Git. As fontes/datas e os resultados resumidos ficam nesta documentação; nenhuma seção de referências foi acrescentada à interface. Movimento histórico, preços, fotos e agenda não foram preenchidos nesta tarefa.

## Matriz de revisão

Os estados abaixo distinguem a revisão realizada de dados totalmente confirmados. Fonte primária priorizada pode coexistir com conflito; veja cada ficha.

| Local | Categoria revisada | Endereço | Operação | Horários | Coordenadas |
| --- | --- | --- | --- | --- | --- |
| Supra Direito SBC | Bares | corroborado | indicios_em_canal_proprio | fonte_primaria_priorizada | correspondem_a_fonte_cadastrada |
| Mais Adega Point Bar | Adegas | corroborado | indicios_em_cadastros_secundarios | corroborado_em_fontes_secundarias | ausentes |
| Beco Figueiras | Bares | rua_numero_corroborados_bairro_divergente | indicios_em_cadastros_secundarios | google_2026_10_05_preservado_com_conflito | correspondem_a_fonte_cadastrada |
| Boteco São Bento Santo André | Bares | corroborado | indicios_em_canal_proprio | corroborado_em_fontes_secundarias | correspondem_a_fonte_cadastrada |
| Bar Figueiras | Bares | corroborado | indicios_em_canal_proprio | fonte_primaria_priorizada | correspondem_a_fonte_cadastrada |
| Vedê Bar | Bares | corroborado | indicios_em_canal_proprio | fonte_primaria_priorizada | correspondem_a_fonte_cadastrada |
| Charllu Bar | Bares | corroborado | indicios_em_canal_proprio | fonte_primaria_priorizada | correspondem_a_fonte_cadastrada |
| Supra Bernô | Casas de festas | corroborado | indicios_em_canal_proprio | corroborado_em_fontes_secundarias | correspondem_a_fonte_cadastrada |
| Buffet Ocean Drive | Espaços para festas | corroborado | indicios_em_canal_proprio | atendimento_separado_de_eventos | correspondem_a_fonte_cadastrada |
| Frampe Bar | Bares | corroborado | indicios_em_cadastros_secundarios | corroborado_em_fontes_secundarias | correspondem_a_fonte_cadastrada |
| CasaVéia Bebidas e Espetos | Bares | corroborado | indicios_em_canal_proprio | fonte_primaria_priorizada | correspondem_a_fonte_cadastrada |
| Virtus Beer Bar e Restaurante | Bares | corroborado | identidade_operacao_pendentes | pendente | correspondem_a_fonte_cadastrada |
| A Gruta Rock Bar | Bares | corroborado | indicios_em_canal_proprio | fonte_primaria_priorizada | correspondem_a_fonte_cadastrada |
| Botequim Carioca | Bares | corroborado | indicios_em_cadastros_secundarios | corroborado_em_fontes_secundarias | correspondem_a_fonte_cadastrada |
| TO THE SEA | Bares | corroborado | indicios_em_canal_proprio | fonte_primaria_priorizada | correspondem_a_fonte_cadastrada |
| Casinha Bar | Bares | corroborado | indicios_em_canal_proprio | corroborado_em_fontes_secundarias | correspondem_a_fonte_cadastrada |
| Bar do Rubão | Bares | corroborado | indicios_em_cadastros_secundarios | corroborado_em_fontes_secundarias | correspondem_a_fonte_cadastrada |
| After Bar - Barzinho em SBC | Bares | numero_corroborado_identidade_pendente | identidade_operacao_pendentes | pendente | correspondem_a_fonte_cadastrada |
| Taberna adega bar | Bares | corroborado | indicios_em_cadastros_secundarios | corroborado_em_fontes_secundarias | correspondem_a_fonte_cadastrada |
| Bararanha | Bares | corroborado | indicios_em_cadastros_secundarios | corroborado_em_fontes_secundarias | correspondem_a_fonte_cadastrada |
| Bar do Carlinhos | Bares | corroborado | indicios_em_cadastros_secundarios | corroborado_em_fontes_secundarias | correspondem_a_fonte_cadastrada |
| Bar do Djack | Bares | corroborado | indicios_em_canal_proprio | fonte_primaria_priorizada | correspondem_a_fonte_cadastrada |
| Bar do Cissão | Bares | incompleto_e_divergente | indicios_em_cadastros_secundarios | google_2026_10_05_preservado_com_conflito | correspondem_a_fonte_cadastrada |
| Rota Music Bar | Bares | corroborado | indicios_em_cadastros_secundarios | google_2026_10_05_preservado_com_conflito | correspondem_a_fonte_cadastrada |
| Botequim Do Orestes | Bares | corroborado | indicios_em_cadastros_secundarios | corroborado_em_fontes_secundarias | correspondem_a_fonte_cadastrada |
| Errejota Bangalô Bar | Bares | corroborado | indicios_em_canal_proprio | fonte_primaria_priorizada | correspondem_a_fonte_cadastrada |
| 52’s Rock Bar | Bares | rua_numero_corroborados_bairro_divergente | indicios_em_canal_proprio | fonte_primaria_priorizada | correspondem_a_fonte_cadastrada |
| Mocergo | Bares | rua_numero_corroborados_bairro_divergente | indicios_em_canal_proprio | fonte_primaria_priorizada | correspondem_a_fonte_cadastrada |
| Jim Jones Pub | Bares | rua_numero_corroborados_bairro_divergente | indicios_em_cadastros_secundarios | google_2026_10_05_preservado_com_conflito | correspondem_a_fonte_cadastrada |
| Lajje Beer | Bares | corroborado | indicios_em_cadastros_secundarios | corroborado_em_fontes_secundarias | correspondem_a_fonte_cadastrada |
| Flag The Bar | Bares | corroborado | indicios_em_cadastros_secundarios | google_2026_10_05_preservado_com_conflito | correspondem_a_fonte_cadastrada |
| Leandrini Rock Bar | Bares | corroborado | indicios_em_canal_proprio | google_2026_10_05_preservado_com_conflito | correspondem_a_fonte_cadastrada |

## Fichas e conflitos

### Supra Direito SBC

ID: `supra-direito`. Endereço publicado: R. Java, 299 - Jardim do Mar, São Bernardo do Campo - SP, 09750-650.

Site oficial confirma Rua Java, 299 e toda a grade. Nome comercial mantido; não confundir com Supra Bernô. Pontos dos dois cadastros muito próximos não comprovam entradas independentes.

Coordenadas: -23.689908400000004, -46.557497999999995; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/sao-bernardo-do-campo-sp/supra-bar-direito-sbc/62ceb8191968413d5511eb36), [Fonte 2](https://suprabar.com.br/direito-sbc/).

### Mais Adega Point Bar

ID: `mais-adega-principe`. Endereço publicado: Av. Príncipe de Gales, 466 - Vila Príncipe de Gales, Santo André - SP, 09060-650.

Nome/endereço corroborados pelo cadastro empresarial e pelo usuário. CNAE de serviço de bebidas com entretenimento não comprova público nem operação presencial atual. Horários do Google de 05/10 preservados; Maps não acessível nesta sessão. Coordenadas continuam ausentes.

Coordenadas: ausentes; não geocodificadas por aproximação.

Fontes consultadas: [Fonte 1](https://cadastroempresa.com.br/fornecedor/mais-adega-point-bar-61428933000179).

### Beco Figueiras

ID: `beco-figueiras`. Endereço publicado: R. das Figueiras, 1380 - Jardim, Santo André - SP, 09080-300.

Rua/número e grade coincidem com Restaurant Guru e Google de 05/10. Outros diretórios divergem no bairro (Jardim/Campestre), na terça e nas aberturas de fim de semana. Mantida grade do Google com aviso; bairro aguarda fonte primária.

Coordenadas: -23.645667, -46.5415851; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/beco-figueiras/660d1ad7a3f2688d6da690f6), [Fonte 2](https://restaurantguru.com.br/Beco-Figueiras-Santo-Andre).

### Boteco São Bento Santo André

ID: `boteco-sao-bento`. Endereço publicado: R. das Bandeiras, 16 - Jardim, Santo André - SP, 09090-780.

Rua das Bandeiras, 16 corroborada no cadastro e turismo municipal. Grade coincide com diretório e página de reservas Dionísio; site oficial acessível por HTTP, mas sem grade da unidade extraída. Não usar horário de delivery como salão.

Coordenadas: -23.6527535, -46.532547900000004; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/boteco-sao-bento-santo-andre/68a9979f2648b322fc60609f), [Fonte 2](https://botecosaobento.com.br/), [Fonte 3](https://restaurantguru.com.br/Boteco-Sao-Bento-Santo-Andre-Santo-Andre).

### Bar Figueiras

ID: `bar-figueiras`. Endereço publicado: Rua das Figueiras, 835 - Jardim, Santo André - SP, 09080-300.

Site oficial confirma endereço e grade cadastrados. Google de 05/10 diverge; JSON-LD atual do Restaurant Guru chega a registrar sexta/sábado até 15h. Prioridade do site mantida e aviso preservado.

Coordenadas: -23.6501885, -46.5392941; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://restaurantguru.com.br/Bar-Figueiras-Santo-Andre), [Fonte 2](https://barfigueiras.com.br/).

### Vedê Bar

ID: `vede`. Endereço publicado: Rua das Figueiras, 1206 - Jardim, Santo André - SP, 09080-300.

Site oficial confirma Rua das Figueiras, 1206 e quarta/sexta até 02h. Diretório fecha quarta/quinta à meia-noite; grade oficial mantida e divergência indicada.

Coordenadas: -23.6469543, -46.5407372; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://restaurantguru.com.br/Vede-Bar-Santo-Andre), [Fonte 2](https://vedebar.com.br/).

### Charllu Bar

ID: `charllu`. Endereço publicado: Av. dos Estados, 6843 - Centro, Santo André - SP, 09290-520.

Site oficial confirma nome, perfil de bar, endereço e grade. CEP 09290-520 acrescentado conforme rodapé oficial; coordenadas coincidem com a fonte.

Coordenadas: -23.6516094, -46.512933; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://restaurantguru.com.br/Charllu-Bar-Santo-Andre), [Fonte 2](https://charllu.com.br/).

### Supra Bernô

ID: `supra-berno`. Endereço publicado: Rua Marli, 26 - Jardim do Mar, São Bernardo do Campo - SP, 09726-390.

Organizador Blacktag e ficha secundária correspondem à marca; Rua Marli, 26 corroborada pela ficha. Grade sexta/sábado 22–05 de Google 05/10 preservada, não revalidada hoje. Entrada depende da programação. Cadastro muito próximo do Supra Direito: conferir entradas no mapa/visita.

Coordenadas: -23.6899, -46.5576; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://restaurantguru.com.br/Supra-Bar-Berno-Sao-Bernardo-do-Campo), [Fonte 2](https://www.blacktag.com.br/organizadores/1288/supra-berno).

### Buffet Ocean Drive

ID: `ocean-drive`. Endereço publicado: Av. Padre Anchieta, 208 - Jardim, Santo André - SP, 09090-710.

Site oficial confirma buffet/espaço de festas e Avenida Padre Anchieta, 208. Atendimento seg/sáb 10–18 corroborado no diretório; permanece separado de eventos, sem declarar festa aberta.

Coordenadas: -23.6529603, -46.5319929; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/buffet/santo-andre-sp/buffet-ocean-drive/66dba2d258c8e2634b9939aa), [Fonte 2](https://www.oceandrive.com.br/index.html).

### Frampe Bar

ID: `frampe-bar`. Endereço publicado: Av. Min. Osvaldo Aranha, 302 - Rudge Ramos, São Bernardo do Campo - SP, 09626-000.

Nome, categoria de bar, rua/número e grade coincidem nos dois diretórios consultados. Sem canal primário atual confirmado; cadastro e avaliações são indícios, não confirmação presencial.

Coordenadas: -23.658877699999998, -46.5693208; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/sao-bernardo-do-campo-sp/frampe-bar/66c7a83cf99178ff5747437d), [Fonte 2](https://restaurantguru.com.br/Frampe-Bar-Sao-Bernardo-do-Campo).

### CasaVéia Bebidas e Espetos

ID: `casaveia-bebidas-e-espetos`. Endereço publicado: Av. Atlântica, 497 - Vila Valparaiso, Santo André - SP, 09060-000.

Bio pública da casa confirma Avenida Atlântica, 497 e ter 17–23h30, qua/sex 17–00, sáb 12h30–00. Diretório de origem diverge no domingo e aberturas; preservada grade corroborada pelo perfil e aviso adicionado.

Coordenadas: -23.666943, -46.5461111; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/casaveia-bebidas-e-espetos/660ce897a3f2688d6da681fa), [Fonte 2](https://www.instagram.com/casaveiaespetos), [Fonte 3](https://restaurantguru.com.br/CasaVeia-Bebidas-e-Espetos-Santo-Andre).

### Virtus Beer Bar e Restaurante

ID: `virtus-beer-bar-e-restaurante`. Endereço publicado: R. Adolfo Laves, 327 - Vila Valparaiso, Santo André - SP, 09060-390.

Diretório de origem/Solutudo corroboram Adolfo Laves, 327. Restaurant Guru via web mostrou VIRTUS RESTAURANTE nesse endereço, mas HTTP direto retornou VIRTUS LANCHONETE E CIA na Rua São Francisco, 55. Grades divergem (10h30–14h30, horários variados, 07–22). Cardápio primário encontrado para delivery/retirada não confirma grade do salão. Manter horários desconhecidos e verificar identidade/operação.

Coordenadas: -23.663925799999998, -46.546301299999996; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/virtus-beer-bar-e-restaurante/636e4cbfb46ef06da8426256), [Fonte 2](https://restaurantguru.com.br/Virtus-Beer-Bar-e-Restaurante-Santo-Andre).

### A Gruta Rock Bar

ID: `a-gruta-rock-bar`. Endereço publicado: R. Cel. Abílio Soares, 426 - Vila Assunção, Santo André - SP, 09020-260.

Resultado indexado do site oficial mantém segunda 19h30–23 e domingo só por evento; consulta HTTP direta ao site falhou. Diretório informa segunda 19h e domingo fechado. Prioridade oficial preservada com aviso; domingo continua condicionado, não fechado automaticamente.

Coordenadas: -23.6634816, -46.5255338; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/a-gruta-rock-bar/636e4c81b46ef06da8426220), [Fonte 2](https://agrutarockbar.com.br/), [Fonte 3](https://restaurantguru.com.br/A-Gruta-Rock-Bar-Santo-Andre).

### Botequim Carioca

ID: `botequim-carioca`. Endereço publicado: R. Santo André, 524 - Centro, Santo André - SP, 09020-230.

Rua Santo André, 524 e grade corroboradas em diretório; endereço também no turismo municipal. Instagram retornou página genérica, sem bio utilizável. Categoria de bar mantida; operação atual sem confirmação primária recente.

Coordenadas: -23.6657267, -46.5253186; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/botequim-carioca/660cee3fa3f2688d6da683ad), [Fonte 2](https://www.instagram.com/botequim_carioca_santo_andre/), [Fonte 3](https://restaurantguru.com.br/Botequim-Carioca-Santo-Andre).

### TO THE SEA

ID: `to-the-sea`. Endereço publicado: Rua Haddock Lobo, 351 - Vila Bastos, Santo André - SP, 09040-340.

Bio pública da própria casa informa qua/dom 18–00, qui 18–01 e sex/sáb 18–02; substituída a grade secundária. Endereço Haddock Lobo, 351 corroborado em dois diretórios. Conflito registrado; falta confirmação direta de exceções.

Coordenadas: -23.660609899999997, -46.538306; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/to-the-sea/660d1b27a3f2688d6da6910d), [Fonte 2](https://www.instagram.com/tothesea_br/), [Fonte 3](https://restaurantguru.com.br/TO-THE-SEA-Santo-Andre).

### Casinha Bar

ID: `casinha-bar-melhor-caipirinha-do-brrasil`. Endereço publicado: R. Itobi, 138 - Vila Alpina, Santo André - SP, 09090-240.

Bio própria identifica Casinha Bar e oferece happy hour/eventos/cardápio; nome de exibição corrigido, ID preservado. Rua Itobi, 138 corroborada em diretório e documento municipal de 2025. Grade coincide nos diretórios; bio não publica horários.

Coordenadas: -23.6527122, -46.541247299999995; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/casinha-bar-melhor-caipirinha-do-brrasil/660d1b16a3f2688d6da69108), [Fonte 2](https://www.instagram.com/barcasinha/), [Fonte 3](https://restaurantguru.com.br/CASINHA-BAR-Melhor-Caipirinha-Do-Brrasil-Santo-Andre).

### Bar do Rubão

ID: `bar-do-rubao`. Endereço publicado: Av. Prestes Maia, 158 - Vila Guiomar, Santo André - SP, 09090-521.

Nome, categoria, Avenida Prestes Maia, 158 e grade coincidem nos diretórios consultados. Sem canal próprio atual confirmado; operação presencial ainda exige confirmação.

Coordenadas: -23.6570714, -46.549743299999996; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/bar-do-rubao/636e4cf8b46ef06da8426287), [Fonte 2](https://restaurantguru.com.br/Bar-do-Rubao-Santo-Andre).

### After Bar - Barzinho em SBC

ID: `after-bar-barzinho-em-sbc`. Endereço publicado: Av. Kennedy, 137 - Jardim do Mar, São Bernardo do Campo - SP, 09726-250.

Diretório mantém After Bar na Kennedy, 137; Restaurant Guru retornou Mr. Hoppy no mesmo número. Fontes de 2019/2020 citam Mr. Hoppy ali, portanto não provam substituição recente. Identidade e operação atuais pendentes; nenhuma grade importada do outro nome.

Coordenadas: -23.6877688, -46.5600702; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/sao-bernardo-do-campo-sp/after-bar-barzinho-em-sbc/660cedd9a3f2688d6da68390), [Fonte 2](https://restaurantguru.com.br/After-Bar-Barzinho-em-SBC-Sao-Bernardo-do-Campo).

### Taberna adega bar

ID: `taberna-adega-bar`. Endereço publicado: Rua Pacaembú, 353 - Paulicéia, São Bernardo do Campo - SP, 09692-040.

Nome, rua/número e perfil de bar corroborados em diretórios. Grade de um deles divide as madrugadas no dia civil; outro atribui o fechamento ao dia de abertura. As janelas semanais são equivalentes após normalizar a virada, sem corrigir horários por mera diferença de formato.

Coordenadas: -23.667839999999998, -46.5825143; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/sao-bernardo-do-campo-sp/taberna-adega-bar/660c3cadd622f2b541169be3), [Fonte 2](https://restaurantguru.com.br/Taberna-adega-bar-Sao-Bernardo-do-Campo).

### Bararanha

ID: `bararanha`. Endereço publicado: Praça Assunção, 04 - Vila Assunção, Santo André - SP, 09030-527.

Nome curto Bararanha corresponde à ficha Bararanha Embriagada na Praça Assunção, 04. Grade coincide nos diretórios; categoria de bar mantida. Sem prova direta de operação hoje.

Coordenadas: -23.671891199999997, -46.527215999999996; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/bararanha/660beb5dd622f2b5411680fe), [Fonte 2](https://restaurantguru.com.br/Bararanha-Santo-Andre).

### Bar do Carlinhos

ID: `bar-do-carlinhos`. Endereço publicado: R. Estér, 437 - Vila Alpina, Santo André - SP, 09090-290.

Nome, bar, Rua Estér, 437 e grade coincidem nos diretórios. Preservada madrugada até 01h30; não converter domingo para sábado nem inventar operação ao vivo.

Coordenadas: -23.6531134, -46.5427378; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/bar-do-carlinhos/636e4645b46ef06da8425cc6), [Fonte 2](https://restaurantguru.com.br/Bar-do-Carlinhos-Santo-Andre).

### Bar do Djack

ID: `djack`. Endereço publicado: Av. Dom Pedro II, 566 - Jardim, Santo André - SP, 09080-000.

Site oficial confirma Avenida Dom Pedro II, 566, Jardim, Santo André e grade do restaurante. Endereço completado com bairro/cidade/UF e CEP da ficha secundária. Grade de delivery permanece fora do cálculo de abertura do salão.

Coordenadas: -23.6505205, -46.5347674; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://restaurantguru.com.br/Bar-do-Djack-Santo-Andre), [Fonte 2](https://www.bardodjack.com.br/).

### Bar do Cissão

ID: `bar-do-cissao`. Endereço publicado: Vila Príncipe de Gales, Santo André - SP, 09615-085.

Nome e grade corroborados nos diretórios; fonte numérica corresponde ao ponto cadastrado. Endereço continua sem rua/número; evento antigo cita Lauro Gomes, 2006 em SBC, enquanto cadastro indica Santo André. Não transferir município/endereço por evento histórico; pendência explicitada.

Coordenadas: -23.663213, -46.5552267; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/bar-do-cissao/660d1b4ea3f2688d6da69118), [Fonte 2](https://restaurantguru.com.br/Bar-Do-Cissao-Santo-Andre).

### Rota Music Bar

ID: `rota-music-bar`. Endereço publicado: R. Piagentini, 34 - Rudge Ramos, São Bernardo do Campo - SP, 09626-130.

Ficha com URL antiga Rota-do-Acai se identifica hoje como Rota Music Bar na Piagentini, 34; não há conflito de identidade nessa resposta. Grades diferem sexta/sábado entre diretórios. Preservado Google 05/10 e adicionada ressalva.

Coordenadas: -23.656136099999998, -46.570954099999994; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/sao-bernardo-do-campo-sp/rota-music-bar/660cee31a3f2688d6da683a9), [Fonte 2](https://restaurantguru.com.br/Rota-do-Acai-Sao-Bernardo-do-Campo).

### Botequim Do Orestes

ID: `botequim-do-orestes`. Endereço publicado: R. Caminho do Pilar, 1930 - Vila Gilda, Santo André - SP, 09190-000.

Nome, categoria de bar, Caminho do Pilar, 1930 e grade coincidem nos diretórios. Sem confirmação direta da operação atual pelo responsável.

Coordenadas: -23.6773906, -46.5441643; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/botequim-do-orestes/660d1b52a3f2688d6da69119), [Fonte 2](https://restaurantguru.com.br/Botequim-do-Orestes-Santo-Andre).

### Errejota Bangalô Bar

ID: `errejota-bangalo-bar`. Endereço publicado: Alameda São Caetano, 366 - Jardim, Santo André - SP, 09070-210.

Bio própria confirma nome e toda a grade publicada. Alameda São Caetano, 366 corroborada em diretórios. Diretório de origem diverge na abertura de qua/sex e domingo; prioridade do perfil mantida com aviso.

Coordenadas: -23.645692, -46.5422292; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/errejota-bangalo-bar/660d1abfa3f2688d6da690ef), [Fonte 2](https://www.instagram.com/errejotabangalobar/), [Fonte 3](https://restaurantguru.com.br/Errejota-Bangalo-Bar-Santo-Andre).

### 52’s Rock Bar

ID: `52-s-rock-bar`. Endereço publicado: R. Olegário Herculano, 192 - Vila Dayse, São Bernardo do Campo - SP, 09732-570.

Bio própria identifica 52’s Rock Bar, Olegário Herculano, 192 e sex/sáb 19–02; abertura alterada de 18h para 19h. Diretórios ainda mostram 18h e bairro Anchieta/Vila Dayse. Mantido bairro de origem, conflito registrado; canal do card passa a ser o perfil próprio.

Coordenadas: -23.6823889, -46.5579995; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/sao-bernardo-do-campo-sp/52-s-rock-bar/660be73ad622f2b541167f98), [Fonte 2](https://www.instagram.com/52srockbar/).

### Mocergo

ID: `mocergo`. Endereço publicado: R. Siqueira Campos, 1039 - Vila Assunção, Santo André - SP, 09020-240.

Bio própria informa qui 18–01, sex 19–01, sáb 18–01, dom 17–22. Corrigidos quinta e domingo, mantendo demais dias. Rua Siqueira Campos, 1039 corroborada em diretórios; bairro Centro/Vila Assunção divergente. Grade do perfil priorizada e aviso registrado.

Coordenadas: -23.6635697, -46.5283778; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/mocergo/636e4602b46ef06da8425c91), [Fonte 2](https://www.instagram.com/mocergo_), [Fonte 3](https://restaurantguru.com.br/Mocergo-Santo-Andre).

### Jim Jones Pub

ID: `jim-jones-pub`. Endereço publicado: R. Santo André, 157 - Vila Assunção, Santo André - SP, 09020-230.

Rua Santo André, 157 corroborada na fonte; bairro Centro/Vila Assunção divergente. Diretório usa ter/sex 16–02, sáb 15–02 e dom 15–01, diferente do Google 05/10. Mantida grade do Google com ressalva, sem importar a mais longa sem confirmação.

Coordenadas: -23.663435399999997, -46.528063; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/santo-andre-sp/jim-jones-pub/660d1abca3f2688d6da690ee).

### Lajje Beer

ID: `lajje-beer`. Endereço publicado: R. Continental, 59 - Sobreloja - Jardim do Mar, São Bernardo do Campo - SP, 09750-060.

Rua Continental, 59 e grade coincidem nos diretórios. Complemento Sobreloja acrescentado conforme fonte de origem e Maps de 05/10. Facebook não entregou conteúdo operacional utilizável.

Coordenadas: -23.6855178, -46.555526; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/sao-bernardo-do-campo-sp/lajje-beer/66c7a83df99178ff5747437e), [Fonte 2](https://www.facebook.com/4x4lajjebeer/), [Fonte 3](https://restaurantguru.com.br/Lajje-Beer-Sao-Bernardo-do-Campo).

### Flag The Bar

ID: `flag-the-bar`. Endereço publicado: Av. Kennedy, 304 - Vila Marli, São Bernardo do Campo - SP, 09726-251.

Kennedy, 304 e categoria de bar corroboradas; site próprio não acessível. Diretório abre segunda e usa outros horários; Waze também diverge. Preservada grade do Google de 05/10 com ressalva até fonte primária.

Coordenadas: -23.686526699999998, -46.559231; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/sao-bernardo-do-campo-sp/flag-the-bar/660bbd45d622f2b541167108), [Fonte 2](https://flagthebar.com.br/).

### Leandrini Rock Bar

ID: `leandrini-rock-bar`. Endereço publicado: Rua Oswaldo Cruz, 1411 - Santa Paula, São Caetano do Sul - SP, 09540-280.

Nome/endereço corroborados em diretórios. Site próprio anuncia qua/dom 17–02, distinto da grade detalhada do Google 05/10 e dos diretórios. Mantida decisão já registrada no projeto: grade detalhada e aviso de conflito; resolver com a casa antes de considerá-la confirmada.

Coordenadas: -23.629298900000002, -46.5675424; correspondência com a fonte cadastrada, entrada física não certificada.

Fontes consultadas: [Fonte 1](https://www.locaisdobrasil.com.br/encontre/bares/sao-caetano-do-sul-sp/leandrini-rock-bar/660f6f97a451b0ad1fb9c3dc), [Fonte 2](https://leandrinirockbar.com/), [Fonte 3](https://restaurantguru.com.br/LEANDRINI-ROCK-BAR-Sao-Caetano-do-Sul).

## Pendências para a próxima etapa

1. Confirmar identidade, funcionamento presencial e grade de Virtus e After, sem reaproveitar dados de nomes ou endereços diferentes.
2. Verificar rua/número, município e entrada do Cissão. Coordenadas coincidem com a fonte, mas a descrição de endereço não é suficiente para certificá-las fisicamente.
3. Obter coordenadas verificadas da Mais Adega; conferir entradas dos locais com pontos próximos, especialmente Supra Direito/Bernô.
4. Resolver os conflitos restantes com fonte primária atual ou ficha Google acessível, especialmente Leandrini, Flag, Jim Jones e bairros divergentes.
5. Fazer a conferência em celular real prevista no plano, em etapa própria.

## Verificações desta tarefa

- 19 testes Node (`tests/auth-ui.cjs` e `tests/location.cjs`) aprovados nesta máquina.
- Sintaxe de `js/data.js` aprovada.
- Conferência pontual em Node: 32 IDs únicos e 32 fichas de revisão; 31 pontos correspondentes às fontes; fotos, preços, movimento histórico e coordenadas preservados; três grades novas e limites de abertura/fechamento/madrugada aprovados.
- CSV central: 539 registros e 11 colunas originais preservados; somente campos atuais dos 32 atualizados. CSV publicado sincronizado com os 32 locais e com as fontes de fotos anteriores preservadas.
- `git diff --check` aprovado.

Nenhum teste de navegador/celular real, suíte PHP, consulta ao banco ou alteração de contas nesta tarefa. Verificações anteriores documentadas em outros relatórios não foram reexecutadas, exceto as suítes Node indicadas acima.
