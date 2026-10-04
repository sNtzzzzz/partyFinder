<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit;
$run = bin2hex(random_bytes(8));
putenv('NIGHTOUT_TEST_RUN=' . $run);
require dirname(__DIR__) . '/backend/src/database.php';
$root = dirname(__DIR__);
$server = connectDatabase(true);
$name = 'nightout_test_' . $run;
$process = null;
$exitCode = 1;
try {
    $server->exec("CREATE DATABASE `$name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $db = connectDatabase();
    foreach (glob($root . '/backend/database/migrations/*.sql') as $file) $db->exec(file_get_contents($file));
    // Porta efêmera reduz conflito com os servidores manuais.
    $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $error);
    if (!$socket) throw new RuntimeException($error);
    $address = stream_socket_get_name($socket, false);
    fclose($socket);
    $log = $root . '/backend/storage/auth-test-' . $run . '.log';
    if (!is_dir(dirname($log))) mkdir(dirname($log), 0700, true);
    $process = proc_open([PHP_BINARY, '-S', $address, '-t', $root . '/backend/public', $root . '/backend/public/router.php'],
        [0 => ['pipe', 'r'], 1 => ['file', $log, 'a'], 2 => ['file', $log, 'a']], $pipes, $root);
    if (!is_resource($process)) throw new RuntimeException('Não foi possível iniciar o servidor de teste.');
    fclose($pipes[0]);
    $base = 'http://' . $address;
    $ready = false;
    for ($i = 0; $i < 50; $i++) {
        $context = stream_context_create(['http' => ['timeout' => 1]]);
        $health = @file_get_contents($base . '/api/v1/health', false, $context);
        if ($health && (json_decode($health, true)['testRun'] ?? '') === $run) { $ready = true; break; }
        usleep(100000);
    }
    if (!$ready) throw new RuntimeException('Servidor de teste não respondeu. Consulte ' . $log);
    $argv = [__DIR__ . '/auth.php', $base];
    require __DIR__ . '/auth.php';
    require __DIR__ . '/recovery.php';
    $exitCode = 0;
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage() . PHP_EOL);
} finally {
    if (is_resource($process)) { proc_terminate($process); proc_close($process); }
    // Nome gerado internamente e limitado a hexadecimal; nunca o banco nightout.
    if (preg_match('/^nightout_test_[a-f0-9]{16}$/D', $name)) $server->exec("DROP DATABASE `$name`");
}
exit($exitCode);
