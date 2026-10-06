# Prioridades do NightOut

Plano acordado em 06/10/2026. Este documento orienta a retomada do projeto.

**A prioridade é finalizar esta sequência: completar os 31 lugares e conferir no celular → criar o painel administrativo e a API do catálogo → preparar a publicação.**

A agenda pode entrar depois, conforme tivermos eventos confirmados. Não antecipar essa frente nem integrações adiadas em detrimento das etapas abaixo.

## 1. Completar os 31 lugares e conferir no celular

- [x] Revisar os dados dos 32 estabelecimentos publicados: nome, categoria, endereço, operação, horários e coordenadas. Revisão concluída em 06/10/2026, com correções e lacunas explícitas em [revisao-catalogo-2026-10-06.md](revisao-catalogo-2026-10-06.md); não significa confirmação presencial de todas as operações.
- [x] Tratar os horários pendentes sem inventar informações. Virtus resolvido no Maps em 06/10; After retirado por decisão do usuário, sem afirmar fechamento. Catálogo atual tem 31 locais.
- [x] Completar coordenadas verificadas onde estiverem pendentes. Mais Adega preenchida pelo destino da rota do Maps em 06/10; 32 pontos cadastrados. Precisão das entradas físicas continua sujeita à confirmação.
- [ ] Buscar fotos reais da própria casa e gráficos de movimento onde disponíveis; manter a ausência explícita quando não houver fonte confiável.
- [x] Preservar fontes e datas na documentação/dados, sem seção de referências na interface.
- [ ] Conferir em celular real busca, filtros, localização, carrossel por toque, cards, modais e fluxos de conta. Usuário confirmou em 06/10 busca, deslize, abertura pelo endereço e login funcionando. Filtros e localização ainda precisam de confirmação; HTTP pelo IP da rede não resolve localização.
- [x] Conferir visualmente os ajustes de 06/10 (Edge 1280/768/390px, celular emulado): card inteiro clicável, local fechado com `Movimento: -` e barras apagadas, dia atual destacado na tabela de horários.
- [x] Executar as verificações adequadas e registrar resultados deste notebook: 19 testes Node, suíte PHP isolada e navegador com fluxos completos de conta em desktop/celular emulado aprovados; smoke de catálogo em três tamanhos aprovado.

Conclusão desta etapa: cada um dos 32 locais revisado, lacunas e conflitos documentados, sem dados inventados, e fluxos principais conferidos em aparelho físico. Informação indisponível não deve ser preenchida apenas para encerrar a etapa.

Revisar os 54 candidatos prioritários continua no backlog de curadoria; ampliar o catálogo não é condição para concluir a revisão dos 32 atuais.

## 2. Criar o painel administrativo e a API do catálogo

- [x] Implementar tabelas e migrations do catálogo, preservando usuários e registros existentes.
- [x] Importar os dados locais verificados e criar consultas públicas pela API.
- [x] Conectar busca, filtros, cards e detalhes à API, com estados de carregamento, ausência de resultados e falha.
- [x] Implementar acesso administrativo autorizado no backend.
- [x] Criar cadastro, edição, publicação/ocultação de estabelecimentos, horários, coordenadas, links e origem da foto. Fontes/datas pesquisadas e gráficos preservados; edição de fontes/gráficos detalhados fica para uma evolução.
- [x] Implementar gestão de fotos com validação dos arquivos e armazenamento seguro.
- [x] Validar consultas públicas e permissões administrativas, incluindo acesso negado para usuários comuns.

Conclusão desta etapa: manutenção manual dos estabelecimentos pelo painel e interface consumindo a API própria, com autorização e verificações adequadas. API própria não significa atualização automática dos dados.

## 3. Preparar a publicação

- [ ] Definir hospedagem e configurar domínio/origem com HTTPS.
- [ ] Implementar envio real de e-mails de recuperação e confirmação.
- [ ] Configurar credenciais privadas, cookies, origem dos links e limites para o ambiente de produção.
- [ ] Preparar backup de banco/imagens e conferir a restauração.
- [ ] Definir retenção dos arquivos privados e política de privacidade.
- [ ] Atualizar `README.md` e `README-v2.md`, removendo descrições antigas que contradizem o estado atual.
- [ ] Executar a validação final do catálogo, contas, permissões, responsividade e localização no ambiente de publicação.

Conclusão desta etapa: ambiente pronto para publicação com catálogo, contas, e-mails, HTTPS e recuperação de dados verificados. Escolhas de provedor, custos e publicação efetiva serão tratadas quando chegarmos a esta etapa.

## Depois desta sequência

- Agenda de festas, shows e edições específicas, somente com eventos confirmados e vinculados aos estabelecimentos.
- Ampliação do catálogo após curadoria dos candidatos.
- Google Places permanece adiado por custo; catálogo e fotos continuam com manutenção manual.
- Movimento ao vivo, pagamentos, ingressos e reservas continuam adiados. As barras existentes representam movimento habitual histórico.

## Retomada

Retomado em 06/10/2026 pela revisão dos 32 locais. Continuar pelas pendências da etapa 1, começando por identidade/operação/horários de Virtus e After e pelos endereços/coordenadas pendentes. Trabalhar até finalizar a sequência prioritária, registrando avanços e pendências em `CONTEXTO.md`. Ler este plano junto do contexto antes de iniciar novas frentes.

Itens marcados representam trabalho executado; itens abertos continuam pendentes. O estado atual e as verificações anteriores estão em `../CONTEXTO.md`.

Avanços no notebook: [continuidade-etapa-1-2026-10-06.md](continuidade-etapa-1-2026-10-06.md). Fotos agora em 8 casas. Teste em celular físico permanece aberto; emulação e localização simulada não encerram esse item.

Cissão: endereço de acesso resolvido por indicação e captura do usuário em 06/10 — Av. Lauro Gomes, 893, fundos do Estacionamento Centro Universitário FSA; entrar pelo estacionamento pela Av. Lauro Gomes e seguir à esquerda. Número refere-se ao acesso, não ao bar. Coordenadas anteriores preservadas.

Decisões posteriores de 06/10: After retirado por orientação do usuário; revisão inicial dos 32 permanece histórica, catálogo agora com 31. Administrador escolhido: santiago@gmail.com (nome local santiagoAdminSUPREMO, agora role admin, habilitada em 06/10/2026); e-mail confirmado e acesso validado no backend. HTTPS só iniciar após sinal explícito do usuário; [plano proposto](plano-https-local.md).

HTTPS local recebeu autorização explícita e foi implementado no notebook: [guia operacional](https-local.md). Contexto seguro/TLS e cookie Secure conferidos no Edge; localização no Android físico segue pendente até instalar a CA e testar. Não equivale ao HTTPS de produção.

Primeira versão da etapa 2 entregue por autorização explícita do usuário, mesmo com pendências de fotos/localização física da etapa 1. Guia: [painel-administrativo.md](painel-administrativo.md). API e editor verificados em banco temporário e Edge 1280/390px; 31 locais importados e administrador habilitado no banco real, preservando contas. Teste em aparelho físico ainda pendente; não antecipar publicação sem preparar a etapa 3.
