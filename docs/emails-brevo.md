# E-mails reais pela Brevo

Transporte implementado em 07/10/2026. Confirmação de cadastro, confirmação de troca de e-mail e recuperação usam o mesmo fluxo/token existente. A API da Brevo recebe uma mensagem transacional individual; não é necessário importar os usuários como contatos nem criar campanhas.

## Atualizar a hospedagem

No PowerShell do notebook, envie `backend/src/mail.php`, `backend/src/brevo.php` e `backend/src/recovery.php` para `/home/nightout/www/nightout/backend/src/`. Envie `backend/configure-mail.php` para `/home/nightout/www/nightout/backend/`. Não enviar config/local.php do notebook: a configuração do banco remoto permanece a mesma.

No SSH, em `~/www/nightout`, execute uma linha por vez:

```bash
read -rsp "Cole a chave API Brevo e pressione Enter: " NIGHTOUT_BREVO_API_KEY
export NIGHTOUT_BREVO_API_KEY
php backend/configure-mail.php
unset NIGHTOUT_BREVO_API_KEY
```

Não substituir o nome NIGHTOUT_BREVO_API_KEY pela chave no comando. Digitar/colar a chave somente quando o pedido aparecer; o terminal não mostra o conteúdo. O script solicita o e-mail remetente verificado na Brevo e o endereço HTTPS público, com padrão https://nightout.alwaysdata.net. O arquivo privado `backend/config/mail.local.php` é criado com permissão 600 e não acompanha Git. Nenhum e-mail é enviado ao configurar.

O remetente verificado mostrado pelo usuário foi gabriel.santiagof7@gmail.com, com nome Nightout. Conferir a grafia diretamente no painel antes de configurar. Não é possível autenticar domínio gmail.com próprio; a Brevo pode reescrever o remetente conforme suas regras. Ativação de envio transacional da conta ainda precisa ser confirmada por um envio aceito.

NIGHTOUT_APP_URL, se definido no ambiente do site, tem precedência sobre o arquivo. Deve ser https://nightout.alwaysdata.net, nunca localhost. O transporte local permanece padrão no desenvolvimento. A variável de isolamento dos testes força transporte local e ignora a configuração privada da Brevo; testes não enviam mensagens reais. Produção configurada com Brevo não salva links/tokens de e-mail na caixa de arquivos.

## Conferir o primeiro envio

Cadastro não envia e-mail automaticamente: a pessoa solicita o primeiro link pelo botão de confirmação. Novos pedidos substituem o token anterior; usar o e-mail mais recente. Alteração de e-mail e recuperação continuam enviando quando solicitadas.

Pelo site público, solicite recuperação de senha para uma conta sua, ou confirmação de uma conta sua não confirmada. Isso autoriza o envio correspondente. Não criar destinatários de teste de terceiros. Confira Transacional → Logs/Tempo real e a caixa de entrada/spam. HTTP 201 da Brevo significa aceitação, não entrega garantida. Só considerar concluído após receber a mensagem e usar seu link de confirmação/recuperação com sucesso.

Quota esgotada, chave inválida, envio não ativado ou falha de conexão não têm fallback para caixa local em produção. O registro/token em emissão é revertido em caso de rejeição; um link anterior permanece válido conforme seu prazo. Cadastro/confirmação retornam a falha genérica da API. Recuperação preserva a mesma resposta pública para conta conhecida/desconhecida mesmo se o provedor falhar, registrando somente erro sanitizado no log. Se o provedor aceitar mas o banco falhar ao finalizar, o e-mail recebido pode ter link inválido; solicite outro. Não há fila/reenvio automático nesta primeira versão.

## Proteções e manutenção

- Endpoint fixo https://api.brevo.com/v3/smtp/email; verificação TLS ativa, sem redirecionar credenciais, com timeout.
- Chave, destinatários e tokens não aparecem nos logs de erro do transporte.
- HTML escapado e alternativa texto simples; token continua somente hash no banco.
- Token de confirmação de 24h e recuperação de 30min, com uso único e limites existentes preservados.
- Chave deve ser renovada antes de expirar; configuração pode ser repetida sem alterar o banco. O painel mostrou prazo de um ano e expiração por 90 dias de inatividade.
- Remover credenciais privadas da hospedagem ao desativar e-mails; manter cópias privadas fora do Git.

Referência: [API oficial de envio transacional](https://developers.brevo.com/reference/send-transac-email).
