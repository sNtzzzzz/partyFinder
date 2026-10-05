<?php
declare(strict_types=1);
require_once __DIR__ . '/mail.php';

function recoveryOutbox(): string { return mailOutbox(); }

function recoveryLimit(PDO $db, string $action): void { authLimit($db, $action, 5); }

function handleRecovery(PDO $db, string $action, array $input): void
{
    recoveryLimit($db, $action);
    if ($action === 'forgot-password') {
        $email = is_string($input['email'] ?? null) ? strtolower(trim($input['email'])) : '';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
            respond(['message' => 'Informe um e-mail válido.'], 422);
        }
        $query = $db->prepare('SELECT id FROM users WHERE email=?');
        $query->execute([$email]);
        $id = $query->fetchColumn();
        if ($id !== false) {
            $token = bin2hex(random_bytes(32));
            // Origem fixa do ambiente local, nunca derivada do cabeçalho Host.
            $url = appUrl() . '/#reset-password=' . $token;
            $file = null;
            $db->beginTransaction();
            try {
                // Um novo pedido substitui o link anterior.
                $db->prepare('SELECT id FROM users WHERE id=? FOR UPDATE')->execute([$id]);
                $db->prepare('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE token_hash=VALUES(token_hash), expires_at=VALUES(expires_at)')
                    ->execute([$id, hash('sha256', $token), time() + 1800]);
                $file = storeMail((int)$id, $email, 'Redefina sua senha do NightOut',
                    'Use o link em ate 30 minutos. Se nao pediu a troca, ignore esta mensagem.', $url, 'recovery');
                $db->commit();
            } catch (Throwable $error) {
                if ($db->inTransaction()) $db->rollBack();
                if ($file !== null && is_file($file)) unlink($file);
                throw $error;
            }
        }
        respond(['message' => 'Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.']);
    }

    $token = is_string($input['token'] ?? null) ? $input['token'] : '';
    $password = is_string($input['password'] ?? null) ? $input['password'] : '';
    if (!preg_match('/^[a-f0-9]{64}$/D', $token)) {
        respond(['message' => 'Link inválido ou expirado. Solicite uma nova recuperação.'], 400);
    }
    if (mb_strlen($password, 'UTF-8') < 8 || strlen($password) > 72 || str_contains($password, "\0")) {
        respond(['message' => 'Use pelo menos 8 caracteres e uma senha que não seja muito longa.'], 422);
    }
    $hash = hash('sha256', $token);
    $query = $db->prepare('SELECT user_id FROM password_reset_tokens WHERE token_hash=?');
    $query->execute([$hash]);
    $id = $query->fetchColumn();
    if ($id === false) respond(['message' => 'Link inválido ou expirado. Solicite uma nova recuperação.'], 400);
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $db->beginTransaction();
    try {
        $db->prepare('SELECT id FROM users WHERE id=? FOR UPDATE')->execute([$id]);
        $query = $db->prepare('SELECT expires_at FROM password_reset_tokens WHERE user_id=? AND token_hash=? FOR UPDATE');
        $query->execute([$id, $hash]);
        $expires = $query->fetchColumn();
        if ($expires === false || (int)$expires <= time()) {
            $db->rollBack();
            respond(['message' => 'Link inválido ou expirado. Solicite uma nova recuperação.'], 400);
        }
        $db->prepare('UPDATE users SET password_hash=?, auth_version=auth_version+1 WHERE id=?')
            ->execute([$passwordHash, $id]);
        $db->prepare('DELETE FROM password_reset_tokens WHERE user_id=?')->execute([$id]);
        $db->prepare("DELETE FROM email_verification_tokens WHERE user_id=? AND purpose='change'")->execute([$id]);
        $db->commit();
    } catch (Throwable $error) {
        if ($db->inTransaction()) $db->rollBack();
        throw $error;
    }
    // Não autenticar automaticamente após recuperação.
    $_SESSION = [];
    session_regenerate_id(true);
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    respond(['user' => null, 'csrf' => $_SESSION['csrf'],
        'message' => 'Senha atualizada. Entre com sua nova senha.']);
}
