<?php
declare(strict_types=1);
// Servir somente recursos explicitamente públicos, nunca a raiz inteira do projeto.
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
if (str_starts_with($path, '/api/')) {
    require __DIR__ . '/index.php';
    return;
}
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');
$root = dirname(__DIR__, 2);
$allowed = ['/admin.html' => 'admin.html', '/conta.html' => 'conta.html', '/' => 'index.html', '/index.html' => 'index.html', '/assets/favicon.svg' => 'assets/favicon.svg'];
if (preg_match('#^/media/venues/([a-f0-9]{32}(?:-card)?\.webp)$#D', $path, $match)) {
    if (!in_array($_SERVER['REQUEST_METHOD'], ['GET','HEAD'], true)) { header('Allow: GET, HEAD'); http_response_code(405); exit; }
    require_once dirname(__DIR__) . '/src/catalog.php';
    $image = catalogImageDirectory() . '/' . $match[1];
    if (!is_file($image)) { http_response_code(404); exit; }
    header('Content-Type: image/webp'); header('X-Content-Type-Options: nosniff');
    if ($_SERVER['REQUEST_METHOD'] === 'GET') readfile($image);
    exit;
}
foreach (['js' => 'js', 'styles' => 'css'] as $directory => $extension) {
    foreach (glob($root . '/' . $directory . '/*.' . $extension) as $file) {
        if ($directory === 'js' && basename($file) === 'data.js') continue; // Historical import snapshot, not the live catalog.
        $allowed['/' . $directory . '/' . basename($file)] = $directory . '/' . basename($file);
    }
}
foreach (['jpg', 'webp'] as $extension) {
    foreach (glob($root . '/assets/venues/*.' . $extension) as $file) {
        $allowed['/assets/venues/' . basename($file)] = 'assets/venues/' . basename($file);
    }
}
if (!isset($allowed[$path])) { http_response_code(404); exit('Não encontrado.'); }
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    header('Allow: GET, HEAD'); http_response_code(405); exit;
}
$file = $root . '/' . $allowed[$path];
$types = ['html' => 'text/html', 'css' => 'text/css', 'js' => 'text/javascript', 'svg' => 'image/svg+xml', 'jpg' => 'image/jpeg', 'webp' => 'image/webp'];
header('Content-Type: ' . $types[pathinfo($file, PATHINFO_EXTENSION)] . '; charset=utf-8');
header('X-Content-Type-Options: nosniff');
if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') readfile($file);
