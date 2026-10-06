# Prioridades do NightOut

Plano acordado em 06/10/2026. Este documento orienta a retomada do projeto.

**A prioridade é finalizar esta sequência: completar os 32 lugares e conferir no celular → criar o painel administrativo e a API do catálogo → preparar a publicação.**

A agenda pode entrar depois, conforme tivermos eventos confirmados. Não antecipar essa frente nem integrações adiadas em detrimento das etapas abaixo.

## 1. Completar os 32 lugares e conferir no celular

- [x] Revisar os dados dos 32 estabelecimentos publicados: nome, categoria, endereço, operação, horários e coordenadas. Revisão concluída em 06/10/2026, com correções e lacunas explícitas em [revisao-catalogo-2026-10-06.md](revisao-catalogo-2026-10-06.md); não significa confirmação presencial de todas as operações.
- [ ] Resolver os horários pendentes de Virtus e After Bar e registrar conflitos sem inventar informações.
- [ ] Completar coordenadas verificadas onde estiverem pendentes.
- [ ] Buscar fotos reais da própria casa e gráficos de movimento onde disponíveis; manter a ausência explícita quando não houver fonte confiável.
- [ ] Preservar fontes e datas na documentação/dados, sem seção de referências na interface.
- [ ] Conferir em celular real busca, filtros, localização, carrossel por toque, cards, modais e fluxos de conta. A localização exige uma origem compatível; HTTP pelo IP da rede não resolve essa pendência.
- [ ] Conferir visualmente os ajustes de 06/10: card inteiro clicável, local fechado com `Movimento: -` e barras apagadas, dia atual destacado na tabela de horários.
- [ ] Executar as verificações adequadas e registrar resultados desta máquina, distinguindo-os dos testes anteriores.

Conclusão desta etapa: cada um dos 32 locais revisado, lacunas e conflitos documentados, sem dados inventados, e fluxos principais conferidos em aparelho físico. Informação indisponível não deve ser preenchida apenas para encerrar a etapa.

Revisar os 54 candidatos prioritários continua no backlog de curadoria; ampliar o catálogo não é condição para concluir a revisão dos 32 atuais.

## 2. Criar o painel administrativo e a API do catálogo

- [ ] Implementar tabelas e migrations do catálogo, preservando usuários e registros existentes.
- [ ] Importar os dados locais verificados e criar consultas públicas pela API.
- [ ] Conectar busca, filtros, cards e detalhes à API, com estados de carregamento, ausência de resultados e falha.
- [ ] Implementar acesso administrativo autorizado no backend.
- [ ] Criar cadastro, edição, publicação e retirada de estabelecimentos, horários, coordenadas e fontes/datas.
- [ ] Implementar gestão de fotos com validação dos arquivos e armazenamento seguro.
- [ ] Validar consultas públicas e permissões administrativas, incluindo acesso negado para usuários comuns.

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
