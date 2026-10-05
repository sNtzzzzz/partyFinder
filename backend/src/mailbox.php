<?php
declare(strict_types=1);
require_once __DIR__ . '/mail.php';

// A caixa de desenvolvimento só oferece links ainda utilizáveis.
function activeLocalMail(PDO $db, ?string $kind = null): array
{
    $active = [];
    foreach (glob(mailOutbox() . '/*.json') as $file) {
        $mail = json_decode(file_get_contents($file), true);
        if (!is_array($mail) || !is_string($mail['url'] ?? null)) continue;
        $fragment = parse_url($mail['url'], PHP_URL_FRAGMENT);
        if (!is_string($fragment) || !preg_match('/^(verify-email|reset-password)=([a-f0-9]{64})$/D', $fragment, $parts)) continue;
        $verification = $parts[1] === 'verify-email';
        $mail['kind'] = $verification ? 'verification' : 'recovery';
        if ($kind !== null && $mail['kind'] !== $kind) continue;
        $sql = $verification
            ? 'SELECT expires_at FROM email_verification_tokens WHERE token_hash=? AND email=?'
            : 'SELECT r.expires_at FROM password_reset_tokens r JOIN users u ON u.id=r.user_id WHERE r.token_hash=? AND u.email=?';
        $query = $db->prepare($sql);
        $query->execute([hash('sha256', $parts[2]), $mail['to'] ?? '']);
        $expires = $query->fetchColumn();
        if ($expires === false || (int)$expires <= time()) continue;
        $mail['expiresAt'] = (int)$expires;
        $active[] = $mail;
    }
    usort($active, fn(array $a, array $b): int => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
    return $active;
}
