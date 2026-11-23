$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env'

if (Test-Path -LiteralPath $envFile) {
    Get-Content -LiteralPath $envFile | ForEach-Object {
        if ($_ -match '^(VITE_[A-Z0-9_]+)=(.*)$') {
            $value = $matches[2]
            if ($value.Length -ge 2 -and $value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            [Environment]::SetEnvironmentVariable($matches[1], $value, 'Process')
        }
    }
}

$frontend = Join-Path $projectRoot 'frontend'
Push-Location $frontend
try {
    if (-not (Test-Path -LiteralPath 'node_modules')) {
        Write-Host 'Installing frontend dependencies from package-lock.json...'
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    $apiUrl = if ([string]::IsNullOrWhiteSpace($env:VITE_API_URL)) { 'http://localhost:8080/api' } else { $env:VITE_API_URL }
    Write-Host "Starting Vite; API base URL is $apiUrl."
    & npm.cmd run dev -- --host 127.0.0.1
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
