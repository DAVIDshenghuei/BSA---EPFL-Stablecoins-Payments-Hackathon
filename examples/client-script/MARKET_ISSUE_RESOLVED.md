# 問題診斷與解決方案

## 問題描述
當在 Telegram 輸入 `market` 命令時，Bot 沒有任何反應，但 `weather` 命令正常工作。

## 根本原因

### 1. **端口不匹配**
- 服務器啟動在不同的端口（port 3000 或 3001）
- Bot 代碼和環境變數中的端口設置不一致
- Facilitator URL 設置的端口與實際服務器端口不匹配

### 2. **環境變數配置**
`.env.local` 文件中的 `FACILITATOR_URL` 設置為 `http://localhost:3000/api/facilitator`，但如果服務器運行在 port 3001，facilitator 就無法訪問，導致支付流程失敗。

## 解決步驟

### 1. 確保服務器運行在正確端口
```bash
# 在 WSL 中啟動服務器
cd /mnt/c/Users/User/Downloads/bsa-sp-template-x402-2026
pnpm dev

# 確認服務器運行在 http://localhost:3000
```

### 2. 更新環境變數
確保 `.env.local` 文件中的設置匹配服務器端口：

```env
FACILITATOR_URL=http://localhost:3000/api/facilitator
```

### 3. 更新 Bot 代碼
確保 `telegram-bot.ts` 中的端點 URL 正確：

```typescript
// weather 端點
const resourceUrl = process.env.RESOURCE_URL ?? "http://localhost:3000/api/weather";

// market 端點
const resourceUrl = "http://localhost:3000/api/market";
```

### 4. 重啟服務
```bash
# 停止並重啟服務器
pkill -f "next dev"
cd /mnt/c/Users/User/Downloads/bsa-sp-template-x402-2026
pnpm dev

# 停止並重啟 Bot
pkill -f telegram-bot
cd /mnt/c/Users/User/Downloads/bsa-sp-template-x402-2026/examples/client-script
bash start-bot.sh
```

## 驗證步驟

### 1. 測試服務器端點
```bash
# 測試 market 端點是否返回 402
curl http://localhost:3000/api/market

# 應該返回類似：
# {"error":"Payment required","version":"x402-ton-v1",...}
```

### 2. 檢查 facilitator URL
確保響應中的 `facilitatorUrl` 與服務器端口匹配：
```json
{
  "facilitatorUrl": "http://localhost:3000/api/facilitator"
}
```

### 3. 測試 Bot
在 Telegram 中：
1. 發送 `weather` - 應該正常工作
2. 發送 `market` - 現在應該也能正常工作

## 預期結果

### Weather 命令
```
⏳ Fetching weather data and processing payment...
Please wait...

🌤️ Weather Data

📍 Location: Lausanne, Switzerland
🌡️ Temperature: 22°C
☁️ Conditions: Partly cloudy
💧 Humidity: 45%
🕐 Time: 3/21/2026, 9:00:00 PM

✅ Payment Confirmed
🔗 Transaction Hash: abc123...
🌐 Network: testnet
```

### Market 命令
```
⏳ Fetching marketplace data and processing payment...
Please wait...

🛍️ Marketplace Items

📊 Total Items: 5

1. Refurbished MacBook Air M1
💰 Price: $650
🏪 Seller: TechRelove (⭐ 98%)
📍 Location: Lausanne
📦 Condition: Like New
🚚 Delivery: 1-2 days
🏷️ Tags: laptop, apple, budget

[... 更多商品 ...]

✅ Payment Confirmed
🔗 TX Hash: abc123...
🌐 Network: testnet
```

## 常見問題

### Q: 為什麼 weather 可以工作但 market 不行？
A: 兩個命令使用相同的支付流程，但如果 facilitator URL 配置錯誤，第二個請求可能會失敗。另外，market 端點是新添加的，可能服務器沒有重新加載。

### Q: 如何確認服務器正在運行？
A: 
```bash
# 檢查進程
ps aux | grep "next dev"

# 測試端點
curl http://localhost:3000/api/market
```

### Q: Bot 沒有日誌輸出怎麼辦？
A: 
1. 檢查 Bot 是否還在運行
2. 查看終端日誌文件
3. 確保沒有語法錯誤導致程式崩潰

## 技術細節

### x402 支付流程
1. Client 發送 GET 請求到 `/api/market`
2. Server 返回 402 Payment Required + 支付詳情
3. Client 構建並簽署交易
4. Client 重試請求，附帶 PAYMENT-SIGNATURE header
5. Server 調用 facilitator 驗證簽名
6. Facilitator 廣播交易到 TON 網絡
7. Server 返回數據 + 交易哈希

### 為什麼端口很重要
- API 端點需要匹配：`http://localhost:3000/api/market`
- Facilitator URL 需要匹配：`http://localhost:3000/api/facilitator`
- 如果端口不一致，facilitator 無法訪問，支付流程失敗

## 當前狀態

✅ **服務器**: 運行在 http://localhost:3000  
✅ **Bot**: 已啟動並監聽消息  
✅ **Market 端點**: 已配置並測試通過  
✅ **環境變數**: 已正確設置  

現在可以在 Telegram 測試 `market` 命令了！
