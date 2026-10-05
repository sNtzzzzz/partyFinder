# Inventário dos dados demonstrativos

Levantamento do código em 05/10/2026, antes da pesquisa de dados reais. Nenhum estabelecimento, artista, endereço, agenda ou foto foi validado externamente nesta etapa. Um nome coincidir com uma entidade real não valida as informações associadas no protótipo.

## Catálogo atual: 8 eventos, 7 locais e 5 artistas

Fonte: `js/data.js`. Todas as linhas abaixo são exemplos. A cidade e o ano são acrescentados pelos componentes: São Paulo/SP e 2026. Horários são textos de eventos, não horários semanais de funcionamento dos locais.

| ID interno | Evento | Local | Bairro e endereço | Data / horário | Artista | Categoria / status fixo |
| --- | --- | --- | --- | --- | --- | --- |
| subsolo | Além da meia-noite | Subsolo Club | Vila Madalena; Rua Harmonia, 520 | SEX 09 OUT; 23:00–05:00 | Vintage Culture | Festas; Aberto agora |
| terraco | Uma noite lá em cima | Terraço 011 | Pinheiros; Rua dos Pinheiros, 870 | SEX 09 OUT; 19:00–02:00 | DJ Luma | Bares; Últimos ingressos |
| jazz | Jazz à meia-luz | Sótão Jazz Bar | Vila Buarque; Rua General Jardim, 210 | SEX 09 OUT; 20:00–02:00 | Caio Bossa | Música ao vivo; Aberto agora |
| frequencia | Frequência independente | Casa Aurora | Barra Funda; Rua Vitorino Carmilo, 430 | SEX 09 OUT; 22:00–04:00 | Coletivo Frequência | Shows; Aberto agora |
| groove | Into the groove | Audio Club | Água Branca; Av. Francisco Matarazzo, 694 | SÁB 10 OUT; 22:00–06:00 | Vintage Culture | Festas; Começa em breve |
| soul | Soul sessions | Casa de Francisca | Sé; Rua Quintino Bocaiúva, 22 | SÁB 10 OUT; 20:00–01:00 | Marina Reis | Música ao vivo; Esgotado |
| domingo | Domingo em vinil | Pátio Discos | Pinheiros; Rua Artur de Azevedo, 980 | DOM 11 OUT; 17:00–23:00 | DJ Luma | Bares; Fechado |
| patio | Encontros no pátio | Casa Aurora | Barra Funda; Rua Vitorino Carmilo, 430 | QUI 08 OUT; 16:00–22:00 | Coletivo Frequência | Shows; Encerrado |

Casa Aurora aparece em dois eventos. Os sete locais não têm registros próprios: nome/endereço estão repetidos em objetos de evento. O campo `id` identifica o exemplo de evento; não é identificador externo de local.

### Todos os campos dos objetos

| Campo | Estado atual | O que buscar ou preparar |
| --- | --- | --- |
| `id` | Identificador interno do exemplo | ID estável gerado pelo nosso cadastro; não depende de pesquisa |
| `name` | Título demonstrativo do evento | Nome oficial e edição do evento |
| `venue` | Nome de local sem validação | Nome oficial; distinguir casa, organizador e marca de festa |
| `district`, `address` | Bairro e endereço sem validação | Endereço completo, bairro, município, UF, CEP e complemento |
| `time` | Intervalo de evento escrito como texto | Início/fim completos do evento; separado dos horários semanais da casa |
| `artist` | Um nome por evento, associação demonstrativa | Line-up publicado; permitir vários artistas e horários se disponíveis |
| `category` | Festas, Bares, Shows ou Música ao vivo | Conferir classificação; separar tipo de estabelecimento de tipo de evento |
| `day` | `today`, `tomorrow`, `weekend`, `past` definidos manualmente | Derivar da data real e do fuso, em vez de persistir etiquetas relativas |
| `date`, `weekday` | 08–11 OUT, QUI–DOM | Data completa e fuso; derivar rótulos para exibição |
| `status` | Texto fixo, sem cálculo ou fonte | Separar funcionamento da casa, andamento do evento e disponibilidade de ingressos |
| `price` | `null` em todos os oito eventos | Valor, moeda, lote/faixa, taxas, condições de gratuidade e data da consulta; manter desconhecido se não houver fonte |
| `occupancy` | `null` em todos | Não há medição ou fonte de movimento ao vivo; capacidade máxima não comprova lotação atual |
| `distance` | `null`; não é usado pelo cálculo atual | Distância deve ser calculada com coordenadas e localização autorizada, não pesquisada como número fixo |
| `tickets` | `false` em todos | Link oficial de venda/reserva, disponibilidade e política; o site não possui checkout real |
| `image` | Foto ilustrativa do Unsplash | Imagem correspondente ao local/evento, origem, autorização/licença, crédito e texto alternativo |
| `description` | Texto promocional inventado por evento | Descrição factual baseada em programação e características confirmadas |

`coordinates` não existe nos oito objetos. `js/location.js` espera `{ latitude, longitude }` para calcular distância em linha reta. Precisaremos das coordenadas verificadas dos locais. Coordenadas do visitante vêm da geolocalização real do navegador e ficam em memória.

### Afirmações nas descrições

Além dos títulos, verificar antes de reutilizar: house e pista intimista no Subsolo; drinks autorais, disco e terraço no Terraço 011; jazz/brasilidades e sessão ao vivo no Sótão; cena independente e **entrada gratuita** na Casa Aurora; house/techno no Into the groove; soul/R&B no Soul sessions; vinil e mesas na calçada no Pátio; edição anterior e próximas edições da Casa Aurora.

Há inconsistências de exemplos: Casa Aurora afirma gratuidade na descrição, mas `price` está desconhecido; Terraço 011 diz “Últimos ingressos”, mas `tickets` é falso. Não tratar esses textos como disponibilidade confirmada.

## Artistas e imagens

Fonte: array `artists` em `js/data.js`. Os cinco nomes são Vintage Culture, Marina Reis, DJ Luma, Coletivo Frequência e Caio Bossa. Cada registro contém somente `name` e `image`. Fotos não são retratos verificados. Nomes precisam de identificação oficial, sem presumir que homônimos sejam a pessoa pretendida. Vínculos com eventos precisam de line-up confirmado.

Há sete IDs únicos de fotos Unsplash no conjunto de dados:

| ID de foto | Usos atuais |
| --- | --- |
| photo-1571266028243-d220c9b3b157 | Vintage Culture e Into the groove |
| photo-1516280440614-37939bbacd81 | Marina Reis e Soul sessions |
| photo-1487180144351-b8472da7d491 | DJ Luma e Domingo em vinil |
| photo-1506157786151-b8491531f063 | Coletivo Frequência e os dois eventos da Casa Aurora |
| photo-1511192336575-5a79af67a629 | Caio Bossa e Jazz à meia-luz |
| photo-1470229722913-7c0e2dbbafd3 | Além da meia-noite e foto principal de `index.html` |
| photo-1514933651103-005eec06c04b | Uma noite lá em cima |

A foto principal pode continuar como imagem editorial ilustrativa se identificada e licenciada adequadamente; ela não comprova localização em São Paulo. Fotografias dos cards de artistas/locais exigem correspondência com a entidade apresentada.

## Dados e textos fixos fora do catálogo

| Arquivo / função | Informação atual | Trabalho posterior |
| --- | --- | --- |
| `js/data.js`, comentário inicial | Cenário de 09/10/2026 às 23h30 | É contexto fictício; não existe relógio de operação baseado nessa hora |
| `js/components.js`, `Header` | São Paulo, SP | Localidade fixa inicial; `renderLocation` substitui por “Localização ativada/desativada”, sem descobrir cidade |
| `js/components.js`, `isOpen` | Hoje + status “Aberto agora” ou “Últimos ingressos” | Não consulta horário atual; calcular funcionamento com calendário, fuso, virada de dia e exceções |
| `js/components.js`, `canBook` | `tickets` + ausência de “Encerrado/Esgotado” | Não consulta vendedor; implementar destino oficial e estado de disponibilidade |
| `js/components.js`, `UpcomingRow` | Mês OUT para qualquer linha | Formatar a partir da data completa |
| `js/components.js`, `EventDetail` | Ano 2026; cidade São Paulo — SP | Usar data/localidade de cada registro |
| `js/components.js`, `EventDetail`, seção A casa | Ambiente intimista, bar e espaço para dançar; maiores de 18; documento com foto | Características, classificação etária e regras específicas de cada local/evento |
| `js/components.js`, `EventDetail` | “Mapa ilustrativo · endereço fictício” | Não existe mapa geográfico; usar coordenadas/link de mapa confirmado |
| `js/components.js`, cards/detalhes | Alts “Ambiente ilustrativo” / “Fotografia musical ilustrativa” | Ajustar ao conteúdo das imagens após obter as fotos corretas |
| `js/components.js`, `ArtistCard` | Número de eventos na agenda | Número derivado dos exemplos com `day !== past`; recalcular sobre agenda real |
| `js/components.js`, `EventDetail` e `Footer` | Avisos de evento demonstrativo e protótipo | Atualizar quando os dados correspondentes forem validados; não retirar avisos antes |
| `js/components.js`, `Footer` | © 2026 | Texto institucional, não agenda; pode usar ano atual |
| `js/app.js`, cabeçalhos | “DADOS DEMONSTRATIVOS” e “10 — 11 OUTUBRO” | Período deve acompanhar agenda e estado de validação |
| `js/app.js`, filtros/lista futura | Datas relativas baseadas nas tags fixas `day` | Derivar de datas completas e relógio atual |
| `js/app.js`, compra | Mensagem de demonstração, sem pagamento/reserva | Dados reais não tornam compra implementada; destino de ingresso é decisão separada |
| `index.html`, hero | “SÃO PAULO / AFTER DARK” + foto genérica | Texto editorial de região; não localização comprovada da foto |
| `index.html`, `.location-note` | “Distâncias ilustrativas a partir de Pinheiros, São Paulo” | Texto inicial antigo, substituído por JS; cálculo atual não usa Pinheiros como origem |
| `index.html`, conteúdo inicial do modal de conta | Perfis “em breve” e convite para demonstração | Placeholder antigo substituído por `auth.js`; contas já funcionam |
| `js/location.js`, mensagens e nota | Busca com exemplos e ausência de locais cadastrados | Ajustar estados vazios conforme existência real de coordenadas/catalogo |
| `README.md`, `README-v2.md`, `CONTEXTO.md`, `AGENTS.md` | Descrição do cenário e catálogo demonstrativo | Atualizar documentos e instruções quando a transição realmente ocorrer |

Faixas de filtro (1/3/5 km, R$ 0/50/100), raio de proximidade de 5 km, limite de três cards próximos, nomes de categorias e níveis de movimento são escolhas do produto, não fatos pesquisados. Não precisam de substituição automática por dados externos. Fontes Google Fonts, ícones, marca e textos institucionais também não são registros fictícios do catálogo.

## Dados que faltam para cadastrar locais reais

1. **Identidade:** nome oficial, tipo do lugar, descrição factual e URLs oficiais/contato público.
2. **Endereço:** logradouro, número, complemento, bairro, cidade, UF, CEP, latitude e longitude.
3. **Funcionamento:** dias da semana, abertura/fechamento, intervalos, virada de dia, fuso e exceções (feriados, fechamentos, operação só em eventos).
4. **Regras:** idade mínima, condições de entrada, acessibilidade e estrutura quando houver confirmação.
5. **Imagens:** fotos adequadas, crédito, autorização/licença e vínculo com o lugar.
6. **Rastreabilidade:** fonte de cada informação, data da verificação e observações sobre conflitos ou ausência de dados.

Para cada **evento**, buscar separadamente título/edição, organizador, local vinculado, início/fim com data completa, line-up, descrição, classificação, cartaz/foto e informação de ingresso/preço em fonte oficial. Um bar existir não comprova uma festa específica ou uma atração naquele dia.

## Dependências da substituição

Hoje o catálogo vive no JavaScript; o backend e as três migrations existentes atendem somente contas. Não há tabelas de locais, horários, eventos ou artistas nem API pública de catálogo. O planejamento em `README-v2.md` propõe essa separação, mas ela ainda precisa ser implementada.

Antes de conectar uma fonte dinâmica, revisar a renderização: vários campos de eventos/artistas são interpolados diretamente em `innerHTML`. Dados de cadastro/API precisam de escaping, validação de URLs e controle de identificadores, como já existe em partes da interface de conta.

Prioridade proposta para coleta: escolher os primeiros locais → confirmar identidade/endereço → horários/coordenadas → fotos/regras → eventos efetivamente publicados. Os nomes Supra Berno, Supra Direito e Submundo 808 aparecem apenas como referências no planejamento; ainda não são registros do catálogo e precisam ser identificados como local, festa ou organizador.

Usuários locais e fixtures das suítes de teste não fazem parte desta substituição. Fixtures são exemplos intencionais para testes e devem continuar isoladas. Preços, lotação e coordenadas ausentes devem permanecer desconhecidos até haver informação confirmada; não inferir movimento ao vivo a partir de horários, capacidade ou popularidade.
