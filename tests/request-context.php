<?php
declare(strict_types=1);
require dirname(__DIR__) . '/backend/src/request-context.php';
function check(bool $condition, string $name): void {
    if (!$condition) throw new RuntimeException($name);
    echo 'OK: ' . $name . PHP_EOL;
}
$token = str_repeat('a', 64);
putenv('NIGHTOUT_PROXY_TOKEN=' . $token);
$_SERVER = ['REMOTE_ADDR' => '192.168.15.9', 'HTTP_X_FORWARDED_PROTO' => 'https',
    'HTTP_X_NIGHTOUT_PROXY_TOKEN' => $token, 'HTTP_X_NIGHTOUT_CLIENT_IP' => '1.2.3.4'];
check(!secureRequest() && requestClientIp() === '192.168.15.9', 'remote client cannot forge proxy metadata');
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_X_NIGHTOUT_PROXY_TOKEN'] = 'wrong';
check(!secureRequest() && requestClientIp() === '127.0.0.1', 'loopback without correct token is untrusted');
$_SERVER['HTTP_X_NIGHTOUT_PROXY_TOKEN'] = $token;
check(secureRequest() && requestClientIp() === '1.2.3.4', 'trusted proxy enables secure cookies and client limits');
$_SERVER['HTTP_X_NIGHTOUT_CLIENT_IP'] = 'not-an-ip';
check(requestClientIp() === '127.0.0.1', 'invalid forwarded IP is rejected');
putenv('NIGHTOUT_PROXY_TOKEN');
check(!secureRequest(), 'proxy trust disabled by default');
$_SERVER['HTTPS'] = 'on';
check(secureRequest(), 'native HTTPS remains supported');
