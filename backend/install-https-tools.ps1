$ErrorActionPreference = 'Stop'
$directory = Join-Path $PSScriptRoot 'storage/https-tools'
New-Item -ItemType Directory -Path $directory -Force | Out-Null
$headers = @{ 'User-Agent' = 'NightOut-local-https-setup' }
$mkcert = Invoke-RestMethod 'https://api.github.com/repos/FiloSottile/mkcert/releases/latest' -Headers $headers
$caddy = Invoke-RestMethod 'https://api.github.com/repos/caddyserver/caddy/releases/latest' -Headers $headers
$mkAsset = $mkcert.assets | Where-Object name -eq "mkcert-$($mkcert.tag_name)-windows-amd64.exe"
$cdAsset = $caddy.assets | Where-Object name -eq "caddy_$($caddy.tag_name.TrimStart('v'))_windows_amd64.zip"
$sums = $caddy.assets | Where-Object name -like '*checksums.txt'
if (-not $mkAsset -or -not $cdAsset -or -not $sums) { throw 'Arquivos oficiais esperados não encontrados.' }
Invoke-WebRequest $mkAsset.browser_download_url -OutFile "$directory/mkcert.exe" -UseBasicParsing
Invoke-WebRequest $cdAsset.browser_download_url -OutFile "$directory/caddy.zip" -UseBasicParsing
Invoke-WebRequest $sums.browser_download_url -OutFile "$directory/checksums.txt" -UseBasicParsing
$line = Get-Content "$directory/checksums.txt" | Where-Object { ($_ -split '\s+')[-1] -eq $cdAsset.name }
$expected = ($line -split '\s+')[0]
$algorithm = if ($expected.Length -eq 128) { 'SHA512' } elseif ($expected.Length -eq 64) { 'SHA256' } else { throw 'Checksum inválido.' }
if ((Get-FileHash "$directory/caddy.zip" -Algorithm $algorithm).Hash.ToLower() -ne $expected.ToLower()) {
    throw 'Checksum Caddy divergente; arquivo não será executado.'
}
if ($mkAsset.digest -and $mkAsset.digest -like 'sha256:*' -and
    (Get-FileHash "$directory/mkcert.exe" -Algorithm SHA256).Hash.ToLower() -ne $mkAsset.digest.Substring(7).ToLower()) {
    throw 'Checksum mkcert divergente; arquivo não será executado.'
}
Expand-Archive -LiteralPath "$directory/caddy.zip" -DestinationPath "$directory/caddy" -Force
@{ mkcert=$mkcert.tag_name; caddy=$caddy.tag_name; caddyChecksumAlgorithm=$algorithm;
    caddyChecksumVerified=$true; mkcertUrl=$mkAsset.browser_download_url; caddyUrl=$cdAsset.browser_download_url
} | ConvertTo-Json | Set-Content "$directory/versions.json" -Encoding utf8
Write-Output 'Ferramentas instaladas na pasta privada backend/storage/https-tools.'
