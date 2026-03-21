# 🐛 Issue Resolution: Why Multiple Replies Appear for One "weather" Message

## Root Cause

Multiple replies occur because **multiple Bot instances are running simultaneously**. When multiple instances exist:
- Each instance receives the same message
- Each instance attempts to process the message
- Result: User receives multiple identical replies

The error logs show a `409 Conflict` error:
```
Conflict: terminated by other getUpdates request; 
make sure that only one bot instance is running
```

## Implemented Fixes

### 1. **Message Deduplication Mechanism**
Added a `processedMessages` Set to track processed messages:
```typescript
const processedMessages = new Set<string>();
const uniqueMessageId = `${chatId}_${messageId}`;

if (processedMessages.has(uniqueMessageId)) {
    console.log(`⏭️ Skipping already processed message: ${uniqueMessageId}`);
    return;
}
processedMessages.add(uniqueMessageId);
```

### 2. **Conflict Detection & Auto-Exit**
When a 409 error is detected, the Bot automatically exits:
```typescript
if (data.error_code === 409) {
    console.error("❌ Detected another Bot instance running!");
    process.exit(1);
}
```

### 3. **Improved Startup Scripts**
The new `start-bot.sh` and `start-bot.ps1` scripts will:
- Stop all old instances before starting
- Ensure only one instance is running
- Provide clear startup status feedback

## How to Use

### Starting the Bot (Recommended)

**In WSL:**
```bash
cd /mnt/c/Users/User/Downloads/bsa-sp-template-x402-2026/examples/client-script
bash start-bot.sh
```

**In PowerShell:**
```powershell
cd C:\Users\User\Downloads\bsa-sp-template-x402-2026\examples\client-script
.\start-bot.ps1
```

The startup script will:
1. ✅ Check and stop running instances
2. ✅ Wait 2 seconds to ensure complete cleanup
3. ✅ Start a new Bot instance

### Stopping the Bot

Press `Ctrl+C` or run in a new terminal:
```bash
# WSL
pkill -f telegram-bot

# PowerShell
Stop-Process -Name node -Force
```

### Checking Running Status

**WSL:**
```bash
ps aux | grep telegram-bot
```

**PowerShell:**
```powershell
Get-Process | Where-Object { $_.ProcessName -like "*node*" }
```

## Test Results

After startup, you should see:
```
🤖 Starting Telegram Bot...
📱 Bot Token: 8449323987...
✅ Bot connected: @Wisemanagersbot
👤 Bot name: Wisemanager
🔄 Listening for messages...
```

If you see 409 errors, it means another instance is running, and the Bot will automatically exit.

## Expected Behavior

Now when a user types `weather`, they should **receive only one reply**:

1. ⏳ Fetching weather data and processing payment... (only once)
2. Then either:
   - ✅ Success: Weather data + payment confirmation
   - ❌ Failure: Error message

## Common Issues

**Q: Still receiving duplicate messages?**
A: 
1. Stop all running instances
2. Wait 5 seconds
3. Restart using the startup script

**Q: How to ensure only one instance is running?**
A: 
1. Only run the Bot in one terminal window
2. Use the provided startup scripts (they auto-cleanup)
3. Check process list to confirm

**Q: Bot not responding?**
A:
1. Confirm Bot is running (check terminal output)
2. Confirm backend server (localhost:3000) is running
3. Check terminal logs for error messages

## Log Output Examples

**Normal operation:**
```
📨 Received message: "weather" from David (123456789)
💳 Wallet: UQAlSx...
💰 Balance: 0 TON
✅ Weather data sent successfully
```

**Skipping duplicate message:**
```
⏭️ Skipping already processed message: 123456789_42
```

**Conflict detected:**
```
❌ Detected another Bot instance running!
❌ Error: Conflict: terminated by other getUpdates request
💡 Exiting... Please ensure only one Bot instance is running
```

## Prevention Tips

1. **Always use the startup scripts** - They handle cleanup automatically
2. **Only run in one terminal** - Don't start multiple instances
3. **Monitor logs** - Watch for conflict errors
4. **Clean shutdown** - Use Ctrl+C to stop properly

## Technical Details

### Message Deduplication
- Uses in-memory Set to store processed message IDs
- Key format: `{chatId}_{messageId}`
- Automatically cleans old entries (keeps latest 100)
- Prevents race conditions between instances

### Conflict Detection
- Monitors Telegram API responses
- Detects 409 error code
- Automatically exits to prevent conflicts
- Logs clear error message for debugging

### Process Management
- Startup script kills old processes by name
- 2-second delay ensures complete cleanup
- Single point of entry prevents accidental duplicates

## Further Reading

- [Telegram Bot API - getUpdates](https://core.telegram.org/bots/api#getupdates)
- [Long Polling vs Webhooks](https://core.telegram.org/bots/api#getting-updates)
- [Process Management in Node.js](https://nodejs.org/api/process.html)
