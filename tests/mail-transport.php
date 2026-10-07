<?php
declare(strict_types=1);
require dirname(__DIR__).'/backend/src/mail.php';
function mailCheck(bool $ok,string $label): void { if(!$ok)throw new RuntimeException($label);echo 'OK: '.$label.PHP_EOL; }
$config=['fromEmail'=>'sender@nightout.invalid','fromName'=>'NightOut'];
$payload=brevoPayload($config,'recipient@nightout.invalid','Confirmation','Hello <friend>','https://nightout.invalid/#verify-email=abc');
mailCheck($payload['to'][0]['email']==='recipient@nightout.invalid','single transactional recipient');
mailCheck(str_contains($payload['htmlContent'],'&lt;friend&gt;') && str_contains($payload['textContent'],'#verify-email=abc'),'escaped HTML and complete plain-text link');
validateBrevoResponse(201,'{"messageId":"test-id"}');
foreach ([['Confirme seu e-mail no NightOut','#verify-email=abc','Confirmar meu e-mail','24 horas'],['Confirme seu novo e-mail no NightOut','#verify-email=abc','Confirmar meu novo e-mail','24 horas'],['Redefina sua senha do NightOut','#reset-password=abc','Redefinir minha senha','30 minutos']] as [$subject,$fragment,$button,$expiry]) {
    $url='https://nightout.invalid/'.$fragment;
    $content=nightoutMailContent($subject,'Mensagem segura',$url);
    mailCheck(str_contains($content['htmlContent'],$button) && str_contains($content['textContent'],$expiry) && substr_count($content['htmlContent'],'href="'.$url.'"')===2,'mail variant preserves action, expiry and both links: '.$button);
}
foreach([[401,'{"message":"secret"}'],[429,'{"message":"token"}'],[500,'bad'],[201,'{}']] as [$status,$body]) {
    try{validateBrevoResponse($status,$body);throw new LogicException('Unexpected acceptance');}
    catch(RuntimeException $error){mailCheck(!str_contains($error->getMessage(),'secret') && !str_contains($error->getMessage(),'token'),'provider rejection is sanitized '.$status);}
}
putenv('NIGHTOUT_TEST_RUN=aaaaaaaaaaaaaaaa');
mailCheck(mailConfiguration()['transport']==='local','isolated tests cannot send real mail');
putenv('NIGHTOUT_TEST_RUN');
