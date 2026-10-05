<?php
declare(strict_types=1);
check((bool)getenv('NIGHTOUT_TEST_RUN'), 'account tests isolated');
require_once dirname(__DIR__) . '/backend/src/auth-common.php';
require_once dirname(__DIR__) . '/backend/src/mail.php';
require_once dirname(__DIR__) . '/backend/src/mailbox.php';
function mailboxHasToken(PDO $db, string $token): bool {
    foreach (activeLocalMail($db, 'verification') as $mail) {
        if (str_ends_with($mail['url'], '=' . $token)) return true;
    }
    return false;
}
$db->exec('DELETE FROM auth_limits'); // Somente banco efêmero do runner.
$client = curl_init();
curl_setopt($client, CURLOPT_COOKIEFILE, '');
$email = 'account-' . bin2hex(random_bytes(5)) . '@nightout.invalid';
$password = 'Account-password-123!';
$newPassword = 'New-account-password-123!';
$newEmail = 'changed-' . bin2hex(random_bytes(5)) . '@nightout.invalid';
$csrf = request('/api/v1/auth/me')[1]['csrf'];
check(request('/api/v1/auth/update-profile','POST',['name'=>'Intruder'],$csrf)[0] === 401, 'anonymous profile update rejected');
$result = request('/api/v1/auth/register','POST',['name'=>'Account User','email'=>$email,'password'=>$password],$csrf);
check($result[0] === 201 && !$result[1]['user']['emailVerified'], 'registration starts unverified');
$id = (int)$result[1]['user']['id'];
$csrf = $result[1]['csrf'];
function verificationTokenFor(PDO $db, int $id): string
{
    $q=$db->prepare('SELECT token_hash FROM email_verification_tokens WHERE user_id=?');
    $q->execute([$id]); $hash=$q->fetchColumn();
    foreach (glob(mailOutbox().'/*.json') as $file) {
        $mail=json_decode(file_get_contents($file),true);
        if (($mail['kind']??'')!=='verification') continue;
        $token=substr($mail['url'],strpos($mail['url'],'#verify-email=')+14);
        if (hash('sha256',$token)===$hash) return $token;
    }
    throw new RuntimeException('No verification mail');
}
$token = verificationTokenFor($db,$id);
check(strlen($token)===64,'verification token hashed in database');
check(mailboxHasToken($db,$token),'mailbox shows fresh verification link');
foreach (activeLocalMail($db,'recovery') as $mail) check(!str_ends_with($mail['url'],'='.$token),'mailbox separates confirmation from recovery');
check(request('/api/v1/auth/verify-email','POST',['token'=>$token])[0]===403,'verification CSRF');
$db->prepare('UPDATE email_verification_tokens SET expires_at=1 WHERE user_id=?')->execute([$id]);
check(request('/api/v1/auth/verify-email','POST',['token'=>$token],$csrf)[0]===400,'expired verification rejected');
check(!mailboxHasToken($db,$token),'mailbox hides expired verification link');
$result=request('/api/v1/auth/resend-verification','POST',[],$csrf);
check($result[0]===200,'resend verification');
$replacement=verificationTokenFor($db,$id);
check($token!==$replacement,'resend replaces verification token');
check(!mailboxHasToken($db,$token) && mailboxHasToken($db,$replacement),'mailbox hides replaced link and shows replacement');
check(request('/api/v1/auth/verify-email','POST',['token'=>$token],$csrf)[0]===400,'old verification token rejected');
check(request('/api/v1/auth/reset-password','POST',['token'=>$replacement,'password'=>$newPassword],$csrf)[0]===400,'verification cannot reset password');
$result=request('/api/v1/auth/verify-email','POST',['token'=>$replacement],$csrf);
check($result[0]===200 && $result[1]['user']['emailVerified'],'verification confirms email');
check(!mailboxHasToken($db,$replacement),'mailbox hides consumed verification link');
check(request('/api/v1/auth/verify-email','POST',['token'=>$replacement],$csrf)[0]===400,'verification single use');
$_SESSION=['user_id'=>$id,'auth_version'=>0];
try { requireAdmin($db); check(false,'admin access'); } catch (AuthError $e) { check($e->status===403,'ordinary user rejected by admin guard'); }
check(requireVerifiedUser($db)['id']==$id,'verified access guard');
$_SESSION=[];
$result=request('/api/v1/auth/update-profile','POST',['name'=>'Renamed <User>','role'=>'admin','id'=>999],$csrf);
check($result[0]===200 && $result[1]['user']['name']==='Renamed <User>' && $result[1]['user']['role']==='user','profile changes only name for own account');
check(request('/api/v1/auth/change-password','POST',['currentPassword'=>'bad','password'=>$newPassword],$csrf)[0]===422,'change password requires current password');
check(request('/api/v1/auth/change-password','POST',['currentPassword'=>$password,'password'=>$password],$csrf)[0]===422,'same password rejected');
check(request('/api/v1/auth/export-data','POST',[],$csrf)[0]===422,'export requires password');
$result=request('/api/v1/auth/export-data','POST',['currentPassword'=>$password],$csrf);
check($result[0]===200 && $result[1]['data']['email']===$email && !str_contains($result[2],'password_hash') && !isset($result[1]['data']['csrf']),'export excludes credentials');
check(request('/api/v1/auth/change-email','POST',['email'=>$newEmail,'currentPassword'=>'bad'],$csrf)[0]===422,'change email requires password');
$result=request('/api/v1/auth/change-email','POST',['email'=>$newEmail,'currentPassword'=>$password],$csrf);
check($result[0]===200 && $result[1]['user']['email']===$email,'old email kept until confirmation');
$token=verificationTokenFor($db,$id);
$result=request('/api/v1/auth/verify-email','POST',['token'=>$token],$csrf);
check($result[0]===200 && $result[1]['user']===null,'email change revokes session');
$csrf=$result[1]['csrf'];
check(request('/api/v1/auth/login','POST',['email'=>$email,'password'=>$password],$csrf)[0]===401,'old email login rejected');
$result=request('/api/v1/auth/login','POST',['email'=>$newEmail,'password'=>$password],$csrf);
check($result[0]===200 && $result[1]['user']['emailVerified'],'new email login accepted and verified');
$csrf=$result[1]['csrf'];
// Segundo cliente para verificar revogação em outro dispositivo.
$main=$client;
$client=curl_init(); curl_setopt($client,CURLOPT_COOKIEFILE,'');
$otherCsrf=request('/api/v1/auth/me')[1]['csrf'];
request('/api/v1/auth/login','POST',['email'=>$newEmail,'password'=>$password],$otherCsrf);
$other=$client; $client=$main;
$result=request('/api/v1/auth/change-password','POST',['currentPassword'=>$password,'password'=>$newPassword],$csrf);
check($result[0]===200 && $result[1]['user']===null,'password change signs out current session');
$csrf=$result[1]['csrf']; $client=$other;
check(request('/api/v1/auth/me')[1]['user']===null,'password change revokes other device');
$client=$main;
check(request('/api/v1/auth/login','POST',['email'=>$newEmail,'password'=>$password],$csrf)[0]===401,'old password after settings rejected');
$result=request('/api/v1/auth/login','POST',['email'=>$newEmail,'password'=>$newPassword],$csrf);
check($result[0]===200,'updated password accepted');
$csrf=$result[1]['csrf'];
$result=request('/api/v1/auth/logout-all','POST',['currentPassword'=>$newPassword],$csrf);
check($result[0]===200 && $result[1]['user']===null,'logout all');
$csrf=$result[1]['csrf'];
$result=request('/api/v1/auth/login','POST',['email'=>$newEmail,'password'=>$newPassword],$csrf);
$csrf=$result[1]['csrf'];
check(request('/api/v1/auth/delete-account','POST',['currentPassword'=>'bad','confirmation'=>'EXCLUIR'],$csrf)[0]===422,'delete needs correct password');
check(request('/api/v1/auth/delete-account','POST',['currentPassword'=>$newPassword,'confirmation'=>'wrong'],$csrf)[0]===422,'delete needs explicit confirmation');
request('/api/v1/auth/forgot-password','POST',['email'=>$newEmail],$csrf);
$result=request('/api/v1/auth/delete-account','POST',['currentPassword'=>$newPassword,'confirmation'=>'EXCLUIR'],$csrf);
check($result[0]===200 && $result[1]['user']===null,'delete succeeds');
$q=$db->prepare('SELECT COUNT(*) FROM users WHERE id=?'); $q->execute([$id]);
check((int)$q->fetchColumn()===0,'user removed');
foreach (['password_reset_tokens','email_verification_tokens'] as $table) {
    $q=$db->prepare("SELECT COUNT(*) FROM $table WHERE user_id=?"); $q->execute([$id]);
    check((int)$q->fetchColumn()===0,'dependent tokens removed: '.$table);
}
$remaining=false;
foreach(glob(mailOutbox().'/*.json') as $file) {
    $m=json_decode(file_get_contents($file),true);
    if (($m['userId']??null)===$id) $remaining=true;
}
check(!$remaining,'local account mail erased');
$csrf=$result[1]['csrf'];
check(request('/api/v1/auth/login','POST',['email'=>$newEmail,'password'=>$newPassword],$csrf)[0]===401,'deleted account cannot login');
$bucket=hash('sha256','login|127.0.0.1');
$db->prepare('INSERT INTO auth_limits(bucket,attempts,expires_at) VALUES(?,15,?) ON DUPLICATE KEY UPDATE attempts=15,expires_at=VALUES(expires_at)')->execute([$bucket,time()+37]);
$result=request('/api/v1/auth/login','POST',['email'=>$newEmail,'password'=>$newPassword],$csrf);
check($result[0]===429 && $result[1]['retryAfter']<=37 && $result[1]['retryAfter']>0,'rate limit reports real remaining seconds');
curl_close($other); curl_close($client);
