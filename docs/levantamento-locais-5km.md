# Levantamento de estabelecimentos — Fundação Santo André, raio de 5 km

Consulta realizada em 05/10/2026. Submundo 808 fica fora desta etapa: é uma produção/evento itinerante, não um estabelecimento fixo.

## Arquivos para consultar

- [Lista por categoria, com nomes, endereços, horários e fontes](lista-locais-5km.md).
- [Planilha CSV para Excel](locais-5km.csv), UTF-8 com BOM e separador ponto e vírgula.
- [Dados JSON, coordenadas, fontes, horários estruturados e registro das páginas consultadas](levantamento-locais-5km.json).

Estado atual: o site tem 22 lugares selecionados, sendo 17 deste levantamento e 5 de pesquisas complementares. Em 05/10/2026, os 533 candidatos receberam uma curadoria de perfil para rolê/resenha em [curadoria-role-5km.md](curadoria-role-5km.md). A planilha original mantém os registros e ganhou colunas de classificação, motivo, fontes e pendências; [locais-role-prioritarios.csv](locais-role-prioritarios.csv) reúne 67 candidatos prioritários ainda fora do site. Essa triagem não importou novos lugares no catálogo ou no banco.

## Marco e distância

Marco: campus da Fundação Santo André, Av. Príncipe de Gales, 821, Santo André. Município confirmado pelo [site da FSA](https://www2.fsa.br/home/). Ponto representativo do campus: latitude -23.66145, longitude -46.55402, conforme [Mapcarta/OpenStreetMap](https://mapcarta.com/pt/W585209002). A página cartográfica tem um rótulo territorial inconsistente; usamos suas coordenadas, não esse rótulo para definir o município.

Distância calculada por Haversine em linha reta, com limite de 5 km. Não é distância de carro ou caminhada, e o ponto não representa uma portaria específica. Coordenadas de diretório são aproximadas; locais perto da borda precisam de revisão do ponto no mapa.

## Cobertura obtida

Consultadas 115 páginas públicas do Locais do Brasil, incluindo todas as páginas de resultados acessíveis pelas paginações descobertas para bares, fornecedores de bebidas, buffets, casas noturnas e salões de festas em Santo André, São Bernardo do Campo, São Caetano do Sul e Diadema. As tentativas adicionais nas categorias `adegas` e `casa-de-shows` não retornaram registros estruturados; ausência de resultado não significa ausência de estabelecimentos. Todas as URLs e contagens estão no JSON.

Foram coletados **994 registros distintos por URL**, dos quais **530 têm coordenadas indicadas dentro do raio** e 464 ficam fora. A pesquisa complementar adicionou Bernô, Adega Tonel e Adega Digão: **533 registros candidatos no conjunto final**. Não houve duplicatas exatas por nome e endereço; isso não elimina aliases, mudanças de nome ou duas operações no mesmo espaço.

| Categoria publicada ou complementar | Registros no raio |
|---|---:|
| Bares | 280 |
| Fornecedores de bebidas | 64 |
| Adegas da pesquisa complementar | 2 |
| Casas noturnas, incluindo Bernô | 36 |
| Salões de festas | 39 |
| Buffets | 112 |
| Total de candidatos | 533 |

**Não é possível afirmar que são TODOS os estabelecimentos existentes ou atualmente ativos.** Diretórios podem omitir negócios, preservar cadastros antigos e classificar atividades incorretamente. O resultado cobre os registros encontrados nas fontes consultadas; não é um censo comercial. A consulta espacial ampla ao Overpass/OpenStreetMap falhou por indisponibilidade/rejeição dos endpoints e não foi usada como comprovação de cobertura.

## Os dois Supras

| Nome | Endereço publicado | Distância aproximada | Horário encontrado |
|---|---|---:|---|
| Supra Direito SBC | Rua Java, 299 — Jardim do Mar, São Bernardo do Campo | 3,18 km | Seg–sex 09h–00h; sáb 16h–00h; dom fechado |
| Supra Bernô | Rua Marli, 26 — Jardim do Mar, São Bernardo do Campo | 3,18 km | Grade semanal não localizada; depende da agenda publicada |

**Ambos aparecem dentro dos 5 km pelas coordenadas consultadas.** Direito: endereço e horário publicados na [página oficial da unidade](https://suprabar.com.br/direito-sbc/); coordenadas do diretório Locais do Brasil. Bernô: endereço e coordenadas no [Restaurant Guru](https://restaurantguru.com.br/Supra-Bar-Berno-Sao-Bernardo-do-Campo), endereço também publicado pelo organizador na [Blacktag](https://www.blacktag.com.br/eventos/33175/supra-berno-sabado-03-10).

As coordenadas das duas entradas são quase coincidentes. Não concluir que são dois prédios independentes: podem compartilhar espaço, ter acessos distintos ou refletir geocodificação semelhante. Preservar os dois nomes e endereços até confirmar a relação entre as operações.

O evento Bernô de 03/10 informa abertura às 22h e encerramento às 05h; isso é horário daquele evento, não uma grade semanal permanente.

## Fontes oficiais e conflitos identificados

- **Adega Tonel do Rudge**, Rua Afonsina, 316; aproximadamente 1,56 km. [Site oficial](https://www.adegatonel.com.br/): ter–sex 08h45–18h30, sáb 08h–18h, dom/seg fechado. Fontes secundárias antigas indicam domingo aberto e início às 08h30; priorizar o site oficial. Coordenadas obtidas no Restaurant Guru.
- **Adega Digão Tabacaria**, Av. Bispo César Dacorso Filho, 218; aproximadamente 2,13 km. [Fonte secundária](https://www.benditoguia.com.br/empresa/adega-digao-tabacaria-rudge-ramos-sao-bernardo-do-campo-sp); horário não localizado, funcionamento atual pendente.
- **Buffet Ocean Drive**, Av. Padre Anchieta, 208; aproximadamente 2,43 km. Endereço no [site oficial](https://www.oceandrive.com.br/index.html). Diretório publica seg–sáb 10h–18h; provavelmente atendimento comercial. Não apresentar como horário das festas.
- **Supra Dom Pedro**, Av. Dom Pedro II, 1254; aproximadamente 2,44 km. Também consta no levantamento. Fonte oficial: [unidade Dom Pedro](https://suprabar.com.br/dom-pedro-sa/).
- **Supra Metodista**, Rua do Sacramento, 274. [Fonte oficial](https://suprabar.com.br/metodista/): ter–sex 17h–23h, sáb 16h–23h, dom/seg fechado. Diretório antigo informa número 280 e horários diferentes; coordenada não coletada, mantido nas pendências sem contagem no raio.
- **Adega Planet Express**, Av. Helvétia, 808. [Site oficial](https://adegaplanet.com.br/) diverge entre fechamento às 23h e 01h nas sextas/sábados; [blog da própria casa](https://adegaplanet.com.br/blogs/news/adega-no-taboao-sao-bernardo-planet-express) indica 01h. Raio não confirmado: câmera do mapa a cerca de 5,2 km não prova posição da loja. Não entrou na contagem dos 533.
- **Adega 2 Irmãos**, Rua Itabaiana, 117, Vila Príncipe de Gales. [Solutudo](https://www.solutudo.com.br/empresas/sp/sto-andre/adegas/adega-2-irmaos-21998616): coordenadas e horários não confirmados, mantida nas pendências.

## Como interpretar os dados brutos

O JSON-LD do Locais do Brasil troca os campos latitude e longitude nos registros coletados. A normalização reconheceu latitude próxima de -23 e longitude próxima de -46. Os valores originais e o indicador da inversão foram preservados para auditoria.

Horários foram preservados como publicados. Há 44 registros sem horário localizado no conjunto final. Dia ausente na especificação significa **desconhecido**, não fechado. Encerramento menor que abertura pode representar a madrugada do dia seguinte. Verificar atendimento em feriados e eventos especiais diretamente com o local.

Categorias são amplas: fornecedor de bebidas pode ser depósito ou distribuidora de água; buffet pode ser restaurante ou serviço sem salão; casa noturna pode representar outro tipo de atividade. O cadastro “Mec Nilson Ltda _ Refrigeracao Ar Condicionado”, por exemplo, deve ser excluído do catálogo de lazer até evidência diferente. Os registros brutos continuam preservados, com pendências na planilha/JSON.

Arena Texas e Golden Hall exigem confirmação de operação atual, pois existem registros empresariais históricos conflitantes. Cadastro empresarial encerrado, isoladamente, não comprova que um ponto comercial deixou de funcionar sob outra empresa. Não publicar como ativo sem confirmação.

Para substituir os demos: revisar tipo da atividade, endereço completo, posição do mapa e operação atual; priorizar site/perfil oficial para horários; deixar informação ausente como desconhecida. Fotos, preços, lotação, classificação etária e agenda de eventos não foram pesquisados como dados permanentes nesta etapa.
