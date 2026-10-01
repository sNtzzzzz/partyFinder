$ErrorActionPreference = 'Stop'
$phpExecutable = 'C:\xampp\php\php.exe'
if (-not (Test-Path -LiteralPath $phpExecutable)) {
    throw 'PHP nao encontrado em C:\xampp\php\php.exe. Ajuste o caminho neste script.'
}

# Servidor apenas local; a pasta de configuracao nao fica exposta.
& $phpExecutable -S 127.0.0.1:8000 -t "$PSScriptRoot\public" "$PSScriptRoot\public\router.php"
