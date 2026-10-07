<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/src/brevo.php';
$key = getenv('NIGHTOUT_BREVO_API_KEY');
if (!$key || strlen($key)<20 || strlen($key)>512 || preg_match('/[\r\n]/',$key)) {
    fwrite(STDERR,"Leia a chave com read -rsp e exporte NIGHTOUT_BREVO_API_KEY antes de executar.\n"); exit(1);
}
echo "E-mail remetente verificado na Brevo: ";
$from = trim(fgets(STDIN) ?: '');
if (!filter_var($from,FILTER_VALIDATE_EMAIL)) { fwrite(STDERR,"E-mail inválido.\n");exit(1); }
echo "Endereço HTTPS do site (Enter para https://nightout.alwaysdata.net): ";
$url = rtrim(trim(fgets(STDIN) ?: ''),'/') ?: 'https://nightout.alwaysdata.net';
$parts = parse_url($url);
if (!filter_var($url,FILTER_VALIDATE_URL) || ($parts['scheme'] ?? '') !== 'https' || isset($parts['user']) || isset($parts['pass']) || isset($parts['query']) || isset($parts['fragment'])) {
    fwrite(STDERR,"Endereço HTTPS inválido.\n");exit(1);
}
$config=['transport'=>'brevo','environment'=>'production','apiKey'=>$key,'fromEmail'=>$from,'fromName'=>'NightOut','appUrl'=>$url];
$destination=__DIR__.'/config/mail.local.php';
umask(0077);
$temporary=$destination.'.'.bin2hex(random_bytes(4)).'.tmp';
if (file_put_contents($temporary,"<?php\nreturn ".var_export($config,true).";\n",LOCK_EX) === false || !chmod($temporary,0600) || !rename($temporary,$destination)) {
    throw new RuntimeException('Não foi possível salvar a configuração privada.');
}
echo "Configuração privada salva. Nenhum e-mail foi enviado. Teste pelo fluxo do site.\n";
