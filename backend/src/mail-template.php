<?php
declare(strict_types=1);

function nightoutMailContent(string $subject, string $message, string $url): array
{
    $reset = str_contains($url, '#reset-password=');
    $change = $subject === 'Confirme seu novo e-mail no NightOut';
    $title = $reset ? 'Vamos recuperar seu acesso.' : ($change ? 'Seu novo e-mail, confirmado.' : 'Falta pouco para começar sua noite.');
    $intro = $reset ? 'Recebemos um pedido para redefinir sua senha. Escolha uma nova para voltar ao NightOut.' : ($change ? 'Confirme este endereço para concluir a troca do e-mail da sua conta.' : 'Confirme seu e-mail para completar sua conta no NightOut.');
    $button = $reset ? 'Redefinir minha senha' : ($change ? 'Confirmar meu novo e-mail' : 'Confirmar meu e-mail');
    $expiry = $reset ? 'Este link vale por 30 minutos e só pode ser usado uma vez.' : 'Este link vale por 24 horas e só pode ser usado uma vez.';
    $escape = fn(string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeUrl = $escape($url);
    $html = '<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'.$escape($subject).'</title></head>'
        .'<body style="margin:0;padding:0;background-color:#0b0b0b;color:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">'
        .'<div style="display:none;max-height:0;overflow:hidden;opacity:0;">'.$escape($intro).'</div>'
        .'<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b0b;"><tr><td align="center" style="padding:32px 16px;">'
        .'<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#151515;border:1px solid #303030;border-radius:16px;">'
        .'<tr><td style="padding:32px 28px 24px;border-bottom:1px solid #303030;"><span aria-label="NightOut" style="font-size:32px;font-weight:700;letter-spacing:-1.5px;color:#f2f2f2;">nightout<span style="color:#b03a48;">.</span></span><p style="margin:8px 0 0;font-size:13px;color:#b6b6b6;">A noite é sua. A cidade também.</p></td></tr>'
        .'<tr><td style="padding:32px 28px;"><h1 style="margin:0 0 18px;font-size:26px;line-height:1.3;color:#f2f2f2;">'.$escape($title).'</h1>'
        .'<p style="margin:0 0 26px;font-size:16px;line-height:1.6;color:#d0d0d0;">'.$escape($intro).'</p>'
        .'<table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#842638" style="border-radius:8px;"><a href="'.$safeUrl.'" style="display:inline-block;padding:16px 24px;border:1px solid #842638;border-radius:8px;background-color:#842638;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;">'.$escape($button).'</a></td></tr></table>'
        .'<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#b6b6b6;">'.$escape($expiry).'</p>'
        .'<p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#b6b6b6;">Se o botão não funcionar, copie este endereço para o navegador:<br><a href="'.$safeUrl.'" style="color:#d8a0aa;word-break:break-all;">'.$safeUrl.'</a></p>'
        .'<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#b6b6b6;">'.$escape($message).'</p></td></tr>'
        .'<tr><td style="padding:20px 28px;border-top:1px solid #303030;font-size:12px;line-height:1.6;color:#a0a0a0;">Se não solicitou esta ação, ignore este e-mail. Não compartilhe este link.<br>Equipe NightOut</td></tr>'
        .'</table></td></tr></table></body></html>';
    return ['htmlContent'=>$html, 'textContent'=>"NightOut\n\n$title\n\n$intro\n\n$button:\n$url\n\n$expiry\n\n$message\n\nSe não solicitou esta ação, ignore este e-mail. Não compartilhe este link.\nEquipe NightOut"];
}
