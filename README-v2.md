# NightOut — planejamento da versão 2

Este documento registra o que já existe e o que vamos desenvolver nas próximas etapas. A base de autenticação está implementada; catálogo real, painel administrativo e recuperação de senha continuam pendentes.
 
> Atualização: a primeira etapa de autenticação foi implementada depois deste planejamento. PHP + MariaDB foram adotados para testes locais; as tabelas `users` e `auth_limits` foram criadas. Cadastro, login, logout, sessões PHP em arquivos, CSRF e limite de tentativas estão disponíveis. O restante deste documento preserva o planejamento inicial: catálogo, painel administrativo, recuperação de senha e verificação de e-mail seguem pendentes. Consulte `backend/README.md` para o estado operacional atual.

As instruções para executar a interface atual estão no [README.md](README.md).

## 1. Objetivo

Transformar o protótipo em uma plataforma com catálogo próprio de estabelecimentos e eventos. O cadastro inicial será manual, com informações fornecidas e verificadas por nós, sem depender da API paga do Google.

Regiões iniciais:

- Santo André.
- São Bernardo do Campo.
- São Caetano do Sul.
- São Paulo.

Categorias iniciais: adegas, bares, casas de festas, baladas e casas de shows.

Supra Berno, Supra Direito e Submundo 808 foram citados como referências para o catálogo. Antes de cadastrar, confirmar nomes, endereços e se cada referência representa um estabelecimento, uma festa ou uma marca organizadora. Não inventar dados ausentes.

## 2. O que já temos

- [x] Interface em HTML, CSS e JavaScript, com layout responsivo.
- [x] Busca e filtros sobre dados demonstrativos.
- [x] Cards, detalhes dos eventos, agenda e artistas.
- [x] Solicitação de localização e tratamento de recusa, erro e tempo limite.
- [x] Área de proximidade bloqueada quando a localização está indisponível.
- [x] Cálculo de distância preparado para lugares com coordenadas.
- [x] Preços desconhecidos como `—` e movimento como `Sem informação`.
- [x] Testes automatizados do fluxo de localização com navegador simulado.

Os horários, endereços, artistas e status atuais continuam demonstrativos. A autorização de localização não transforma esses exemplos em lugares reais. Há autenticação local; não há compra, reserva ou integração com Google Places.

## 3. Arquitetura proposta

```text
Interface atual + futuro painel administrativo
                    |
                    | Requisições HTTP / respostas JSON
                    v
               API NightOut
                    |
             Consultas validadas
                    v
              Banco de dados

Fotos -> armazenamento de arquivos
Banco -> caminhos das fotos, autoria e vínculo com lugar/evento
```

O navegador conversa com a API. Somente o backend acessa o banco: a senha do banco nunca deve aparecer no JavaScript entregue ao usuário.

### Desenvolvimento local com XAMPP

**Adotamos PHP + MariaDB do XAMPP para testes locais.** O servidor embutido do PHP serve a interface e a API em `http://127.0.0.1:8000`. A proposta anterior de Node.js com PostgreSQL não foi implementada. A tabela abaixo registra as opções avaliadas.

| Caminho | Onde roda a API | Banco local | Observação |
| --- | --- | --- | --- |
| PHP com XAMPP | Apache/PHP do XAMPP | MariaDB disponibilizado pelo XAMPP | Proposta inicial mais direta para testar interface e API na mesma origem |
| Node.js com XAMPP | Processo Node separado | MariaDB disponibilizado pelo XAMPP | O XAMPP fornece o banco; não executa o Node.js |

O phpMyAdmin ajuda a inspecionar os dados durante o desenvolvimento, mas não substitui a API nem o painel administrativo do NightOut.

O Apache não serve o NightOut nesta etapa. `backend/start.ps1` inicia o PHP com um router que permite apenas os recursos públicos e a API, na mesma origem.

O ambiente local servirá para testes. Hospedagem, domínio, HTTPS, backups e armazenamento de produção serão planejados depois. Não vamos expor o XAMPP diretamente à internet.

## 4. Onde ficará cada coisa

Estrutura alvo para o backend — parcialmente implementada. Já existem `public/`, `src/`, `config/`, `database/migrations/` e o armazenamento local de sessões; controllers, services, repositories, middleware, seeds e uploads ainda não foram separados/criados. Os testes atuais ficam em `tests/` na raiz do projeto:

```text
backend/
  public/           # Ponto de entrada público da API
  src/
    controllers/    # Recebe requisições e monta respostas
    services/       # Regras: horários, proximidade, autenticação
    repositories/   # Consultas ao banco
    middleware/     # Autenticação, permissões e validações comuns
  config/           # Carregamento da configuração do ambiente
  database/
    migrations/     # Criação e evolução das tabelas
    seeds/          # Dados de teste separados dos registros reais
  storage/
    uploads/        # Fotos locais validadas; sem executar arquivos enviados
  tests/            # Testes da API e das regras de negócio
  .env.example      # Exemplo de configuração, sem senhas reais
```

O `.env` real ficará fora do Git e da pasta pública, assim como arquivos privados e backups. A configuração de Apache deverá respeitar essa separação.

| Parte | Responsabilidade |
| --- | --- |
| `index.html` e `styles/styles.css` | Estrutura e visual do site |
| `js/components.js` | Exibição dos dados recebidos |
| `js/app.js` | Busca, filtros e interação |
| `js/location.js` | Permissão de localização e proximidade |
| Futuro `js/api.js` | Chamadas à nossa API e tratamento de falhas |
| `js/data.js` | Exemplos enquanto a API não estiver pronta; depois, apenas modo de demonstração explícito |
| Backend | Validação, autenticação, autorização, regras e acesso ao banco |
| Banco | Estabelecimentos, horários, eventos, usuários e referências de imagens |
| Armazenamento de arquivos | Imagens; local durante testes, serviço de armazenamento a definir em produção |
| Futuro painel administrativo | Cadastro e edição do catálogo por usuários autorizados |

## 5. Modelo inicial do banco

Podemos usar um único banco `nightout` com tabelas separadas para catálogo e contas. Não é necessário criar outro banco apenas para login.

| Tabela proposta | Informações principais |
| --- | --- |
| `cities` | Nome e UF das cidades atendidas |
| `categories` | Adega, bar, casa de festas e outras categorias |
| `venues` | Nome, descrição, cidade, bairro, endereço, latitude, longitude, fuso horário, contatos, publicação e data de verificação |
| `venue_categories` | Vínculo entre estabelecimentos e uma ou mais categorias |
| `opening_hours` | Dia da semana, início, fim e indicação de término no dia seguinte; permite vários intervalos por dia |
| `opening_exceptions` | Feriados, fechamentos e horários especiais em datas específicas |
| `event_series` | Identidade de festas recorrentes, quando necessário |
| `events` | Edição, estabelecimento, início, término, descrição, status, preço opcional e link de ingresso |
| `artists` e `event_artists` | Artistas e participação em eventos |
| `media`, `venue_media` e `event_media` | Caminho da imagem, texto alternativo, autoria, autorização de uso e vínculos |
| `users` | Nome, e-mail único, hash da senha, papel, situação da conta e datas |
| `sessions` | Sessões com expiração e possibilidade de revogação |
| `password_reset_tokens` | Tokens protegidos, de uso único e com expiração, para recuperação de senha |

As migrations definirão os tipos, índices, chaves estrangeiras e regras de exclusão. Este quadro é uma proposta, não um esquema já criado.

### Estabelecimento e evento são registros diferentes

Um bar ou casa de festas tem endereço e horários próprios. Um evento tem data, programação e um local associado. Uma festa pode ter várias edições em locais diferentes, sem duplicar o cadastro dos estabelecimentos.

### Informações desconhecidas

- Preço desconhecido: `null`, exibido como `—`. Zero só significa gratuito quando confirmado.
- Movimento desconhecido: sem registro, barras apagadas e `Sem informação`.
- Horário desconhecido: `Horário não informado`, sem presumir aberto ou fechado.
- Coordenadas ausentes: não calcular distância nem incluir o local em resultados de proximidade.
- Ingresso sem fonte: não oferecer compra ou inventar disponibilidade.

O status de funcionamento será calculado a partir dos horários cadastrados e suas exceções. Precisaremos considerar viradas de dia, como sexta das 22h até sábado às 5h, e o fuso do estabelecimento. “Aberto pelo horário cadastrado” não é confirmação ao vivo da operação.

## 6. API própria

Rotas planejadas. Já estão implementadas `auth/register`, `auth/login`, `auth/logout` e `auth/me`, além de `GET /api/v1/health`. As demais continuam pendentes:

| Método e rota | Finalidade |
| --- | --- |
| `GET /api/v1/venues` | Buscar por nome, cidade, bairro e categoria; com paginação |
| `GET /api/v1/venues/nearby` | Consultar locais próximos com latitude, longitude e raio validados |
| `GET /api/v1/venues/{id}` | Detalhes e horários de um estabelecimento |
| `GET /api/v1/events` | Agenda por período, cidade ou estabelecimento |
| `GET /api/v1/events/{id}` | Detalhes de uma edição |
| `GET /api/v1/cities` e `/categories` | Opções disponíveis para filtros |
| `POST /api/v1/auth/register` | Criar conta |
| `POST /api/v1/auth/login` | Entrar e iniciar sessão |
| `POST /api/v1/auth/logout` | Encerrar sessão |
| `GET /api/v1/auth/me` | Consultar a conta autenticada |
| `POST /api/v1/auth/forgot-password` | Solicitar recuperação de senha |
| `POST /api/v1/auth/reset-password` | Definir nova senha com token válido |
| `POST /api/v1/admin/venues` | Cadastrar estabelecimento com autorização administrativa |
| `PATCH /api/v1/admin/venues/{id}` | Atualizar estabelecimento com autorização administrativa |

Completar as rotas administrativas de horários, eventos e fotos quando o modelo estiver aprovado. Consultar o catálogo não exigirá login.

A localização do usuário hoje fica somente na memória do navegador. Se adotarmos busca de proximidade no servidor, as coordenadas serão enviadas à nossa API para aquela consulta. Planejar esse fluxo explicitamente, sem gravar histórico de localização ou registrar coordenadas em logs sem necessidade.

## 7. Cadastro e login — próxima frente de trabalho

**Cadastro, login e logout locais já funcionam.** O modal apresenta formulário de acesso/cadastro e, depois de entrar, saudação, nome, frase “A noite começa agora”, botão Ok e logout. O e-mail não aparece no modal autenticado. Veja a [revisão detalhada do login](docs/revisao-login.md).

- [x] Definir PHP + MariaDB para o backend local.
- [x] Preparar banco e migrations de `users` e `auth_limits`; sessões usam arquivos do PHP, não tabela própria.
- [x] Criar cadastro com nome, e-mail e senha.
- [x] Validar dados no servidor e impedir e-mails duplicados.
- [x] Armazenar somente hash de senha com biblioteca apropriada; nunca senha em texto puro.
- [x] Implementar login, sessão com prazo máximo de duas horas e logout real.
- [x] Usar cookies de sessão `HttpOnly`, política `SameSite` e `Secure` em HTTPS; não guardar senhas no navegador.
- [x] Renovar o identificador de sessão no login e invalidar a sessão no logout.
- [x] Implementar proteção contra CSRF nas operações que usam cookies e limite de tentativas de login.
- [ ] Separar usuário comum de administrador e verificar permissões no backend.
- [x] Não permitir que o cadastro público escolha o papel de administrador.
- [x] Criar estados de carregamento e erros de formulário.
- [x] Completar recuperação da interface após expiração de sessão e sincronização entre abas, com testes JavaScript simulados.
- [ ] Planejar recuperação de senha e envio de e-mail; usar caixa de teste local antes de enviar mensagens reais.
- [x] Testar credenciais inválidas, duplicidade, logout, CSRF, validação de senha/e-mail, limite de tentativas e tentativa de escolher papel administrativo no cadastro.
- [x] Testar expiração efetiva na API com sessão de teste e avisos entre abas em JavaScript simulado.
- [x] Isolar testes de autenticação em banco, servidor e sessões temporários.
- [ ] Conferir múltiplas abas em navegador real e testar autorização de rotas administrativas quando existirem.

Login no NightOut é independente da permissão de localização do dispositivo. A pessoa poderá pesquisar lugares sem conta e sem fornecer localização.

## 8. Cadastro dos primeiros lugares

- [ ] Listar os primeiros estabelecimentos do ABC e de São Paulo.
- [ ] Confirmar nomes, categorias e endereços.
- [ ] Obter coordenadas verificadas.
- [ ] Conferir horários em fontes oficiais ou com os responsáveis.
- [ ] Registrar fonte e data de verificação, sem apresentar o cadastro como atualização automática.
- [ ] Obter fotos próprias ou autorizadas, com os créditos necessários.
- [ ] Cadastrar edições de eventos separadamente dos locais.
- [ ] Criar painel para manutenção manual do catálogo.
- [ ] Definir depois como responsáveis pelos locais poderão solicitar acesso e atualizar seus dados.

Ter nossa própria API não atualiza informações sozinho: inicialmente a manutenção será nossa. Movimento ao vivo continuará indisponível até existir uma fonte confiável.

## 9. Ordem sugerida de implementação

1. Confirmar a stack local e preparar API, configuração e conexão com o banco.
2. Começar usuários, cadastro, login e autorização administrativa.
3. Criar tabelas do catálogo, horários, coordenadas e eventos.
4. Inserir um pequeno conjunto de lugares verificados e expor consultas públicas.
5. Conectar a interface à API, substituindo os exemplos de forma explícita.
6. Habilitar proximidade com dados reais e revisar os filtros de lugares versus eventos.
7. Criar o painel de cadastro e upload de fotos.
8. Testar responsividade, permissões, horários especiais, erros e segurança dos acessos.
9. Planejar publicação, custos, backups e recuperação de dados.

## 10. Outras pendências

- [ ] Validar visualmente o site em celular real.
- [ ] Revisar textos e componentes que ainda apresentam programação fictícia.
- [ ] Definir paginação e estados de carregamento, lista vazia e falha da API.
- [ ] Validar uploads por tipo, tamanho e conteúdo; gerar nomes seguros e impedir execução.
- [ ] Usar consultas parametrizadas e validação no servidor.
- [ ] Criar documentação das respostas e erros da API.
- [ ] Preparar backup e restauração do banco e das imagens.
- [ ] Definir política de privacidade e tratamento dos dados de conta antes de publicar.
- [ ] Avaliar custos de hospedagem e imagens antes de contratar serviços.

Ficam para depois: pagamentos, emissão de ingressos, reservas reais, movimento ao vivo e integrações externas. Google Places é opcional e não é requisito para desenvolver o catálogo próprio.
