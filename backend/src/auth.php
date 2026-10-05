<?php
declare(strict_types=1);
require_once __DIR__ . '/auth-common.php';
require_once __DIR__ . '/verification.php';

function handleAuth(PDO $db, string $action): void
{
    startAuthSession();
    $currentUser = publicUser($db);
    if ($action === 'me') respond(sessionPayload($db));
    if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
        throw new AuthError('Sua sessão mudou ou expirou. Tente novamente.', 403);
    }
    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        $params = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => '/',
            'secure' => $params['secure'], 'httponly' => true, 'samesite' => 'Lax']);
        respond(['user' => null]);
    }
    $input = readAuthInput();
    if (in_array($action, ['forgot-password', 'reset-password'], true)) {
        require_once __DIR__ . '/recovery.php';
        handleRecovery($db, $action, $input);
    }
    if ($action === 'verify-email') verifyEmailToken($db, $input);
    if (in_array($action, ['update-profile', 'change-password', 'change-email', 'delete-account',
        'export-data', 'logout-all', 'resend-verification'], true)) {
        require_once __DIR__ . '/account.php';
        handleAccount($db, $action, $input);
    }
    $email = validEmail(inputText($input, 'email'));
    $password = inputText($input, 'password');
    validPassword($password);
    $name = $action === 'register' ? validName(inputText($input, 'name')) : '';
    authLimit($db, $action);
    $mailFile = null;
    $db->beginTransaction();
    try {
        if ($action === 'register') {
            $db->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
                ->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
            $id = (int)$db->lastInsertId();
            $version = 0;
            $mailFile = issueVerification($db, $id, $email);
        } else {
            // Manter senha e versão consistentes em relação a uma troca concorrente.
            $query = $db->prepare('SELECT id, password_hash, auth_version FROM users WHERE email=? FOR UPDATE');
            $query->execute([$email]);
            $row = $query->fetch();
            $hash = $row['password_hash'] ?? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
            if (!password_verify($password, $hash) || !$row) throw new AuthError('E-mail ou senha incorretos.', 401);
            $id = (int)$row['id'];
            $version = (int)$row['auth_version'];
            if (password_needs_rehash($hash, PASSWORD_DEFAULT)) {
                $db->prepare('UPDATE users SET password_hash=? WHERE id=?')->execute([password_hash($password, PASSWORD_DEFAULT), $id]);
            }
        }
        $db->commit();
    } catch (Throwable $error) {
        if ($db->inTransaction()) $db->rollBack();
        if ($mailFile && is_file($mailFile)) unlink($mailFile);
        if ($error instanceof PDOException && ($error->errorInfo[1] ?? null) === 1062) {
            throw new AuthError('Este e-mail já está cadastrado. Entre na sua conta.', 409);
        }
        throw $error;
    }
    beginIdentity($id, $version);
    respond(sessionPayload($db, $action === 'register' ? 'Conta criada. Confirme seu e-mail pelo link enviado.' : ''),
        $action === 'register' ? 201 : 200);
}
