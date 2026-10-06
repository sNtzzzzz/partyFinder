param([string]$Address, [switch]$Stop)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDirectory = Join-Path $PSScriptRoot 'storage/https'
$stateFile = Join-Path $runtimeDirectory 'processes.json'
$phpExecutable = 'C:\xampp\php\php.exe'
$mkcertExecutable = Join-Path $PSScriptRoot 'storage/https-tools/mkcert.exe'
$caddyExecutable = Join-Path $PSScriptRoot 'storage/https-tools/caddy/caddy.exe'

function Stop-OwnedServers {
    if (-not (Test-Path -LiteralPath $stateFile)) { return }
    $state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
    foreach ($entry in $state.processes) {
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($entry.id)"
        if ($process -and $process.CreationDate.ToUniversalTime().ToString('o') -eq $entry.createdAt -and
            $process.ExecutablePath -eq $entry.executable) { Stop-Process -Id $entry.id }
    }
    Remove-Item -LiteralPath $stateFile
}

if ($Stop) { Stop-OwnedServers; Write-Output 'HTTPS local encerrado.'; exit }
foreach ($file in @($phpExecutable, $mkcertExecutable, $caddyExecutable)) {
    if (-not (Test-Path -LiteralPath $file)) { throw "Ferramenta ausente: $file. Consulte docs/https-local.md." }
}
if (-not $Address) {
    $Address = [Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces() |
        Where-Object { $_.OperationalStatus -eq 'Up' -and $_.GetIPProperties().GatewayAddresses.Count -gt 0 } |
        ForEach-Object { $_.GetIPProperties().UnicastAddresses } |
        Where-Object { $_.Address.AddressFamily -eq 'InterNetwork' -and -not [Net.IPAddress]::IsLoopback($_.Address) } |
        Select-Object -First 1 -ExpandProperty Address | ForEach-Object { $_.ToString() }
}
$parsedAddress = $null
if (-not [Net.IPAddress]::TryParse($Address, [ref]$parsedAddress) -or $parsedAddress.AddressFamily -ne 'InterNetwork') {
    throw 'Informe o IPv4 da rede com -Address. Exemplo: -Address 192.168.15.6'
}
$localAddresses = [Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces() |
    ForEach-Object { $_.GetIPProperties().UnicastAddresses } | ForEach-Object { $_.Address.ToString() }
if ($Address -notin $localAddresses) { throw 'O IP informado não pertence a este computador.' }
New-Item -ItemType Directory -Path $runtimeDirectory -Force | Out-Null
Stop-OwnedServers
# Fail on occupied ports: never terminate an unrelated server automatically.
foreach ($port in @(8000,8002,8443)) {
    if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) {
        throw "Porta $port ocupada. Encerre o servidor anterior antes de iniciar HTTPS."
    }
}
$previousCaRoot = $env:CAROOT
try {
    $env:CAROOT = Join-Path $runtimeDirectory 'ca'
    & $mkcertExecutable -cert-file (Join-Path $runtimeDirectory 'site.pem') -key-file (Join-Path $runtimeDirectory 'site-key.pem') localhost 127.0.0.1 ::1 $Address
    if ($LASTEXITCODE -ne 0) { throw 'Falha na geração do certificado.' }
} finally { $env:CAROOT = $previousCaRoot }
$caFile = Join-Path $runtimeDirectory 'ca/rootCA.pem'
$caCertificate = [Security.Cryptography.X509Certificates.X509Certificate2]::new($caFile)
if (-not (Test-Path -LiteralPath "Cert:\CurrentUser\Root\$($caCertificate.Thumbprint)")) {
    throw 'Autoridade ainda não confiável neste computador. Consulte docs/https-local.md para instalar o certificado público.'
}
Copy-Item -LiteralPath $caFile -Destination (Join-Path $runtimeDirectory 'nightout-local-ca.crt') -Force
$tokenBytes = New-Object byte[] 32
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
try { $random.GetBytes($tokenBytes) } finally { $random.Dispose() }
$proxyToken = ([BitConverter]::ToString($tokenBytes)).Replace('-', '').ToLowerInvariant()
$caddyConfig = Join-Path $runtimeDirectory 'Caddyfile'
$tlsDirectory = $runtimeDirectory.Replace('\','/')
$config = @"
{
    admin off
    persist_config off
    auto_https disable_redirects
}
https://localhost:8443, https://127.0.0.1:8443, https://${Address}:8443 {
    tls "$tlsDirectory/site.pem" "$tlsDirectory/site-key.pem"
    reverse_proxy 127.0.0.1:8002 {
        header_up X-Nightout-Proxy-Token $proxyToken
        header_up X-Nightout-Client-IP {remote_host}
        header_up X-Forwarded-Proto https
    }
}
http://localhost:8000, http://127.0.0.1:8000, http://${Address}:8000 {
    @certificate path /certificado-local.crt
    handle @certificate {
        root * "$tlsDirectory"
        rewrite * /nightout-local-ca.crt
        header Content-Type application/x-x509-ca-cert
        header Content-Disposition "attachment; filename=nightout-local-ca.crt"
        file_server
    }
    handle {
        redir https://${Address}:8443{uri} 302
    }
}
"@
[IO.File]::WriteAllText($caddyConfig, $config, [Text.UTF8Encoding]::new($false))
& $caddyExecutable validate --config $caddyConfig --adapter caddyfile
if ($LASTEXITCODE -ne 0) { throw 'Configuração do Caddy inválida.' }
$started = @()
$previousToken = $env:NIGHTOUT_PROXY_TOKEN
$previousUrl = $env:NIGHTOUT_APP_URL
try {
    $env:NIGHTOUT_PROXY_TOKEN = $proxyToken
    $env:NIGHTOUT_APP_URL = "https://${Address}:8443"
    $phpArguments = @('-S', '127.0.0.1:8002', '-t', ('"' + (Join-Path $PSScriptRoot 'public') + '"'), ('"' + (Join-Path $PSScriptRoot 'public/router.php') + '"'))
    $started += Start-Process -FilePath $phpExecutable -ArgumentList $phpArguments -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtimeDirectory 'php.stdout.log') -RedirectStandardError (Join-Path $runtimeDirectory 'php.stderr.log')
    $started += Start-Process -FilePath $caddyExecutable -ArgumentList @('run', '--config', ('"' + $caddyConfig + '"'), '--adapter', 'caddyfile') -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtimeDirectory 'caddy.stdout.log') -RedirectStandardError (Join-Path $runtimeDirectory 'caddy.stderr.log')
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        foreach ($process in $started) {
            $process.Refresh()
            if ($process.HasExited) { throw 'Servidor encerrou durante a inicialização. Consulte os logs em backend/storage/https.' }
        }
        $listeners = @(Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
            Where-Object { $_.LocalPort -in @(8000,8002,8443) -and $_.OwningProcess -in $started.Id })
        if (@($listeners.LocalPort | Select-Object -Unique).Count -eq 3) { $ready = $true; break }
        Start-Sleep -Milliseconds 200
    }
    if (-not $ready) { throw 'Servidores não abriram as portas esperadas. Consulte os logs em backend/storage/https.' }
    $ownedProcesses = foreach ($process in $started) {
        $metadata = Get-CimInstance Win32_Process -Filter "ProcessId = $($process.Id)"
        @{ id=$process.Id; executable=$metadata.ExecutablePath; createdAt=$metadata.CreationDate.ToUniversalTime().ToString('o') }
    }
    @{ address=$Address; url="https://${Address}:8443"; processes=@($ownedProcesses) } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $stateFile -Encoding utf8
} catch {
    foreach ($process in $started) { if (-not $process.HasExited) { Stop-Process -Id $process.Id } }
    throw
} finally { $env:NIGHTOUT_PROXY_TOKEN = $previousToken; $env:NIGHTOUT_APP_URL = $previousUrl }
Write-Output "Site: https://${Address}:8443"
Write-Output "Certificado público para celular: http://${Address}:8000/certificado-local.crt"
Write-Output 'Servidores em segundo plano. Para encerrar: .\backend\start-https.ps1 -Stop'
