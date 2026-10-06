<?php
declare(strict_types=1);
require_once __DIR__ . '/request-context.php';

final class AuthError extends RuntimeException
{
    public function __construct(string $message, public int $status = 400, public array $details = [])
    { parent::__construct($message); }
}

function respond(array $body, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

function authLimit(PDO $db, string $action, int $maximum = 15, ?string $identity = null): void
{
    $bucket = hash('sha256', $action . '|' . ($identity ?? requestClientIp()));
    $now = time();
    $db->prepare('DELETE FROM auth_limits WHERE expires_at <= ?')->execute([$now]);
    $db->prepare('INSERT INTO auth_limits (bucket, attempts, expires_at) VALUES (?, 1, ?)
        ON DUPLICATE KEY UPDATE attempts=attempts+1')->execute([$bucket, $now + 900]);
    $query = $db->prepare('SELECT attempts, expires_at FROM auth_limits WHERE bucket=?');
    $query->execute([$bucket]);
    $limit = $query->fetch();
    if ((int)$limit['attempts'] > $maximum) {
        $remaining = max(1, (int)$limit['expires_at'] - $now);
        header('Retry-After: ' . $remaining);
        throw new AuthError('Muitas tentativas. Tente novamente em ' . $remaining . ' segundos.', 429,
            ['retryAfter' => $remaining]);
    }
}

function inputText(array $input, string $key): string
{
    return is_string($input[$key] ?? null) ? $input[$key] : '';
}

function validEmail(string $email): string
{
    $email = strtolower(trim($email));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
        throw new AuthError('Informe um e-mail válido.', 422);
    }
    return $email;
}

function validName(string $name): string
{
    $name = trim($name);
    if (mb_strlen($name, 'UTF-8') < 2 || mb_strlen($name, 'UTF-8') > 100 || preg_match('/[\x00-\x1f\x7f]/u', $name)) {
        throw new AuthError('Informe um nome de 2 a 100 caracteres, sem caracteres de controle.', 422);
    }
    return $name;
}

function validPassword(string $password): void
{
    if (mb_strlen($password, 'UTF-8') < 8) throw new AuthError('Use pelo menos 8 caracteres', 422);
    if (strlen($password) > 72 || str_contains($password, "\0")) {
        throw new AuthError('Senha inválida ou muito longa. Use uma senha mais curta.', 422);
    }
}

function clearIdentity(): void
{
    $_SESSION = [];
    session_regenerate_id(true);
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function startAuthSession(): void
{
    $directory = dirname(__DIR__) . '/storage/sessions';
    $run = getenv('NIGHTOUT_TEST_RUN');
    if ($run) {
        if (!preg_match('/^[a-f0-9]{16}$/D', $run)) throw new RuntimeException('Invalid test run.');
        $directory .= '-test-' . $run;
    }
    if (!is_dir($directory) && !mkdir($directory, 0700, true)) throw new RuntimeException('Session directory unavailable.');
    session_save_path($directory);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', '7200');
    session_name($run ? 'nightout_test_session' : 'nightout_session');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true,
        'secure' => secureRequest(), 'samesite' => 'Lax']);
    if (!session_start()) throw new RuntimeException('Session could not be started.');
    if (isset($_SESSION['expires']) && $_SESSION['expires'] <= time()) clearIdentity();
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}

function publicUser(PDO $db): ?array
{
    if (!isset($_SESSION['user_id'])) return null;
    $query = $db->prepare('SELECT id, name, email, role, auth_version, email_verified_at FROM users WHERE id=?');
    $query->execute([$_SESSION['user_id']]);
    $user = $query->fetch();
    if (!$user || (int)$user['auth_version'] !== (int)($_SESSION['auth_version'] ?? 0)) {
        clearIdentity();
        return null;
    }
    $user['emailVerified'] = $user['email_verified_at'] !== null;
    unset($user['auth_version'], $user['email_verified_at']);
    return $user;
}

function sessionPayload(PDO $db, string $message = ''): array
{
    $user = publicUser($db);
    return ['user' => $user, 'csrf' => $_SESSION['csrf'],
        'expiresAt' => $_SESSION['expires'] ?? null, 'message' => $message];
}

function beginIdentity(int $id, int $version): void
{
    session_regenerate_id(true);
    $_SESSION = ['user_id' => $id, 'auth_version' => $version,
        'expires' => time() + 7200, 'csrf' => bin2hex(random_bytes(32))];
}

function requireUser(PDO $db): array
{
    $user = publicUser($db);
    if (!$user) throw new AuthError('Sua sessão terminou. Entre novamente.', 401);
    return $user;
}

// Reutilizar em futuras operações que dependam de e-mail confirmado.
function requireVerifiedUser(PDO $db): array
{
    $user = requireUser($db);
    if (!$user['emailVerified']) throw new AuthError('Confirme seu e-mail para continuar.', 403);
    return $user;
}

// Reutilizar nas futuras rotas administrativas. Nunca confiar no papel enviado pelo navegador.
function requireAdmin(PDO $db): array
{
    $user = requireVerifiedUser($db);
    if ($user['role'] !== 'admin') throw new AuthError('Acesso não permitido.', 403);
    return $user;
}

function readAuthInput(): array
{
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
        throw new AuthError('Envie os dados em JSON.', 415);
    }
    $raw = file_get_contents('php://input', false, null, 0, 8193);
    if (strlen($raw) > 8192) throw new AuthError('Dados muito extensos.', 413);
    try { $input = json_decode($raw, true, 32, JSON_THROW_ON_ERROR); }
    catch (JsonException $error) { throw new AuthError('JSON inválido.', 400); }
    if (!is_array($input)) throw new AuthError('Dados inválidos.', 422);
    return $input;
}
