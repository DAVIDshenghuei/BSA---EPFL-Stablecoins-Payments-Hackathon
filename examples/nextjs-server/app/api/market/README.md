# Market Endpoint - Quick Reference

## Overview

The `/api/market` endpoint returns a curated list of marketplace items including electronics and services. Users pay 0.01 BSA USD to access the data.

## API Endpoint

**URL**: `http://localhost:3000/api/market`  
**Method**: `GET`  
**Price**: 0.01 BSA USD  
**Protocol**: x402 Payment Required

## Response Format

```json
{
  "success": true,
  "total_items": 5,
  "items": [
    {
      "id": "pc-001",
      "category": "Electronics",
      "item": "Refurbished MacBook Air M1",
      "price_usd": 650,
      "seller": "TechRelove",
      "trust_score": 98,
      "location": "Lausanne",
      "condition": "Like New",
      "delivery_speed": "1-2 days",
      "tags": ["laptop", "apple", "budget"]
    },
    // ... more items
  ],
  "timestamp": "2026-03-21T20:30:00.000Z"
}
```

## Marketplace Items

### Electronics

1. **Refurbished MacBook Air M1**
   - Price: $650
   - Seller: TechRelove (98% trust)
   - Location: Lausanne
   - Condition: Like New
   - Delivery: 1-2 days

2. **Dell XPS 13 (2021)**
   - Price: $580
   - Seller: SwissPC_Outlet (85% trust)
   - Location: Geneva
   - Condition: Good
   - Delivery: 3-5 days

3. **Custom Gaming PC (RTX 3060)**
   - Price: $850
   - Seller: GamerHub_CH (92% trust)
   - Location: Zurich
   - Condition: New
   - Delivery: Next day

### Services

4. **Professional Logo Design**
   - Price: $25
   - Seller: CreativeLoris (99% trust)
   - Location: Remote
   - Delivery: 24 hours

5. **Next.js Bug Fixing (1 hour)**
   - Price: $40
   - Seller: FullStackStan (96% trust)
   - Location: Remote
   - Delivery: Instant

## Bot Commands

### Using Telegram Bot

Send `market` or `/market` to the bot:

```
You: market

Bot: ⏳ Fetching marketplace data and processing payment...
     Please wait...

Bot: 🛍️ Marketplace Items
     
     📊 Total Items: 5
     
     1. Refurbished MacBook Air M1
     💰 Price: $650
     🏪 Seller: TechRelove (⭐ 98%)
     📍 Location: Lausanne
     📦 Condition: Like New
     🚚 Delivery: 1-2 days
     🏷️ Tags: laptop, apple, budget
     
     [... more items ...]
     
     ✅ Payment Confirmed
     🔗 TX Hash: abc123...
     🌐 Network: testnet
```

## CLI Testing

From repo root:

```bash
# Test market endpoint with CLI
RESOURCE_URL=http://localhost:3000/api/market pnpm dev:client
```

## Code Integration

### Client Side (TypeScript)

```typescript
import { x402Fetch } from "@ton-x402/client";

const result = await x402Fetch("http://localhost:3000/api/market", {
    wallet,
    keypair,
    seqno,
    client,
});

if (result.response.ok) {
    const data = await result.response.json();
    console.log(`Found ${data.total_items} items`);
    data.items.forEach(item => {
        console.log(`${item.item}: $${item.price_usd}`);
    });
}
```

### Server Side (Next.js Route)

```typescript
// app/api/market/route.ts
import { paymentGate } from "@ton-x402/middleware";
import { getPaymentConfig } from "../../../lib/payment-config";

const handler = (_request: Request) => {
    const marketplaceItems = [
        // ... items array
    ];

    return Response.json({
        success: true,
        total_items: marketplaceItems.length,
        items: marketplaceItems,
        timestamp: new Date().toISOString(),
    });
};

export const GET = paymentGate(handler, {
    config: getPaymentConfig({
        amount: "10000000", // 0.01 BSA USD
        asset: process.env.JETTON_MASTER_ADDRESS,
        description: "Premium marketplace data (0.01 BSA USD)",
        decimals: 9,
    }),
});
```

## Data Structure

### Item Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `category` | string | "Electronics" or "Services" |
| `item` | string | Item name/title |
| `price_usd` | number | Price in USD |
| `seller` | string | Seller username |
| `trust_score` | number | Seller trust rating (0-100) |
| `location` | string | Physical or "Remote" |
| `condition` | string | "New", "Like New", "Good" (Electronics only) |
| `delivery_speed` | string | Estimated delivery time |
| `tags` | string[] | Search/filter tags |

## Use Cases

- **E-commerce platforms** - Browse verified listings
- **Price comparison** - Aggregate marketplace data
- **Trust scoring** - Seller reputation systems
- **API monetization** - Paid access to curated data
- **Data aggregation** - Collect marketplace trends

## Payment Flow

1. Client requests `/api/market`
2. Server returns `402 Payment Required`
3. Client signs 0.01 BSA USD transaction
4. Facilitator verifies and broadcasts
5. Server returns marketplace data + TX hash

## Error Handling

```typescript
try {
    const result = await getMarketplaceData();
    
    if (result.success) {
        // Handle marketplace data
    } else {
        console.error("Payment failed:", result.error);
    }
} catch (error) {
    console.error("Error fetching marketplace:", error);
}
```

## Customization

### Adding New Items

Edit `app/api/market/route.ts`:

```typescript
const marketplaceItems = [
    // ... existing items
    {
        id: "new-001",
        category: "Electronics",
        item: "New Item",
        price_usd: 100,
        seller: "YourName",
        trust_score: 95,
        location: "Your Location",
        condition: "New",
        delivery_speed: "2-3 days",
        tags: ["tag1", "tag2"]
    }
];
```

### Filtering by Category

```typescript
// Filter electronics only
const electronics = data.items.filter(item => item.category === "Electronics");

// Filter by price range
const affordable = data.items.filter(item => item.price_usd < 100);

// Filter by location
const local = data.items.filter(item => item.location === "Lausanne");
```

## Testing

```bash
# Start server
pnpm dev

# In another terminal, test market endpoint
RESOURCE_URL=http://localhost:3000/api/market pnpm dev:client

# Or use the bot
# Send "market" in Telegram
```

## Production Considerations

- Store items in database instead of hardcoded array
- Add pagination for large datasets
- Implement search/filter parameters
- Add item images/thumbnails
- Enable seller authentication
- Add transaction history
- Implement escrow system for purchases

## Related Endpoints

- `/api/weather` - Weather data (0.01 BSA USD)
- `/api/joke` - Developer jokes (0.01 BSA USD)
- `/api/facilitator` - Payment verification & settlement
