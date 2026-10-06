<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit;
require_once dirname(__DIR__) . '/src/database.php';
function importCatalog(PDO $db): int {
    $seed = json_decode(file_get_contents(__DIR__ . '/catalog-seed.json'), true, 64, JSON_THROW_ON_ERROR);
    $insert = $db->prepare('INSERT IGNORE INTO venues (id, document, published, sort_order) VALUES (?, ?, 1, ?)');
    $count = 0;
    $db->beginTransaction();
    try {
        foreach ($seed as $index => $venue) {
            $insert->execute([$venue['id'], json_encode($venue, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), $index]);
            $count += $insert->rowCount();
        }
        $db->commit();
    } catch (Throwable $error) { $db->rollBack(); throw $error; }
    return $count;
}
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    echo importCatalog(connectDatabase()) . " locais importados. Registros existentes preservados.\n";
}
