# Telegram Weather Payment Bot

This is a Telegram bot that automatically triggers a payment flow on the TON blockchain and returns weather data when a user types `weather`.

## Bot Information

- **Bot Name**: @Wisemanagersbot
- **Bot Token**: `8449323987:AAGVDiNtLTdyb7W-ZMpoq4NO4JZtwtV6u-E`
- **Bot URL**: https://t.me/Wisemanagersbot

## Features

- User types `weather` or `/weather`
- Bot automatically executes the x402 payment flow (pays 0.01 BSA USD)
- Returns weather data to the chat

## Installation & Usage

### 1. Ensure Environment Variables are Configured

Make sure `examples/nextjs-server/.env.local` file contains the following configuration:

```env
TON_NETWORK=testnet
PAYMENT_ADDRESS=your_receiving_address
JETTON_MASTER_ADDRESS=kQCd6G7c_HUBkgwtmGzpdqvHIQoNkYOEE0kSWoc5v57hPPnW
FACILITATOR_URL=http://localhost:3000/api/facilitator
TON_RPC_URL=https://testnet.toncenter.com/api/v2/jsonRPC
RPC_API_KEY=your_API_KEY
WALLET_MNEMONIC="your 24 mnemonic words"
```

### 2. Start Backend Server

First ensure the Next.js server is running:

```bash
pnpm dev:server
```

This will start the API server at http://localhost:3000.

### 3. Start Telegram Bot

In a new terminal window, run:

```bash
pnpm dev:bot
```

Or run directly in the client-script directory:

```bash
cd examples/client-script
pnpm bot
```

### 4. Test the Bot

1. Open your bot in Telegram: https://t.me/Wisemanagersbot
2. Send `/start` to see the welcome message
3. Type `weather` to get weather data

## Bot Commands

- `/start` - Display welcome message and usage instructions
- `/help` - Display help information
- `weather` or `/weather` - Get weather data (triggers payment flow)

## Workflow

1. User sends `weather` in Telegram
2. Bot receives the message and sends "Processing..." status message
3. Bot executes the following steps:
   - Generate wallet from WALLET_MNEMONIC
   - Connect to TON testnet
   - Send request to http://localhost:3000/api/weather
   - Receive 402 Payment Required response
   - Build and sign Jetton transfer transaction
   - Verify and settle payment via facilitator
   - Get weather data
4. Bot sends formatted weather data back to Telegram chat

## Response Format

On success, the bot sends a message in this format:

```
🌤️ Weather Data

📍 Location: Lausanne, Switzerland
🌡️ Temperature: 22°C
☁️ Conditions: Partly cloudy
💧 Humidity: 45%
🕐 Time: 2026-03-21 17:58:17

✅ Payment Confirmed
🔗 Transaction Hash: abc123...
🌐 Network: testnet
```

## Troubleshooting

### Bot Not Responding
- Check if bot token is correct
- Verify network connection is working
- Review terminal log output

### Payment Failed
- Verify wallet has sufficient TON balance
- Check if WALLET_MNEMONIC is correct
- Ensure facilitator service is running
- Verify PAYMENT_ADDRESS is correct

### Server Connection Failed
- Ensure Next.js server is running at http://localhost:3000
- Check firewall settings

## Development Notes

Bot code is located at: `examples/client-script/src/telegram-bot.ts`

Main functions:
- `getWeatherData()` - Execute x402 payment flow and fetch data
- `handleUpdate()` - Handle Telegram messages
- `formatWeatherMessage()` - Format weather data as Telegram message
- `main()` - Main loop, uses long polling to get updates

## Security Notes

⚠️ **Important**: 
- Do not commit `.env.local` file to Git
- Keep your Bot Token secure
- Keep your mnemonic phrase secure
- Use environment variables to manage sensitive information in production

## Next Steps

- Add more commands (e.g., check balance, view transaction history)
- Add user management and permission control
- Deploy to cloud server (e.g., Railway, Heroku)
- Implement webhooks instead of long polling for better efficiency

## Advanced Usage

### Using Startup Scripts

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

The startup scripts will:
1. ✅ Check and stop any running instances
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
