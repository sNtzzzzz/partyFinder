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
    '/api/v1/venues' => 'GET', '/api/v1/admin/venues' => ['GET','POST'],
    '/api/v1/admin/venues/photo' => 'POST',
    '/api/v1/auth/forgot-password' => 'POST', '/api/v1/auth/reset-password' => 'POST',
    '/api/v1/auth/verify-email' => 'POST', '/api/v1/auth/resend-verification' => 'POST',
    '/api/v1/auth/update-profile' => 'POST', '/api/v1/auth/change-email' => 'POST',
    '/api/v1/auth/change-password' => 'POST', '/api/v1/auth/logout-all' => 'POST',
    '/api/v1/auth/export-data' => 'POST', '/api/v1/auth/delete-account' => 'POST',
    '/' => 'GET', '/api/v1/health' => 'GET', '/api/v1/auth/me' => 'GET',
    '/api/v1/auth/register' => 'POST', '/api/v1/auth/login' => 'POST', '/api/v1/auth/logout' => 'POST',
];

if (!isset($routes[$path])) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Rota não encontrada.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!in_array($_SERVER['REQUEST_METHOD'], (array)$routes[$path], true)) {
    http_response_code(405);
    header('Allow: ' . implode(', ', (array)$routes[$path]));
    echo json_encode(['status' => 'error', 'message' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

require dirname(__DIR__) . '/src/database.php';

try {
    $database = connectDatabase();
    if ($path === '/api/v1/venues' || str_starts_with($path, '/api/v1/admin/venues')) {
        require dirname(__DIR__) . '/src/catalog.php';
        handleCatalog($database, $path);
    }
    if (str_starts_with($path, '/api/v1/auth/')) handleAuth($database, basename($path));
    $database->query('SELECT 1')->fetchColumn();
    echo json_encode([
        'status' => 'ok',
        'service' => 'NightOut API',
        'database' => 'connected',
        'testRun' => getenv('NIGHTOUT_TEST_RUN') ?: null,
        'message' => 'API funcionando e banco conectado.',
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (AuthError $error) {
    if (isset($database) && $database->inTransaction()) $database->rollBack();
    respond(['message' => $error->getMessage()] + $error->details, $error->status);
} catch (Throwable $error) {
    if (isset($database) && $database->inTransaction()) $database->rollBack();
    error_log('NightOut request failed: ' . $error->getMessage());
    http_response_code(503);
    echo json_encode([
        'status' => 'error',
        'message' => 'Serviço temporariamente indisponível. Tente novamente em instantes.',
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
