<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/src/recovery.php';
$files = glob(recoveryOutbox() . '/*.json');
rsort($files);
if (!$files) { echo "Nenhum e-mail local ainda.\n"; exit; }
foreach (array_slice($files, 0, 10) as $file) {
    $mail = json_decode(file_get_contents($file), true, 32, JSON_THROW_ON_ERROR);
    echo "\nPara: " . $mail['to'] . "\nAssunto: " . $mail['subject'] . "\n" . $mail['message'] . "\n" . $mail['url'] . "\n";
}
