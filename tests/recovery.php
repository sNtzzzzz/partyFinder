<?php
declare(strict_types=1);
// Executado somente por run-auth.php, depois da suíte básica.
check((bool)getenv('NIGHTOUT_TEST_RUN'), 'recovery requires isolation');
require_once dirname(__DIR__) . '/backend/src/recovery.php';
$email = 'recovery-' . bin2hex(random_bytes(6)) . '@nightout.invalid';
$password = 'Original-password-123!';
$newPassword = 'Updated-password-456!';
$client = curl_init();
curl_setopt($client, CURLOPT_COOKIEFILE, '');
$csrf = request('/api/v1/auth/me')[1]['csrf'];
$registered = request('/api/v1/auth/register', 'POST', ['name'=>'Recovery test','email'=>$email,'password'=>$password], $csrf);
check($registered[0] === 201, 'recovery account');
$firstClient = $client;
$client = curl_init();
curl_setopt($client, CURLOPT_COOKIEFILE, '');
$csrf = request('/api/v1/auth/me')[1]['csrf'];
$mailCount = count(glob(recoveryOutbox() . '/*.json'));
$unknown = request('/api/v1/auth/forgot-password', 'POST', ['email'=>'unknown@nightout.invalid'], $csrf);
check($unknown[0] === 200 && count(glob(recoveryOutbox() . '/*.json')) === $mailCount, 'unknown email has generic response and no mail');
$known = request('/api/v1/auth/forgot-password', 'POST', ['email'=>$email], $csrf);
check($known[0] === 200 && $known[1] === $unknown[1], 'known and unknown email have identical response');
function currentRecoveryToken(PDO $db, string $email): string
{
    $query = $db->prepare('SELECT token_hash FROM password_reset_tokens r JOIN users u ON u.id=r.user_id WHERE u.email=?');
    $query->execute([$email]);
    $hash = $query->fetchColumn();
    foreach (glob(recoveryOutbox() . '/*.json') as $file) {
        $mail = json_decode(file_get_contents($file), true);
        $token = substr($mail['url'], strpos($mail['url'], '#reset-password=') + 16);
        if ($mail['to'] === $email && hash('sha256', $token) === $hash) return $token;
    }
    throw new RuntimeException('Mail token not found');
}
$oldToken = currentRecoveryToken($db, $email);
check(strlen($oldToken) === 64, 'local outbox contains reset link; database stores hash');
check(request('/api/v1/auth/reset-password','POST',['token'=>$oldToken,'password'=>$newPassword])[0] === 403, 'reset requires CSRF');
request('/api/v1/auth/forgot-password', 'POST', ['email'=>$email], $csrf);
$token = currentRecoveryToken($db, $email);
check($oldToken !== $token, 'new request replaces old link');
check(request('/api/v1/auth/reset-password','POST',['token'=>$oldToken,'password'=>$newPassword],$csrf)[0] === 400, 'replaced token rejected');
$db->prepare('UPDATE password_reset_tokens SET expires_at=1 WHERE token_hash=?')->execute([hash('sha256',$token)]);
check(request('/api/v1/auth/reset-password','POST',['token'=>$token,'password'=>$newPassword],$csrf)[0] === 400, 'expired token rejected');
request('/api/v1/auth/forgot-password','POST',['email'=>$email],$csrf);
$token = currentRecoveryToken($db,$email);
check(request('/api/v1/auth/reset-password','POST',['token'=>$token,'password'=>'short'],$csrf)[0] === 422, 'reset validates password');
$loginBucket = hash('sha256', 'login|127.0.0.1');
$blockedUntil = time() + 900;
$db->prepare('INSERT INTO auth_limits (bucket, attempts, expires_at) VALUES (?, 15, ?) ON DUPLICATE KEY UPDATE attempts=15, expires_at=VALUES(expires_at)')->execute([$loginBucket, $blockedUntil]);
$result = request('/api/v1/auth/reset-password','POST',['token'=>$token,'password'=>$newPassword],$csrf);
check($result[0] === 200 && $result[1]['user'] === null, 'reset succeeds without automatic login');
$csrf = $result[1]['csrf'];
check(request('/api/v1/auth/login','POST',['email'=>$email,'password'=>$newPassword],$csrf)[0] === 429, 'password reset does not bypass login block');
$limitQuery = $db->prepare('SELECT expires_at FROM auth_limits WHERE bucket=?');
$limitQuery->execute([$loginBucket]);
check((int)$limitQuery->fetchColumn() === $blockedUntil, 'reset preserves login block deadline');
// Remove only the artificial block in this isolated test database.
$db->prepare('DELETE FROM auth_limits WHERE bucket=?')->execute([$loginBucket]);

check(request('/api/v1/auth/reset-password','POST',['token'=>$token,'password'=>$password],$csrf)[0] === 400, 'consumed token rejected');
$resetClient = $client;
$client = $firstClient;
check(request('/api/v1/auth/me')[1]['user'] === null, 'previous independent session revoked');
$client = $resetClient;
check(request('/api/v1/auth/login','POST',['email'=>$email,'password'=>$password],$csrf)[0] === 401, 'old password rejected');
$result = request('/api/v1/auth/login','POST',['email'=>$email,'password'=>$newPassword],$csrf);
check($result[0] === 200, 'new password accepted');
$csrf = $result[1]['csrf'];
check(request('/backend/storage/outbox/')[0] === 404, 'outbox not public');
request('/api/v1/auth/forgot-password','POST',['email'=>$email],$csrf);
check(request('/api/v1/auth/forgot-password','POST',['email'=>$email],$csrf)[0] === 429, 'recovery rate limit');
$db->prepare('DELETE FROM users WHERE email=?')->execute([$email]);
curl_close($firstClient);
curl_close($client);
