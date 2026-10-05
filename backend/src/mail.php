<?php
declare(strict_types=1);

function mailOutbox(): string
{
    $run = getenv('NIGHTOUT_TEST_RUN');
    if ($run && !preg_match('/^[a-f0-9]{16}$/D', $run)) throw new RuntimeException('Invalid test run.');
    return dirname(__DIR__) . '/storage/' . ($run ? 'outbox-test-' . $run : 'outbox');
}

function appUrl(): string
{
    $url = rtrim(getenv('NIGHTOUT_APP_URL') ?: 'http://127.0.0.1:8000', '/');
    $parts = parse_url($url);
    if (!$parts || !in_array($parts['scheme'] ?? '', ['http', 'https'], true)
        || empty($parts['host']) || isset($parts['user']) || isset($parts['query']) || isset($parts['fragment'])) {
        throw new RuntimeException('Invalid application URL.');
    }
    return $url;
}

function storeMail(int $userId, string $email, string $subject, string $message, string $url, string $kind): string
{
    // Transporte local deliberado: não enviar mensagens reais implicitamente.
    if (getenv('NIGHTOUT_ENV') === 'production') {
        throw new RuntimeException('Configure a real mail transport before enabling production.');
    }
    $directory = mailOutbox();
    if (!is_dir($directory) && !mkdir($directory, 0700, true)) throw new RuntimeException('Outbox unavailable.');
    $file = $directory . '/' . gmdate('Ymd-His') . '-' . bin2hex(random_bytes(8)) . '.json';
    $mail = ['userId' => $userId, 'to' => $email, 'kind' => $kind, 'subject' => $subject,
        'message' => $message, 'url' => $url, 'createdAt' => gmdate(DATE_ATOM)];
    if (file_put_contents($file, json_encode($mail, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), LOCK_EX) === false) {
        throw new RuntimeException('Outbox write failed.');
    }
    return $file;
}

function purgeAccountMail(int $userId, string $email): void
{
    foreach (glob(mailOutbox() . '/*.json') as $file) {
        $mail = json_decode(file_get_contents($file), true);
        if ((int)($mail['userId'] ?? 0) === $userId || (!isset($mail['userId']) && ($mail['to'] ?? '') === $email)) {
            if (!unlink($file)) throw new RuntimeException('Mail cleanup failed.');
        }
    }
}
