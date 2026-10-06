<?php
declare(strict_types=1);

// Only the explicitly configured local proxy may supply connection metadata.
function trustedLocalProxy(): bool
{
    $token = getenv('NIGHTOUT_PROXY_TOKEN');
    return is_string($token) && strlen($token) >= 32
        && in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)
        && hash_equals($token, $_SERVER['HTTP_X_NIGHTOUT_PROXY_TOKEN'] ?? '');
}

function secureRequest(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (trustedLocalProxy() && ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function requestClientIp(): string
{
    $forwarded = $_SERVER['HTTP_X_NIGHTOUT_CLIENT_IP'] ?? '';
    if (trustedLocalProxy() && filter_var($forwarded, FILTER_VALIDATE_IP)) return $forwarded;
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}
