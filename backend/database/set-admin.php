<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit;
require dirname(__DIR__) . '/src/database.php';
require dirname(__DIR__) . '/src/auth-common.php';
$email = validEmail($argv[1] ?? '');
$db = connectDatabase();
$query = $db->prepare('SELECT id, name, email_verified_at FROM users WHERE email=?');
$query->execute([$email]);
$user = $query->fetch();
if (!$user) { fwrite(STDERR, "Conta não encontrada; nenhuma conta criada.\n"); exit(1); }
$db->prepare("UPDATE users SET role='admin' WHERE id=?")->execute([$user['id']]);
echo 'Administrador: ' . $user['name'] . PHP_EOL;
echo $user['email_verified_at'] ? "E-mail confirmado.\n" : "Confirme o e-mail pelo fluxo da conta para acessar o painel.\n";
