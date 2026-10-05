# Curadoria de rolês — FSA, raio de 5 km

Pesquisa e classificação em **05/10/2026**. Todos os **533 candidatos** receberam uma decisão, motivo, fontes e próxima ação em [locais-5km.csv](locais-5km.csv). Os registros originais, endereços, coordenadas e horários foram preservados; a curadoria acrescenta colunas e não altera o catálogo do site.

## Resultado

| Classificação | Quantidade |
|---|---:|
| Já publicado | 17 |
| Priorizar — perfil corroborado | 67 |
| Potencial — confirmar perfil/operação | 160 |
| Pendente — consumo no local | 38 |
| Pendente — perfil não esclarecido | 26 |
| Pendente — fontes conflitantes | 4 |
| Pendente — confirmar operação/agenda | 3 |
| Baixa prioridade — sem evidência de rolê | 163 |
| Fora do foco atual | 29 |
| Não incluir — indicação de fechamento | 26 |
| **Total** | **533** |

Há **67 candidatos prioritários ainda fora do site**, listados em [locais-role-prioritarios.csv](locais-role-prioritarios.csv). O site mantém **22 locais**, dos quais **17** pertencem ao levantamento e os demais vieram de pesquisas complementares. Prioritário significa perfil corroborado e bom candidato para validar/cadastrar; não significa aprovação automática nem funcionamento confirmado hoje.

## Critérios

- Priorizar locais com ficha correspondente ao endereço e descrição de consumo/socialização: bebidas e petiscos, música ao vivo, karaokê ou jogos.
- Manter bares com informações genéricas como potenciais, sem inventar características.
- Para adegas, venda de bebidas, copão ou tabacaria não basta: verificar permanência, mesas e consumo no local.
- Buffets infantis, fornecedores de água, serviços de evento e equipamentos ficam fora do foco. Restaurantes, distribuidores e espaços de locação sem evidência específica recebem baixa prioridade; não são descartados definitivamente só pela categoria.
- Casa noturna não significa automaticamente balada universitária: esclarecer proposta, acesso e programação. Serviços explicitamente adultos ficam fora dessa seleção.
- Não publicar locais com indicação de encerramento. Fontes conflitantes ficam pendentes; CNPJ ativo, baixado ou inapto isoladamente não prova operação física.
- Não inferir renda, idade, preço acessível ou predominância universitária a partir do bairro, nome ou nota. A adequação para resenha é uma inferência editorial baseada no perfil descrito.

## Como foi pesquisado

Foram feitas **906 consultas HTTP** às fontes originais dos 533 candidatos e a fichas secundárias de bares/adegas/casas noturnas, além de buscas complementares para nomes/endereço conflitantes e canais próprios. **532 candidatos** tiveram ao menos uma ficha identificada; **163** tiveram ficha secundária adicional correlacionada. Resultado sem ficha, HTTP 404, timeout ou redirecionamento para outra empresa não significa que o estabelecimento fechou.

A correlação exige nome/localidade/endereço compatíveis; telefone empresarial e ponto geográfico próximos foram usados como corroboração quando a rua estava incompleta. Resultados sem correspondência não fundamentam recomendações. Menções de outros restaurantes no rodapé foram excluídas da análise de perfil. Foram usadas fichas públicas e, quando encontrados, sites próprios/portais de eventos; esta pesquisa não é uma leitura direta de todas as fichas do Google Maps nem uma confirmação presencial.

Fontes e decisões por registro em [curadoria-role-5km.json](curadoria-role-5km.json). O JSON original do levantamento permanece intacto. O arquivo privado backend/storage/survey-venues contém material de apoio e não é servido pelo site.

## Primeiros candidatos a validar

| Local | Perfil | Município | Distância original (km) | Fonte do perfil |
|---|---|---|---:|---|
| Bar Do Cissão | Bar para conversa e bebidas | Santo André | 0.231 | [Consultar](https://restaurantguru.com.br/Bar-Do-Cissao-Santo-Andre) |
| Espaço Bere. | Bar para conversa e bebidas | São Bernardo do Campo | 0.81 | [Consultar](https://restaurantguru.com.br/Espaco-Bere-Sao-Bernardo-do-Campo) |
| Bar do Jânio | Bar para conversa e bebidas | Santo André | 1.588 | [Consultar](https://restaurantguru.com.br/Bar-do-Janio-Santo-Andre) |
| Bar da Dalva | Bar para conversa e bebidas | Santo André | 1.595 | [Consultar](https://restaurantguru.com.br/Bar-da-Dalva-Santo-Andre) |
| Bar e Lanchonete do Dú | Bar para resenha e jogos | São Caetano do Sul | 1.645 | [Consultar](https://restaurantguru.com.br/Bar-e-Lanchonete-do-Du-Sao-Caetano-do-Sul) |
| Rota Music Bar | Bar com música e petiscos | São Bernardo do Campo | 1.823 | [Consultar](https://restaurantguru.com.br/Rota-do-Acai-Sao-Bernardo-do-Campo) |
| Bar e Restaurante Potiguar | Bar para conversa e bebidas | São Bernardo do Campo | 1.83 | [Consultar](https://restaurantguru.com.br/Bar-e-Restaurante-Potiguar-Sao-Bernardo-do-Campo-2) |
| Bar do Jão | Bar para conversa e bebidas | Santo André | 1.866 | [Consultar](https://restaurantguru.com.br/Bar-do-Jao-Santo-Andre) |
| Tatu Bola Bar | Bar com música e happy hour | São Bernardo do Campo | 1.873 | [Consultar](https://www.tripadvisor.com.br/Restaurant_Review-g303626-d13341451-Reviews-Tatu_Bola_Bar_Sao_Bernardo-Sao_Bernardo_Do_Campo_State_of_Sao_Paulo.html) |
| Virandos Bar | Bar para conversa e bebidas | Santo André | 1.95 | [Consultar](https://restaurantguru.com.br/Virandos-Bar-Santo-Andre) |
| BAR RECANTO DA GALERA | Bar para conversa e bebidas | Santo André | 1.952 | [Consultar](https://restaurantguru.com.br/BAR-RECANTO-DA-GALERA-Santo-Andre) |
| Recanto Dois Irmãos | Bar para conversa e bebidas | Santo André | 1.985 | [Consultar](https://restaurantguru.com.br/Recanto-Dois-Irmaos-Santo-Andre) |
| Muquiranas Bar | Bar para conversa e bebidas | Santo André | 1.99 | [Consultar](https://restaurantguru.com.br/Muquiranas-Bar-Santo-Andre) |
| Botequim Do Orestes | Bar com música ao vivo | Santo André | 2.037 | [Consultar](https://restaurantguru.com.br/Botequim-do-Orestes-Santo-Andre) |
| Errejota Bangalô Bar | Bar com música ao vivo | Santo André | 2.124 | [Consultar](https://restaurantguru.com.br/Errejota-Bangalo-Bar-Santo-Andre) |
| Brasa Chopp e Parrilla | Bar com música ao vivo | São Bernardo do Campo | 2.316 | [Consultar](https://restaurantguru.com.br/Brasa-Chopp-e-Parrilla-Sao-Bernardo-do-Campo) |
| Espaço Aberto Music Bar | Bar/karaokê | Santo André | 2.346 | [Consultar](https://restaurantguru.com.br/Espaco-Aberto-Music-Bar-Santo-Andre) |
| 52'' s Rock Bar | Rock ao vivo e drinks | São Bernardo do Campo | 2.363 | [Consultar](https://www.findglocal.com/BR/S%C3%A3o-Bernardo-do-Campo/1779091045685097/52%27s-Rock-Bar) |
| Boteco Kazu - Bar e Espetaria. | Bar para conversa e bebidas | São Bernardo do Campo | 2.475 | [Consultar](https://restaurantguru.com.br/Boteco-Kazu-Bar-e-Espetaria-Sao-Bernardo-do-Campo) |
| Bar do Pascoal | Bar para conversa e bebidas | Santo André | 2.517 | [Consultar](https://restaurantguru.com.br/Wells-Bar-Santo-Andre) |
| Boteco Adoniran | Bar/karaokê | São Bernardo do Campo | 2.591 | [Consultar](https://restaurantguru.com.br/Boteco-Adoniran-Sao-Bernardo-do-Campo) |
| Mocergo | Bar alternativo para conversa e drinks | Santo André | 2.622 | [Consultar](https://restaurantguru.com.br/Mocergo-Santo-Andre) |
| Jim Jones Pub | Pub para amigos e drinks | Santo André | 2.653 | [Consultar](https://www3.santoandre.sp.gov.br/turismosantoandre/bares-e-cervejarias/) |
| Lajje Beer | Bar/karaokê | São Bernardo do Campo | 2.681 | [Consultar](https://restaurantguru.com.br/Lajje-Beer-Sao-Bernardo-do-Campo) |
| O Beco Torto | Bar/karaokê | Santo André | 2.773 | [Consultar](https://restaurantguru.com.br/O-Beco-Torto-Santo-Andre) |
| Tropical | Bar para conversa e bebidas | Santo André | 2.829 | [Consultar](https://restaurantguru.com.br/Tropical-Santo-Andre) |
| Flag The Bar | Happy hour e música ao vivo | São Bernardo do Campo | 2.838 | [Consultar](https://flagthebar.com.br/) |
| Bar da Tilápia | Bar com música ao vivo | Santo André | 2.888 | [Consultar](https://restaurantguru.com.br/Bar-da-Tilapia-Santo-Andre) |
| Carioca Bar | Bar com música ao vivo | São Caetano do Sul | 2.919 | [Consultar](https://restaurantguru.com.br/Carioca-Bar-Sao-Caetano-do-Sul) |
| Bar Do Estevão | Bar para conversa e bebidas | São Caetano do Sul | 3.047 | [Consultar](https://restaurantguru.com.br/Bar-Do-Estevao-Sao-Caetano-do-Sul) |
| Bar da Codorna | Bar para conversa e bebidas | São Caetano do Sul | 3.13 | [Consultar](https://restaurantguru.com.br/Bar-da-codorna-Sao-Caetano-do-Sul) |
| Bar Do Pancho | Bar com música ao vivo | Santo André | 3.134 | [Consultar](https://restaurantguru.com.br/Bar-Do-Pancho-Santo-Andre) |
| Taberna Vieira | Bar para conversa e bebidas | São Bernardo do Campo | 3.172 | [Consultar](https://restaurantguru.com.br/Taberna-Vieira-Sao-Bernardo-do-Campo) |
| Boteco 5 Esquinas | Bar com música ao vivo | Santo André | 3.188 | [Consultar](https://restaurantguru.com.br/Boteco-5-Esquinas-Santo-Andre) |
| Retrô Pub | Bar para resenha e jogos | São Bernardo do Campo | 3.326 | [Consultar](https://restaurantguru.com.br/Retro-Pub-Sao-Bernardo-do-Campo) |

A seleção completa não se limita aos 35 exemplos desta tabela. Para cadastrar, confirmar funcionamento e endereço, conferir horário e foto própria, e manter campos desconhecidos como não confirmados. Eventos antigos comprovam o perfil histórico, mas não a agenda de 2026. Nenhum novo local foi importado automaticamente nesta etapa.
