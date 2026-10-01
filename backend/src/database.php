<?php

declare(strict_types=1);

function connectDatabase(bool $withoutDatabase = false): PDO
{
    $directory = dirname(__DIR__) . '/config/';
    $configuration = is_file($directory . 'local.php')
        ? $directory . 'local.php'
        : $directory . 'database.example.php';
    $config = require $configuration;
    $testRun = getenv('NIGHTOUT_TEST_RUN');
    if ($testRun !== false && $testRun !== '') {
        if (!preg_match('/^[a-f0-9]{16}$/D', $testRun)) throw new RuntimeException('Invalid test run.');
        $config['database'] = 'nightout_test_' . $testRun;
    } elseif ($withoutDatabase) {
        throw new RuntimeException('Server connection is allowed only for isolated tests.');
    }

    return new PDO(
        sprintf(
            'mysql:host=%s;port=%d;%scharset=utf8mb4',
            $config['host'],
            $config['port'],
            $withoutDatabase ? '' : 'dbname=' . $config['database'] . ';'
        ),
        $config['username'],
        $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 5,
        ]
    );
}
