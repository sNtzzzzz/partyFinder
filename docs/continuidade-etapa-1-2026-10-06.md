# Continuação da etapa 1 no notebook — 06/10/2026

## Dados aplicados

- **Virtus**, R. Adolfo Laves, 327: domingo fechado; segunda–quinta 11:00–14:00; sexta/sábado 11:00–22:00. Grade principal da seção Outros horários; entrega e almoço têm grades diferentes e não foram usadas para o salão. A busca inicial trouxe também VIRTUS LANCHONETE E CIA na Rua São Francisco, 55, descartada por outro endereço. [Ficha consultada](https://www.google.com/maps/search/?api=1&query=Virtus+Beer+Adolfo+Laves+327+Santo+Andre).
- **Mais Adega**, Av. Príncipe de Gales, 466: coordenadas -23.6605639, -46.5512843 extraídas do destino da rota, não do centro da câmera do mapa. Distância FSA calculada em linha reta: 0,296 km. Grade existente corroborada, sem mudança. [Ficha consultada](https://www.google.com/maps/search/?api=1&query=Mais+Adega+Point+Bar+Principe+de+Gales+466+Santo+Andre). Captura da URL completa de rota em backend/storage/pending-route-hours.json, privado.
- **Supra Direito e Leandrini**: duas fotos obtidas das páginas oficiais, inspecionadas visualmente, versões WebP localizadas em assets/venues com miniaturas de até 600px e detalhes até 1200px. Originais privados preservados. [Supra](https://suprabar.com.br/direito-sbc/), [Leandrini](https://leandrinirockbar.com/). URLs exatas em imageSource e catálogo-publicado.csv. Novos arquivos somam 342624 bytes.

Catálogo: **32 locais, 32 pontos, 30 grades habituais, 19 gráficos, 1 atendimento separado, 1 horário pendente e 8 casas com fotos**. Lista central mantém 539 registros e 54 prioritários ainda fora; colunas originais preservadas. A grade de Virtus é dado publicado pelo Google, não certificação de operação presencial.

## Pendências e limites

After: pesquisa do Maps retornou vizinhos, sem ficha correspondente; Cybo ainda lista After na Kennedy, 137, mas isso não resolve conflito com Mr. Hoppy. Nenhuma grade de vizinho importada. Cissão: Google mantém bairro/município/CEP sem rua/número; endereço antigo de evento não aplicado. Gráficos ficaram inacessíveis na visualização limitada recebida; não interpretar isso como ausência de gráficos no Google. Gruta: site oficial falhou por DNS; não usar fotos de terceiros. Outros 24 locais ainda sem fotos confirmadas nesta sessão.

HTTPS para localização no celular e teste em aparelho físico continuam pendentes. Usuário confirmou busca, deslize dos cards, abertura de modal pelo endereço e login funcionando no aparelho físico. Filtros ainda sem confirmação explícita e localização bloqueada pelo HTTP. Administração, API do catálogo e publicação não antecipadas.

## Verificações deste notebook

19 testes Node aprovados, sintaxe JS e conferência de 32 IDs/pontos, 30 grades e 8 fotos. Edge em 1280/768/390px: corpo do card abre o modal, dia atual em São Paulo destacado, fechado com Movimento: - e barras apagadas, distâncias com geolocalização simulada, setas, sem erros JS ou overflow da página. Screenshot móvel do modal inspecionada. Não equivale a teste em celular físico.

Health inicialmente sem conexão e depois conectado após MySQL disponível. Suíte PHP de API aprovada em banco temporário, preservando nightout. Primeira rodada de navegador leu dialog-open antes do evento assíncrono close; teste corrigido para aguardar fechamento antes de conferir menu.

Rodada final da suíte PHP com --browser aprovada: API e fluxos completos de cadastro, confirmação, perfil, exportação, e-mail, senha, recuperação, múltiplas abas e exclusão no Edge desktop/celular emulado; sem erros JavaScript. Banco temporário removido pelo runner.

Verificação final das fotos e catálogo atual passou nos três tamanhos em servidor temporário na porta 8001 com caminhos absolutos deste clone. Servidor temporário encerrado. O servidor já aberto na porta 8000 entregava catálogo anterior (6 fotos e Mais Adega sem ponto); reiniciar a partir deste clone. Conferidos 539 registros e preservação exata das primeiras 11 colunas do CSV em relação ao HEAD. Teste físico reportado pelo usuário cobre busca, deslize, modal e login; filtros/localização continuam pendentes.
