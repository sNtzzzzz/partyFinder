<?php
declare(strict_types=1);
require_once __DIR__ . '/mail.php';

// Chamador deve manter a linha users bloqueada durante a emissão.
function issueVerification(PDO $db, int $id, string $email, string $purpose = 'verify'): string
{
    $token = bin2hex(random_bytes(32));
    $db->prepare('INSERT INTO email_verification_tokens (user_id, token_hash, email, purpose, expires_at)
        VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE token_hash=VALUES(token_hash), email=VALUES(email),
        purpose=VALUES(purpose), expires_at=VALUES(expires_at)')
        ->execute([$id, hash('sha256', $token), $email, $purpose, time() + 86400]);
    return storeMail($id, $email, 'Confirme seu e-mail no NightOut',
        'Confirme este endereço em até 24 horas. Se não reconhece o pedido, ignore esta mensagem.',
        appUrl() . '/#verify-email=' . $token, 'verification');
}

function verifyEmailToken(PDO $db, array $input): void
{
    authLimit($db, 'verify-email', 10);
    $token = inputText($input, 'token');
    if (!preg_match('/^[a-f0-9]{64}$/D', $token)) throw new AuthError('Link inválido ou expirado. Solicite outro e-mail.', 400);
    $hash = hash('sha256', $token);
    $query = $db->prepare('SELECT user_id FROM email_verification_tokens WHERE token_hash=?');
    $query->execute([$hash]);
    $id = $query->fetchColumn();
    if (!$id) throw new AuthError('Link inválido ou expirado. Solicite outro e-mail.', 400);
    $db->beginTransaction();
    try {
        $query = $db->prepare('SELECT email FROM users WHERE id=? FOR UPDATE');
        $query->execute([$id]);
        $oldEmail = $query->fetchColumn();
        $query = $db->prepare('SELECT * FROM email_verification_tokens WHERE user_id=? AND token_hash=? FOR UPDATE');
        $query->execute([$id, $hash]);
        $record = $query->fetch();
        if (!$record || (int)$record['expires_at'] <= time() || !$oldEmail) {
            throw new AuthError('Link inválido ou expirado. Solicite outro e-mail.', 400);
        }
        if ($record['purpose'] === 'change') {
            $db->prepare('UPDATE users SET email=?, email_verified_at=UTC_TIMESTAMP(), auth_version=auth_version+1 WHERE id=?')
                ->execute([$record['email'], $id]);
            $db->prepare('DELETE FROM password_reset_tokens WHERE user_id=?')->execute([$id]);
        } else {
            if ($oldEmail !== $record['email']) throw new AuthError('Este link não corresponde mais ao e-mail da conta.', 400);
            $db->prepare('UPDATE users SET email_verified_at=UTC_TIMESTAMP() WHERE id=?')->execute([$id]);
        }
        $db->prepare('DELETE FROM email_verification_tokens WHERE user_id=?')->execute([$id]);
        $db->commit();
    } catch (Throwable $error) {
        if ($db->inTransaction()) $db->rollBack();
        if ($error instanceof PDOException && ($error->errorInfo[1] ?? null) === 1062) {
            throw new AuthError('Este endereço não está disponível. Solicite a troca para outro e-mail.', 409);
        }
        throw $error;
    }
    respond(sessionPayload($db, $record['purpose'] === 'change'
        ? 'E-mail atualizado. Entre novamente com o novo endereço.'
        : 'E-mail confirmado. Sua conta está pronta.'));
}
