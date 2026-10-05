<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/src/database.php';
require __DIR__ . '/src/mailbox.php';
$option = $argv[1] ?? '';
if (!in_array($option, ['', '--verification', '--recovery'], true)) {
    fwrite(STDERR, "Use: php backend/mailbox.php [--verification|--recovery]\n");
    exit(1);
}
try {
    $kind = $option === '' ? null : substr($option, 2);
    $messages = activeLocalMail(connectDatabase(), $kind);
    echo "CAIXA LOCAL — somente links válidos, mais recentes primeiro.\n";
    echo "Mensagens substituídas, usadas ou expiradas ficam ocultas.\n";
    if (!$messages) echo "Nenhum link ativo. Se necessário, solicite outro pelo site.\n";
    foreach (array_slice($messages, 0, 10) as $mail) {
        $label = $mail['kind'] === 'verification' ? 'CONFIRMAÇÃO DE E-MAIL' : 'RECUPERAÇÃO DE SENHA';
        echo "\n[" . $label . "]\nPara: " . $mail['to'] . "\n";
        echo "Criado em (UTC): " . $mail['createdAt'] . "\n";
        echo "Válido até (UTC): " . gmdate(DATE_ATOM, $mail['expiresAt']) . "\n";
        echo $mail['url'] . "\n";
    }
} catch (Throwable $error) {
    fwrite(STDERR, "Não foi possível consultar a caixa local. Confira o MySQL e as migrations.\n");
    exit(1);
}
