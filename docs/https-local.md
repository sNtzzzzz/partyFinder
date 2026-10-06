# HTTPS local no NightOut

O site continua na rede local; não há túnel público, hospedagem nem abertura de portas no roteador. MySQL do XAMPP permanece necessário. O PHP escuta somente em loopback na porta 8002. Caddy recebe HTTPS em 8443 e redireciona HTTP em 8000. A API confia nos metadados do proxy somente quando vêm de loopback com token privado correto; limites continuam por IP do cliente e cookies usam Secure.

## Iniciar neste computador

Na pasta partyFinder:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\start-https.ps1
```

O script detecta o IPv4 ativo, gera certificado para localhost/loopback/IP atual e imprime os links. Se houver vários adaptadores, use `-Address IPv4-atual`. Não inicia sobre outra porta ocupada. PHP e Caddy ficam em segundo plano com caminhos absolutos, sem depender do terminal aberto. Para encerrar:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\start-https.ps1 -Stop
```

Não inicie o comando antigo de PHP na porta 8000 enquanto Caddy estiver ativo. Sessões não são copiadas entre hosts: faça login usando o mesmo endereço durante o fluxo. Mensagens novas de confirmação/recuperação usam o link HTTPS da rede configurado pelo script; mensagens antigas preservam sua origem anterior.

## Android

1. No mesmo Wi-Fi, abra o link de certificado impresso pelo script: `http://IPv4-atual:8000/certificado-local.crt`.
2. Baixe `nightout-local-ca.crt`. O endpoint distribui somente o certificado público; nenhum arquivo de chave é servido.
3. Em Configurações, procure **Instalar certificado**. Em geral: Segurança e privacidade → Mais configurações de segurança → Criptografia e credenciais → Instalar certificado → **Certificado de CA**. Os nomes variam conforme fabricante/versão.
4. Confirme com o bloqueio de tela e selecione o arquivo baixado. O Android pode avisar que a rede poderá ser monitorada: essa autoridade é exclusivamente a de desenvolvimento criada para o teste, e sua chave privada deve permanecer protegida.
5. Abra `https://IPv4-atual:8443` no Chrome. Não avance ignorando erro de certificado. Confira ausência de erro e autorize localização quando solicitado; GPS e permissão do Chrome também precisam estar habilitados.

Para remover a confiança depois dos testes, encontre o certificado mkcert/NightOut em Credenciais confiáveis → Usuário e remova somente essa entrada. Não use Limpar todas as credenciais.

Referência de configuração Android: [Google — instalar/remover certificados](https://support.google.com/pixelphone/answer/2844832?hl=pt-BR).

## Outro computador / primeira instalação

Binários e certificados estão em backend/storage e não acompanham Git. Não copiar chaves privadas entre PCs. Instale as ferramentas oficiais:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\install-https-tools.ps1
```

Para preparar certificado e confiança no usuário atual, gere a CA privada e o certificado com mkcert, usando CAROOT em backend/storage/https/ca. Importe somente rootCA.pem em Cert:\CurrentUser\Root; o Windows pode pedir confirmação. Depois execute start-https.ps1. Cada computador pode ter sua própria autoridade; o celular precisará confiar nela quando trocar de servidor. O certificado deve incluir o novo IP; o script o gera novamente usando a mesma CA.

## Arquivos privados e portas

- `backend/storage/https/ca/rootCA-key.pem` e `site-key.pem`: chaves privadas, nunca compartilhar nem versionar.
- `backend/storage/https/ca/rootCA.pem`: certificado público da autoridade.
- `backend/storage/https/Caddyfile`: inclui token privado do proxy, não versionar.
- Logs e identidade dos processos: backend/storage/https; script para somente os processos registrados com a mesma identidade/data de criação.
- Firewall, quando necessário: permitir apenas TCP 8000/8443 na rede privada e no segmento local; nunca expor o PHP 8002 ou banco por essa configuração.

Referências: [mkcert](https://github.com/FiloSottile/mkcert), [Caddy TLS](https://caddyserver.com/docs/caddyfile/directives/tls), [Caddy reverse proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy).
