# NightOut

A API local agora oferece cadastro, login, sessão e logout. Veja [backend/README.md](backend/README.md). Para usar a autenticação, inicie o servidor PHP e abra **http://127.0.0.1:8000/**; abrir o HTML diretamente ou no Live Server serve apenas para a interface demonstrativa.

Veja o [planejamento da versão 2](README-v2.md) para as pendências da API própria, banco de dados, catálogo e cadastro/login com XAMPP em avaliação para testes locais.

Protótipo responsivo em HTML, CSS e JavaScript, sem dependências de instalação. Abra `index.html` no navegador ou utilize o Live Server do VS Code.

## Organização

- `index.html`: estrutura da página.
- `styles/styles.css`: identidade visual e responsividade.
- `js/data.js`: dados demonstrativos separados da interface.
- `js/components.js`: componentes reutilizáveis.
- `js/location.js`: solicitação de localização, permissões e distâncias.
- `js/app.js`: busca, filtros e interações.

A busca ignora acentos e consulta evento, casa, artista e bairro. Os filtros combinam categoria, data, distância, preço, lotação, artista e disponibilidade. Clique em um artista para consultar a agenda ou em um evento para abrir os detalhes. Escape fecha os diálogos.

O cenário é fixo: 9 de outubro de 2026, às 23h30, em São Paulo. Endereços, horários, programação e status são demonstrativos. Preços e lotação são desconhecidos (`null`), apresentados como “—” e “Sem informação”. Ingressos estão indisponíveis. Fotografias são ilustrativas, não retratos confirmados dos artistas ou locais. Fotos do Unsplash e fontes do Google Fonts precisam de internet; as fontes possuem alternativas locais.

Há autenticação local com PHP e MariaDB. Não há pagamento, reserva real ou integração com o Google Places. O catálogo continua demonstrativo.

## Localização

Use HTTPS ou o Live Server em `localhost` / `127.0.0.1`. O site solicita a localização ao carregar. O navegador decide se exibe a pergunta, conforme a permissão previamente salva. Depois de um bloqueio, pode ser necessário permitir Localização nas configurações do site antes de clicar em “Permitir acesso”. Uma conexão HTTP pelo IP da rede local pode não permitir geolocalização no celular.

Recusa, tempo limite, dispositivo indisponível e navegador incompatível mantêm a busca utilizável. A permissão desbloqueia a área de proximidade. Ainda não há lugares com coordenadas reais cadastrados, portanto essa área mostra um estado vazio, sem inventar distâncias. Quando houver coordenadas de lugares, as distâncias serão calculadas em linha reta, com raio de 5 km para proximidade.

As coordenadas do usuário ficam somente na memória da página e não são enviadas a serviços externos nem gravadas em armazenamento local. A revogação de permissão limpa as coordenadas quando o navegador oferece a Permissions API.

O próximo caminho proposto é um catálogo próprio, com API e banco de dados, descrito no planejamento da versão 2. Google Places permanece uma alternativa opcional que exige configuração de credenciais, faturamento e atendimento às regras de exibição e atribuição. A busca atual consulta apenas os exemplos locais; ainda não pesquisa estabelecimentos no Google. Não presumir que os dados de movimento exibidos no Google Maps estejam disponíveis na API oficial.

## Verificação

Execute `node --test --test-isolation=none tests/location.cjs` para verificar o fluxo com APIs de navegador simuladas. O pedido nativo de permissão ainda precisa ser verificado manualmente em navegador real.
