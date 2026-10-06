# Plano de HTTPS local — autorizado e implementado

Solicitado em 06/10/2026: explicar antes e só configurar após autorização explícita. O usuário autorizou a execução em 06/10/2026. mkcert e Caddy instalados em armazenamento privado; certificado confiável no Windows e HTTPS verificados no Edge. Instruções operacionais em [https-local.md](https-local.md). Instalação da CA e teste de localização no Android dependem dos passos no aparelho.

1. Instalar mkcert e Caddy a partir dos distribuidores oficiais, verificar binários e criar certificado de desenvolvimento para localhost, 127.0.0.1 e IPv4 atual da rede. Certificados/chaves ficam privados e fora do Git.
2. Caddy atende HTTPS na porta 8443 e encaminha interface/API para PHP em loopback. Router mantém whitelist; MariaDB permanece no notebook. Não expor portas no roteador ou publicar na internet.
3. Ajustar reconhecimento de HTTPS no backend somente para o proxy local confiável, cookies e origem NIGHTOUT_APP_URL de confirmação/recuperação. Não confiar indiscriminadamente em headers forwarded enviados pelo cliente.
4. Instalar o certificado público da autoridade de desenvolvimento no notebook e nos dispositivos de teste que precisarão confiar no site. Usuário faz os passos no celular conforme Android/iPhone. Nunca transferir a chave privada da autoridade. HTTPS com aviso ignorado não encerra a validação de contexto seguro.
5. Conferir certificado sem erro, contexto seguro, localização com permissão explícita, login e links de conta no computador e aparelho real. Endereço previsto https://IPv4-atual:8443. Se IPv4 mudar, revisar certificado/links.

Ferramentas livres, sem necessidade de comprar domínio para este teste local. HTTPS de produção será configurado na etapa de publicação, com certificado público próprio da hospedagem/domínio.

Referências: [mkcert](https://github.com/FiloSottile/mkcert), [Caddy reverse proxy](https://caddyserver.com/docs/quick-starts/reverse-proxy).
