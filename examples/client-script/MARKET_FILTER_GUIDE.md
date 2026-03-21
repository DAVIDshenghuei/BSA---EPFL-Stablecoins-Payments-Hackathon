# Market Filter Feature - User Guide

## Overview

The market command now supports advanced filtering! You can filter marketplace items by name, price, and location to find exactly what you need.

## Command Formats

### 1. **View All Items**
```
market
```
Returns all 5 marketplace items (costs 0.01 BSA USD)

### 2. **Filter by Name**
```
market:MacBook
market:Dell
market:Logo
```
Finds items containing the specified name (case-insensitive, partial match)

### 3. **Filter by Price Range**
```
market:500-700
market:20-50
market:$600-$800
```
Finds items within the price range ($ symbol optional)

### 4. **Filter by Location**
```
market:Lausanne
market:Geneva
market:Remote
```
Finds items in the specified location (case-insensitive, partial match)

### 5. **Multiple Filters (Combined)**
```
market:MacBook,600-700,Lausanne
market:laptop,Zurich
market:design,Remote
```
Applies multiple filters simultaneously (comma-separated)

## Examples

### Example 1: Find All MacBooks
**Command**: `market:MacBook`

**Response**:
```
🛍️ Marketplace Items

🔍 Filters Applied:
  • Name: MacBook

📊 Total Items: 1

1. Refurbished MacBook Air M1
💰 Price: $650
🏪 Seller: TechRelove (⭐ 98%)
📍 Location: Lausanne
📦 Condition: Like New
🚚 Delivery: 1-2 days
🏷️ Tags: laptop, apple, budget

✅ Payment Confirmed
🔗 TX Hash: ...
🌐 Network: testnet
```

### Example 2: Find Items Under $100
**Command**: `market:20-100`

**Response**:
```
🛍️ Marketplace Items

🔍 Filters Applied:
  • Price: $20-100

📊 Total Items: 2

1. Professional Logo Design
💰 Price: $25
...

2. Next.js Bug Fixing (1 hour)
💰 Price: $40
...
```

### Example 3: Find Laptops in Zurich
**Command**: `market:laptop,Zurich`

**Response**:
```
🛍️ Marketplace Items

🔍 Filters Applied:
  • Name: laptop
  • Location: Zurich

📊 Total Items: 1

1. Custom Gaming PC (RTX 3060)
💰 Price: $850
...
```

### Example 4: No Results
**Command**: `market:iPhone`

**Response**:
```
🛍️ Marketplace Items

🔍 Filters Applied:
  • Name: iPhone

📊 Total Items: 0

❌ No items found matching your filters.

💡 Try different filters or use `market` to see all items.
```

## Filter Logic

### Name Filter
- **Case-insensitive**: `MacBook` = `macbook` = `MACBOOK`
- **Partial match**: `Mac` matches "MacBook Air M1"
- **Searches in**: Item name field

### Price Filter
- **Range format**: `500-700` (finds items between $500-$700)
- **Flexible**: Works with or without `$` symbol
- **Inclusive**: Both minimum and maximum are included

### Location Filter
- **Case-insensitive**: `Lausanne` = `lausanne`
- **Partial match**: `Laus` matches "Lausanne"
- **Searches in**: Location field
- **Available locations**: Lausanne, Geneva, Zurich, Remote

### Multiple Filters (AND Logic)
- All filters must match
- Example: `market:laptop,500-700,Lausanne`
  - Must contain "laptop" in name
  - AND price between $500-$700
  - AND location contains "Lausanne"

## Available Items

| ID | Item | Price | Location | Category |
|----|------|-------|----------|----------|
| pc-001 | Refurbished MacBook Air M1 | $650 | Lausanne | Electronics |
| pc-002 | Dell XPS 13 (2021) | $580 | Geneva | Electronics |
| pc-003 | Custom Gaming PC (RTX 3060) | $850 | Zurich | Electronics |
| srv-001 | Professional Logo Design | $25 | Remote | Services |
| srv-002 | Next.js Bug Fixing (1 hour) | $40 | Remote | Services |

## Use Cases

### 1. **Budget Shopping**
Find items within your budget:
```
market:500-600    # Items under $600
market:20-50      # Affordable services
```

### 2. **Brand Search**
Find specific brands:
```
market:MacBook
market:Dell
```

### 3. **Local Shopping**
Find items near you:
```
market:Lausanne
market:Geneva
```

### 4. **Category + Location**
Combine filters:
```
market:laptop,Zurich      # Laptops in Zurich
market:design,Remote      # Remote design services
```

### 5. **Price + Location**
Budget + Location:
```
market:500-700,Lausanne   # $500-700 items in Lausanne
```

## Tips & Tricks

1. **Start Broad, Then Narrow**
   - First: `market` (see all items)
   - Then: `market:laptop` (filter by type)
   - Finally: `market:laptop,500-700` (add price filter)

2. **Try Different Keywords**
   - "laptop" finds both MacBook and Dell
   - "gaming" finds gaming PC
   - "design" finds design services

3. **Use Price Ranges**
   - `0-100` for budget items
   - `500-1000` for premium items
   - `20-50` for services

4. **Location Shortcuts**
   - All physical items: Lausanne, Geneva, Zurich
   - All services: Remote

## Technical Details

### API Endpoint
```
GET /api/market?name=X&price=Y&location=Z
```

### Query Parameters
| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `name` | string | `MacBook` | Filter by item name |
| `price` | string | `500-700` | Filter by price range |
| `location` | string | `Lausanne` | Filter by location |

### Response Format
```json
{
  "success": true,
  "total_items": 2,
  "filters_applied": {
    "name": "MacBook",
    "price": null,
    "location": "Lausanne"
  },
  "items": [...],
  "timestamp": "2026-03-21T21:00:00.000Z"
}
```

## Payment

- **Cost**: 0.01 BSA USD per query (regardless of filters)
- **Network**: TON Testnet
- **Payment**: Automatic via x402 protocol

## Troubleshooting

### No Results Found?
- Check spelling
- Try partial names (e.g., "Mac" instead of "MacBook")
- Use broader price ranges
- Remove some filters

### Bot Not Responding?
1. Check bot is running
2. Ensure server is running on port 3000
3. Verify wallet has sufficient balance

### Filter Not Working?
- Ensure correct format: `market:filter`
- Use comma to separate: `market:name,price,location`
- No spaces in filter values

## Future Enhancements

Potential features:
- Filter by category (Electronics, Services)
- Filter by seller trust score
- Filter by delivery speed
- Sort options (price, trust score)
- Saved searches
- Price alerts

## Support

For help, use `/help` command in Telegram or refer to:
- `TELEGRAM_BOT_README.md`
- `TROUBLESHOOTING.md`
- `MARKET_ISSUE_RESOLVED.md`
