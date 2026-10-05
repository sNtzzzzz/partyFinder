<?php
declare(strict_types=1);
require_once __DIR__ . '/verification.php';

function handleAccount(PDO $db, string $action, array $input): void
{
    $user = requireUser($db);
    $id = (int)$user['id'];
    authLimit($db, $action, 10);
    // Reenvio também limitado por conta, mesmo mudando de IP.
    if ($action === 'resend-verification') authLimit($db, 'verification-account', 5, (string)$id);
    $mailFile = null;
    $db->beginTransaction();
    try {
        $query = $db->prepare('SELECT * FROM users WHERE id=? FOR UPDATE');
        $query->execute([$id]);
        $row = $query->fetch();
        if (!$row || (int)$row['auth_version'] !== (int)$_SESSION['auth_version']) {
            throw new AuthError('Sua sessão terminou. Entre novamente.', 401);
        }
        if (in_array($action, ['change-password', 'change-email', 'delete-account', 'export-data', 'logout-all'], true)) {
            $current = inputText($input, 'currentPassword');
            if (strlen($current) > 72 || str_contains($current, "\0") || !password_verify($current, $row['password_hash'])) {
                throw new AuthError('A senha atual está incorreta.', 422);
            }
        }
        $message = '';
        $signOut = false;
        $export = null;
        switch ($action) {
            case 'update-profile':
                $name = validName(inputText($input, 'name'));
                $db->prepare('UPDATE users SET name=? WHERE id=?')->execute([$name, $id]);
                $message = 'Nome atualizado.';
                break;
            case 'resend-verification':
                $query = $db->prepare('SELECT email, purpose FROM email_verification_tokens WHERE user_id=?');
                $query->execute([$id]);
                $pending = $query->fetch();
                if ($pending && $pending['purpose'] === 'change') {
                    $mailFile = issueVerification($db, $id, $pending['email'], 'change');
                } elseif (!$row['email_verified_at']) {
                    $mailFile = issueVerification($db, $id, $row['email']);
                }
                $message = 'Se houver confirmação pendente, um novo link foi enviado.';
                break;
            case 'change-email':
                $email = validEmail(inputText($input, 'email'));
                if ($email === $row['email']) throw new AuthError('Informe um e-mail diferente do atual.', 422);
                $query = $db->prepare('SELECT id FROM users WHERE email=?');
                $query->execute([$email]);
                if ($query->fetchColumn()) throw new AuthError('Este e-mail não está disponível.', 409);
                $mailFile = issueVerification($db, $id, $email, 'change');
                $message = 'Confirme o link enviado ao novo endereço. Seu e-mail atual continua válido até lá.';
                break;
            case 'change-password':
                $password = inputText($input, 'password');
                validPassword($password);
                if (password_verify($password, $row['password_hash'])) throw new AuthError('Escolha uma senha diferente da atual.', 422);
                $db->prepare('UPDATE users SET password_hash=?, auth_version=auth_version+1 WHERE id=?')
                    ->execute([password_hash($password, PASSWORD_DEFAULT), $id]);
                $db->prepare('DELETE FROM password_reset_tokens WHERE user_id=?')->execute([$id]);
                // Alterar credenciais cancela também qualquer troca de e-mail pendente.
                $db->prepare("DELETE FROM email_verification_tokens WHERE user_id=? AND purpose='change'")->execute([$id]);
                $signOut = true;
                $message = 'Senha atualizada. Todas as sessões foram encerradas. Entre novamente.';
                break;
            case 'logout-all':
                $db->prepare('UPDATE users SET auth_version=auth_version+1 WHERE id=?')->execute([$id]);
                $signOut = true;
                $message = 'Todas as sessões foram encerradas.';
                break;
            case 'export-data':
                $export = ['name' => $row['name'], 'email' => $row['email'],
                    'emailVerified' => $row['email_verified_at'] !== null, 'createdAt' => $row['created_at'],
                    'updatedAt' => $row['updated_at']];
                $message = 'Seus dados estão prontos para download.';
                break;
            case 'delete-account':
                if (inputText($input, 'confirmation') !== 'EXCLUIR') throw new AuthError('Digite EXCLUIR para confirmar.', 422);
                $db->prepare('DELETE FROM users WHERE id=?')->execute([$id]);
                $signOut = true;
                $message = 'Sua conta foi excluída.';
                break;
            default:
                throw new AuthError('Operação não encontrada.', 404);
        }
        $db->commit();
    } catch (Throwable $error) {
        if ($db->inTransaction()) $db->rollBack();
        if ($mailFile && is_file($mailFile)) unlink($mailFile);
        throw $error;
    }
    if ($signOut) clearIdentity();
    if ($action === 'delete-account') purgeAccountMail($id, $user['email']);
    $result = sessionPayload($db, $message);
    if ($export !== null) $result['data'] = $export;
    respond($result);
}
