<?php
declare(strict_types=1);

function respond(array $body, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

function startAuthSession(): void
{
    $directory = dirname(__DIR__) . '/storage/sessions';
    $testRun = getenv('NIGHTOUT_TEST_RUN');
    if ($testRun) {
        if (!preg_match('/^[a-f0-9]{16}$/D', $testRun)) throw new RuntimeException('Invalid test run.');
        $directory .= '-test-' . $testRun;
    }
    if (!is_dir($directory)) mkdir($directory, 0700, true);
    session_save_path($directory);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', '7200');
    session_name($testRun ? 'nightout_test_session' : 'nightout_session');
    session_set_cookie_params([
        'lifetime' => 0, 'path' => '/', 'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
    ]);
    if (!session_start()) {
        respond(['message' => 'Não foi possível iniciar sua sessão. Tente novamente em instantes.'], 503);
    }
    if (isset($_SESSION['expires']) && $_SESSION['expires'] <= time()) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}

function publicUser(PDO $db): ?array
{
    if (!isset($_SESSION['user_id'])) return null;
    $query = $db->prepare('SELECT id, name, email, role, auth_version FROM users WHERE id = ?');
    $query->execute([$_SESSION['user_id']]);
    $user = $query->fetch();
    if (!$user || (int)$user['auth_version'] !== (int)($_SESSION['auth_version'] ?? 0)) {
        $_SESSION = [];
        session_regenerate_id(true);
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        return null;
    }
    unset($user['auth_version']);
    return $user;
}

function handleAuth(PDO $db, string $action): void
{
    startAuthSession();
    $currentUser = publicUser($db);
    if ($action === 'me') {
        respond(['user' => $currentUser, 'csrf' => $_SESSION['csrf'], 'expiresAt' => $_SESSION['expires'] ?? null]);
    }
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!hash_equals($_SESSION['csrf'], $token)) {
        respond(['message' => 'Sua sessão mudou ou expirou. Tente novamente.'], 403);
    }
    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        $params = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => '/',
            'secure' => $params['secure'], 'httponly' => true, 'samesite' => 'Lax']);
        respond(['user' => null]);
    }
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
        respond(['message' => 'Envie os dados em JSON.'], 415);
    }
    $raw = file_get_contents('php://input', false, null, 0, 8193);
    if (strlen($raw) > 8192) respond(['message' => 'Dados muito extensos.'], 413);
    try { $input = json_decode($raw, true, 32, JSON_THROW_ON_ERROR); }
    catch (JsonException $e) { respond(['message' => 'JSON inválido.'], 400); }
    if (!is_array($input)) respond(['message' => 'Dados inválidos.'], 422);
    if (in_array($action, ['forgot-password', 'reset-password'], true)) {
        require_once __DIR__ . '/recovery.php';
        handleRecovery($db, $action, $input);
    }
    $email = is_string($input['email'] ?? null) ? strtolower(trim($input['email'])) : '';
    $password = is_string($input['password'] ?? null) ? $input['password'] : '';
    $name = is_string($input['name'] ?? null) ? trim($input['name']) : '';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
        respond(['message' => 'Informe um e-mail válido.'], 422);
    }
    if (mb_strlen($password, 'UTF-8') < 8) {
        respond(['message' => 'Use pelo menos 8 caracteres'], 422);
    }
    if (strlen($password) > 72 || str_contains($password, "\0")) {
        respond(['message' => 'Senha inválida ou muito longa. Use uma senha mais curta.'], 422);
    }
    if ($action === 'register' && (mb_strlen($name) < 2 || mb_strlen($name) > 100)) {
        respond(['message' => 'Informe um nome de 2 a 100 caracteres.'], 422);
    }
    // Limite compartilhado entre sessões, por IP e operação, em janela de 15 minutos.
    $bucket = hash('sha256', $action . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $now = time();
    $db->prepare('DELETE FROM auth_limits WHERE expires_at <= ?')->execute([$now]);
    $db->prepare('INSERT INTO auth_limits (bucket, attempts, expires_at) VALUES (?, 1, ?)
        ON DUPLICATE KEY UPDATE attempts = attempts + 1')->execute([$bucket, $now + 900]);
    $limit = $db->prepare('SELECT attempts FROM auth_limits WHERE bucket = ?');
    $limit->execute([$bucket]);
    if ((int)$limit->fetchColumn() > 15) {
        header('Retry-After: 900');
        respond(['message' => 'Muitas tentativas. Aguarde 15 minutos e tente novamente.'], 429);
    }
    if ($action === 'register') {
        try {
            $db->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
                ->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
        } catch (PDOException $e) {
            if (($e->errorInfo[1] ?? null) === 1062) respond(['message' => 'Este e-mail já está cadastrado. Entre na sua conta.'], 409);
            throw $e;
        }
        $userId = (int)$db->lastInsertId();
    } else {
        $query = $db->prepare('SELECT id, password_hash, auth_version FROM users WHERE email = ?');
        $query->execute([$email]);
        $user = $query->fetch();
        $hash = $user['password_hash'] ?? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
        if (!password_verify($password, $hash) || !$user) {
            respond(['message' => 'E-mail ou senha incorretos.'], 401);
        }
        $userId = (int)$user['id'];
    }
    session_regenerate_id(true);
    $_SESSION = ['user_id' => $userId, 'auth_version' => (int)($user['auth_version'] ?? 0), 'expires' => time() + 7200, 'csrf' => bin2hex(random_bytes(32))];
    respond(['user' => publicUser($db), 'csrf' => $_SESSION['csrf'], 'expiresAt' => $_SESSION['expires']], $action === 'register' ? 201 : 200);
}
