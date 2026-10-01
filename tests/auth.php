<?php
declare(strict_types=1);
// Execute com o servidor de teste ativo: php tests/auth.php http://127.0.0.1:8001
if (PHP_SAPI !== 'cli') exit;
require_once dirname(__DIR__) . '/backend/src/database.php';
$testRun = getenv('NIGHTOUT_TEST_RUN');
if (!$testRun || !preg_match('/^[a-f0-9]{16}$/D', $testRun)) {
    throw new RuntimeException('Use php tests/run-auth.php: os testes exigem banco isolado.');
}
$base = $argv[1] ?? 'http://127.0.0.1:8001';
$email = 'test-' . bin2hex(random_bytes(8)) . '@nightout.invalid';
$password = 'NightOut-test-123!';
$client = curl_init();
curl_setopt($client, CURLOPT_COOKIEFILE, '');
function request(string $path, string $method = 'GET', ?array $body = null, ?string $csrf = null): array
{
    global $client, $base;
    curl_setopt_array($client, [CURLOPT_URL => $base . $path, CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method, CURLOPT_POSTFIELDS => $body === null ? null : json_encode($body),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'X-CSRF-Token: ' . ($csrf ?? '')],
        CURLOPT_TIMEOUT => 10]);
    $raw = curl_exec($client);
    if ($raw === false) throw new RuntimeException(curl_error($client));
    return [(int)curl_getinfo($client, CURLINFO_RESPONSE_CODE), json_decode($raw, true), $raw];
}
function check(bool $condition, string $label): void
{
    if (!$condition) throw new RuntimeException('FAIL: ' . $label);
    echo 'OK: ' . $label . PHP_EOL;
}
$db = connectDatabase();
$bucket = hash('sha256', 'login|127.0.0.1');
$oldLimit = $db->prepare('SELECT * FROM auth_limits WHERE bucket = ?');
$oldLimit->execute([$bucket]);
$previous = $oldLimit->fetch();
try {
    check((request('/api/v1/health')[1]['testRun'] ?? '') === $testRun, 'isolated test server');
    [$status, $session] = request('/api/v1/auth/me');
    check($status === 200 && $session['user'] === null && strlen($session['csrf']) === 64, 'anonymous session');
    $csrf = $session['csrf'];
    $payload = ['name' => '<Test User>', 'email' => $email, 'password' => $password, 'role' => 'admin'];
    check(request('/api/v1/auth/register', 'POST', $payload)[0] === 403, 'CSRF required');
    check(request('/api/v1/auth/register', 'POST', [...$payload, 'email' => 'bad'], $csrf)[0] === 422, 'invalid email');
    foreach (['sem-arroba.com', '@exemplo.com', 'nome@'] as $invalidEmail) {
        check(request('/api/v1/auth/register', 'POST', [...$payload, 'email' => $invalidEmail], $csrf)[0] === 422, 'invalid email structure');
    }
    foreach (['1234567', 'áéíó', '😀😀😀😀'] as $shortPassword) {
        check(request('/api/v1/auth/register', 'POST', [...$payload, 'password' => $shortPassword], $csrf)[0] === 422, 'minimum eight characters');
    }
    [$status, $result] = request('/api/v1/auth/register', 'POST', $payload, $csrf);
    check($status === 201 && $result['user']['role'] === 'user', 'register without privilege escalation');
    check(!isset($result['user']['password_hash']), 'hash absent from response');
    check($result['csrf'] !== $csrf, 'CSRF rotated on authentication');
    $csrf = $result['csrf'];
    $query = $db->prepare('SELECT password_hash FROM users WHERE email = ?');
    $query->execute([$email]);
    $hash = $query->fetchColumn();
    check($hash !== $password && password_verify($password, $hash), 'password stored as hash');
    check(request('/api/v1/auth/me')[1]['user']['email'] === $email, 'session persists');
    check(request('/api/v1/auth/register', 'POST', $payload, $csrf)[0] === 409, 'duplicate email');
    check(request('/api/v1/auth/logout', 'POST', [], $csrf)[0] === 200, 'logout');
    $anonymous = request('/api/v1/auth/me')[1];
    check($anonymous['user'] === null, 'session invalid after logout');
    $csrf = $anonymous['csrf'];
    check(request('/api/v1/auth/login', 'POST', [...$payload, 'password' => 'incorrect-password'], $csrf)[0] === 401, 'wrong password');
    check(request('/api/v1/auth/login', 'POST', $payload, $csrf)[0] === 200, 'login');
    // Expirar somente o arquivo de sessão deste cliente, no diretório de teste.
    $oldSession = request('/api/v1/auth/me')[1];
    $sessionId = null;
    foreach (curl_getinfo($client, CURLINFO_COOKIELIST) as $cookie) {
        $parts = explode("\t", $cookie);
        if (($parts[5] ?? '') === 'nightout_test_session') $sessionId = $parts[6];
    }
    check(is_string($sessionId) && preg_match('/^[a-zA-Z0-9,-]+$/D', $sessionId) === 1, 'test session identified');
    $sessionFile = dirname(__DIR__) . '/backend/storage/sessions-test-' . $testRun . '/sess_' . $sessionId;
    $contents = file_get_contents($sessionFile);
    $expired = preg_replace('/expires\|i:\d+;/', 'expires|i:1;', $contents, 1, $replacements);
    check($replacements === 1, 'expiry fixture applied');
    file_put_contents($sessionFile, $expired, LOCK_EX);
    check(request('/api/v1/auth/logout', 'POST', [], $oldSession['csrf'])[0] === 403, 'expired CSRF rejected');
    $fresh = request('/api/v1/auth/me')[1];
    check($fresh['user'] === null && $fresh['csrf'] !== $oldSession['csrf'], 'expiry clears identity and rotates CSRF');
    check(request('/api/v1/auth/logout', 'POST', [], $fresh['csrf'])[0] === 200, 'logout after expiry with refreshed token');
    $fresh = request('/api/v1/auth/me')[1];
    check(request('/api/v1/auth/login', 'POST', $payload, $fresh['csrf'])[0] === 200, 'login after expiry');
    check(request('/api/v1/auth/login')[0] === 405, 'method validation');
    check(request('/backend/config/database.example.php')[0] === 404, 'private config blocked');
    check(request('/.git/config')[0] === 404, 'git blocked');
    check(request('/')[0] === 200 && request('/styles/auth.css')[0] === 200, 'frontend and styles served');
    $csrf = request('/api/v1/auth/me')[1]['csrf'];
    $db->prepare('INSERT INTO auth_limits (bucket, attempts, expires_at) VALUES (?, 15, ?) ON DUPLICATE KEY UPDATE attempts=15, expires_at=VALUES(expires_at)')->execute([$bucket, time() + 900]);
    check(request('/api/v1/auth/login', 'POST', $payload, $csrf)[0] === 429, 'rate limit');
    request('/api/v1/auth/logout', 'POST', [], $csrf);
} finally {
    $db->prepare('DELETE FROM users WHERE email = ?')->execute([$email]);
    if ($previous) {
        $db->prepare('UPDATE auth_limits SET attempts=?, expires_at=? WHERE bucket=?')->execute([$previous['attempts'], $previous['expires_at'], $bucket]);
    } else {
        $db->prepare('DELETE FROM auth_limits WHERE bucket=?')->execute([$bucket]);
    }
    curl_close($client);
}
