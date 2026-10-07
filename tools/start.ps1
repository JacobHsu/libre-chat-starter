# One-click start for the local MVP: MongoDB -> wait until ready -> Meilisearch (optional) -> check Ollama -> LibreChat.
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File tools/start.ps1
# Stop LibreChat with Ctrl+C. The MongoDB and Meilisearch containers keep running.

Set-Location (Join-Path $PSScriptRoot '..')

if (-not (Test-Path 'client/dist/index.html')) {
    Write-Host 'client/dist/index.html is missing. Run "npm run frontend" first.' -ForegroundColor Red
    exit 1
}
if (-not (Test-Path '.env')) {
    Write-Host '.env is missing. Create it from .env.example (see docs/local/npm.md).' -ForegroundColor Red
    exit 1
}
if (Get-NetTCPConnection -LocalPort 3090 -State Listen -ErrorAction SilentlyContinue) {
    Write-Host 'Port 3090 is already in use. LibreChat may already be running.' -ForegroundColor Yellow
    exit 1
}

Write-Host '[1/5] Starting MongoDB container learn-mongodb'
docker start learn-mongodb | Out-Null

Write-Host '[2/5] Waiting for MongoDB to be ready'
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    $answer = docker exec learn-mongodb mongosh --quiet --eval 'db.runCommand({ping:1}).ok' 2>$null
    if ("$answer".Trim() -eq '1') { $ready = $true; break }
    Start-Sleep -Seconds 1
}
if (-not $ready) {
    Write-Host 'MongoDB did not become ready within 30 seconds.' -ForegroundColor Red
    exit 1
}

Write-Host '[3/5] Starting Meilisearch container learn-meilisearch (optional, for search)'
$meili = docker ps -a --filter 'name=^learn-meilisearch$' --format '{{.Names}}'
if ("$meili".Trim() -eq 'learn-meilisearch') {
    docker start learn-meilisearch | Out-Null
    $meiliReady = $false
    for ($i = 0; $i -lt 15; $i++) {
        try {
            Invoke-WebRequest -Uri 'http://127.0.0.1:7701/health' -UseBasicParsing -TimeoutSec 2 | Out-Null
            $meiliReady = $true
            break
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    if ($meiliReady) {
        Write-Host '      Meilisearch is running.'
    } else {
        Write-Host '      Meilisearch did not respond. Search will not work.' -ForegroundColor Yellow
    }
} else {
    Write-Host '      No learn-meilisearch container, skipped. Search stays off.'
}

Write-Host '[4/5] Checking Ollama on http://localhost:11434'
try {
    Invoke-WebRequest -Uri 'http://localhost:11434/api/tags' -UseBasicParsing -TimeoutSec 3 | Out-Null
    Write-Host '      Ollama is running.'
} catch {
    Write-Host '      Ollama did not respond. Chat will not work until Ollama is running.' -ForegroundColor Yellow
}

Write-Host '[5/5] Starting LibreChat on http://localhost:3090 (Ctrl+C to stop)'
npm run backend
