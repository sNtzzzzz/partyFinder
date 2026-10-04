<?php

declare(strict_types=1);

// Avisos internos ficam no log, nunca misturados ao JSON da API.
ini_set('display_errors', '0');
ini_set('log_errors', '1');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
require dirname(__DIR__) . '/src/auth.php';
$routes = [
    '/api/v1/auth/forgot-password' => 'POST', '/api/v1/auth/reset-password' => 'POST',
    '/' => 'GET', '/api/v1/health' => 'GET', '/api/v1/auth/me' => 'GET',
    '/api/v1/auth/register' => 'POST', '/api/v1/auth/login' => 'POST', '/api/v1/auth/logout' => 'POST',
];

if (!isset($routes[$path])) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Rota não encontrada.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== $routes[$path]) {
    http_response_code(405);
    header('Allow: ' . $routes[$path]);
    echo json_encode(['status' => 'error', 'message' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

require dirname(__DIR__) . '/src/database.php';

try {
    $database = connectDatabase();
    if (str_starts_with($path, '/api/v1/auth/')) handleAuth($database, basename($path));
    $database->query('SELECT 1')->fetchColumn();
    echo json_encode([
        'status' => 'ok',
        'service' => 'NightOut API',
        'database' => 'connected',
        'testRun' => getenv('NIGHTOUT_TEST_RUN') ?: null,
        'message' => 'API funcionando e banco conectado.',
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Throwable $error) {
    error_log('NightOut database check failed: ' . $error->getMessage());
    http_response_code(503);
    echo json_encode([
        'status' => 'error',
        'message' => 'Banco indisponível. Confira o MySQL no XAMPP e a configuração local.',
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
