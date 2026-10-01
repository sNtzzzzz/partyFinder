<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require dirname(__DIR__) . '/src/database.php';
$db = connectDatabase();
foreach (glob(__DIR__ . '/migrations/*.sql') as $file) {
    $db->exec(file_get_contents($file));
    echo basename($file) . " aplicada.\n";
}
