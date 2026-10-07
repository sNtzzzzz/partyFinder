<?php
declare(strict_types=1);
require_once __DIR__ . '/mail-template.php';
final class MailDeliveryError extends RuntimeException {}

function mailConfiguration(): array
{
    // Isolated tests must never inherit production credentials or send real mail.
    if (getenv('NIGHTOUT_TEST_RUN')) return ['transport'=>'local','environment'=>'test'];
    $file = dirname(__DIR__) . '/config/mail.local.php';
    $config = is_file($file) ? require $file : [];
    if (!is_array($config)) throw new RuntimeException('Invalid mail configuration.');
    return $config + ['transport'=>'local','environment'=>getenv('NIGHTOUT_ENV') ?: 'development'];
}

function brevoPayload(array $config, string $email, string $subject, string $message, string $url): array
{
    if (!filter_var($config['fromEmail'] ?? '', FILTER_VALIDATE_EMAIL) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('Invalid mail address configuration.');
    }
    $name = $config['fromName'] ?? 'NightOut';
    if (!is_string($name) || strlen($name)>100 || preg_match('/[\r\n]/', $name)) throw new RuntimeException('Invalid sender name.');
    return ['sender'=>['name'=>$name,'email'=>$config['fromEmail']], 'to'=>[['email'=>$email]],
        'subject'=>$subject] + nightoutMailContent($subject, $message, $url);
}

function validateBrevoResponse(int $status, string $body): void
{
    try { $result = json_decode($body, true, 16, JSON_THROW_ON_ERROR); }
    catch (JsonException) { throw new RuntimeException('Brevo returned an invalid response.'); }
    if ($status !== 201 || !is_array($result) || !is_string($result['messageId'] ?? null) || $result['messageId'] === '') {
        // Never include raw responses, recipients, tokens or credentials in application logs.
        throw new RuntimeException('Brevo did not accept the email (HTTP ' . $status . ').');
    }
}

function sendBrevoMail(array $config, string $email, string $subject, string $message, string $url): void
{
    $key = $config['apiKey'] ?? '';
    if (!is_string($key) || strlen($key)<20 || strlen($key)>512 || preg_match('/[\r\n]/', $key)) throw new MailDeliveryError('Configure a valid Brevo API key.');
    $payload = brevoPayload($config,$email,$subject,$message,$url);
    $curl = curl_init('https://api.brevo.com/v3/smtp/email');
    if ($curl === false) throw new RuntimeException('Mail HTTP client unavailable.');
    $response = '';
    try {
        curl_setopt_array($curl, [CURLOPT_POST=>true, CURLOPT_HTTPHEADER=>['api-key: '.$key,'Content-Type: application/json','Accept: application/json'],
            CURLOPT_POSTFIELDS=>json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            CURLOPT_CONNECTTIMEOUT=>5, CURLOPT_TIMEOUT=>15, CURLOPT_FOLLOWLOCATION=>false,
            CURLOPT_SSL_VERIFYPEER=>true, CURLOPT_SSL_VERIFYHOST=>2, CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS,
            CURLOPT_WRITEFUNCTION=>function($handle,string $chunk) use (&$response): int {
                if (strlen($response)+strlen($chunk)>8192) return 0;
                $response .= $chunk; return strlen($chunk);
            }]);
        if (curl_exec($curl) === false) throw new MailDeliveryError('Brevo connection failed (code '.curl_errno($curl).').');
        try { validateBrevoResponse((int)curl_getinfo($curl,CURLINFO_RESPONSE_CODE),$response); }
        catch (RuntimeException $error) { throw new MailDeliveryError($error->getMessage()); }
    } finally { curl_close($curl); }
}
