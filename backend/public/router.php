<?php
declare(strict_types=1);
// Servir somente recursos explicitamente públicos, nunca a raiz inteira do projeto.
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
if (str_starts_with($path, '/api/')) {
    require __DIR__ . '/index.php';
    return;
}
$root = dirname(__DIR__, 2);
$allowed = ['/' => 'index.html', '/index.html' => 'index.html'];
foreach (['js' => 'js', 'styles' => 'css'] as $directory => $extension) {
    foreach (glob($root . '/' . $directory . '/*.' . $extension) as $file) {
        $allowed['/' . $directory . '/' . basename($file)] = $directory . '/' . basename($file);
    }
}
if (!isset($allowed[$path])) { http_response_code(404); exit('Não encontrado.'); }
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    header('Allow: GET, HEAD'); http_response_code(405); exit;
}
$file = $root . '/' . $allowed[$path];
$types = ['html' => 'text/html', 'css' => 'text/css', 'js' => 'text/javascript'];
header('Content-Type: ' . $types[pathinfo($file, PATHINFO_EXTENSION)] . '; charset=utf-8');
header('X-Content-Type-Options: nosniff');
if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') readfile($file);
