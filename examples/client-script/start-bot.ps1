# Telegram Bot Startup Script (via WSL)
Write-Host "🤖 Starting Telegram Bot (via WSL)..." -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$clientScriptPath = "/mnt/c/Users/User/Downloads/bsa-sp-template-x402-2026/examples/client-script"

# Stop existing bot processes
Write-Host "🔍 Checking for running Bot instances..." -ForegroundColor Gray
wsl bash -c "pkill -f telegram-bot" 2>$null
Start-Sleep -Seconds 2

Write-Host "📁 Changing to directory: $clientScriptPath" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Starting Bot..." -ForegroundColor Green
Write-Host "⚠️  Press Ctrl+C to stop the Bot" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Run bot in WSL
wsl bash -c "cd $clientScriptPath && npx tsx --env-file=../nextjs-server/.env.local src/telegram-bot.ts"
