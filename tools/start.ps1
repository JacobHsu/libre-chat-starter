# One-click start for the local MVP: MongoDB -> wait until ready -> check Ollama -> LibreChat.
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File tools/start.ps1
# Stop LibreChat with Ctrl+C. The MongoDB container keeps running.

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

Write-Host '[1/4] Starting MongoDB container learn-mongodb'
docker start learn-mongodb | Out-Null

Write-Host '[2/4] Waiting for MongoDB to be ready'
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

Write-Host '[3/4] Checking Ollama on http://localhost:11434'
try {
    Invoke-WebRequest -Uri 'http://localhost:11434/api/tags' -UseBasicParsing -TimeoutSec 3 | Out-Null
    Write-Host '      Ollama is running.'
} catch {
    Write-Host '      Ollama did not respond. Chat will not work until Ollama is running.' -ForegroundColor Yellow
}

Write-Host '[4/4] Starting LibreChat on http://localhost:3090 (Ctrl+C to stop)'
npm run backend
