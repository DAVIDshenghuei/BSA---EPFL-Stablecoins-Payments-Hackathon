#!/bin/bash

# Telegram Weather Payment Bot Startup Script
# This script should be run in WSL

cd "$(dirname "$0")"

echo "🤖 Starting Telegram Bot..."
echo "📁 Working directory: $(pwd)"
echo ""

# Stop existing bot processes
echo "🔍 Checking for running Bot instances..."
pkill -f "telegram-bot" 2>/dev/null && echo "✅ Stopped old Bot instance" || echo "ℹ️ No running instances found"
sleep 2

# Ensure environment file exists
if [ ! -f "../nextjs-server/.env.local" ]; then
    echo "❌ Error: Cannot find ../nextjs-server/.env.local"
    echo "Please ensure the configuration file exists"
    exit 1
fi

echo ""
echo "🚀 Starting Bot..."
echo "⚠️  Press Ctrl+C to stop the Bot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run bot
npx tsx --env-file=../nextjs-server/.env.local src/telegram-bot.ts
