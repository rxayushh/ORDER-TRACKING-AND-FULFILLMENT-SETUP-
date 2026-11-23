$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env'
$allowedNames = @(
    'SERVER_PORT', 'SPRING_PROFILES_ACTIVE', 'SPRING_DATASOURCE_URL',
    'SPRING_DATASOURCE_USERNAME', 'SPRING_DATASOURCE_PASSWORD',
    'JWT_SECRET', 'JWT_EXPIRATION_MS', 'CORS_ALLOWED_ORIGINS',
    'BOOTSTRAP_ADMIN_EMAIL', 'BOOTSTRAP_ADMIN_PASSWORD'
)

if (Test-Path -LiteralPath $envFile) {
    Get-Content -LiteralPath $envFile | ForEach-Object {
        if ($_ -match '^([A-Z][A-Z0-9_]*)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            if ($allowedNames -contains $name) {
                if ($value.Length -ge 2 -and $value.StartsWith('"') -and $value.EndsWith('"')) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                [Environment]::SetEnvironmentVariable($name, $value, 'Process')
            }
        }
    }
}

if ([string]::IsNullOrWhiteSpace($env:SPRING_PROFILES_ACTIVE)) {
    $env:SPRING_PROFILES_ACTIVE = 'dev'
}

if ($env:SPRING_PROFILES_ACTIVE -eq 'mysql') {
    foreach ($name in 'SPRING_DATASOURCE_URL', 'SPRING_DATASOURCE_USERNAME', 'SPRING_DATASOURCE_PASSWORD', 'JWT_SECRET') {
        if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name, 'Process')) -or
            [Environment]::GetEnvironmentVariable($name, 'Process') -like 'replace-with-*') {
            throw "Missing or placeholder $name in $envFile. Set real MySQL/JWT values before starting the mysql profile."
        }
    }
}

$port = if ([string]::IsNullOrWhiteSpace($env:SERVER_PORT)) { '8080' } else { $env:SERVER_PORT }
Write-Host "Starting backend with profile '$env:SPRING_PROFILES_ACTIVE' on port $port."
if ($env:SPRING_PROFILES_ACTIVE -eq 'mysql') {
    Write-Host 'Ensure the local MySQL server is running first. The ignored .env file supplies database credentials.'
}

Push-Location (Join-Path $projectRoot 'backend')
try {
    & .\mvnw.cmd spring-boot:run
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
