# 🛍️ Market Filter Quick Reference

## Basic Commands

| Command | Description |
|---------|-------------|
| `market` | Show all items |
| `market:name` | Filter by name |
| `market:min-max` | Filter by price range |
| `market:location` | Filter by location |
| `market:name,price,location` | Multiple filters |

## Examples

```
✅ market                          # All items (5 total)
✅ market:MacBook                  # Find MacBooks
✅ market:500-700                  # Price $500-$700
✅ market:Lausanne                 # Items in Lausanne
✅ market:laptop,600-800,Zurich    # Laptops, $600-800, in Zurich
```

## Filter Rules

### Name
- Case-insensitive
- Partial match
- Example: `Mac` matches "MacBook"

### Price
- Format: `min-max`
- With/without $: `500-700` or `$500-$700`
- Inclusive range

### Location
- Case-insensitive
- Partial match
- Options: Lausanne, Geneva, Zurich, Remote

## Available Items

| Name | Price | Location |
|------|-------|----------|
| Refurbished MacBook Air M1 | $650 | Lausanne |
| Dell XPS 13 (2021) | $580 | Geneva |
| Custom Gaming PC (RTX 3060) | $850 | Zurich |
| Professional Logo Design | $25 | Remote |
| Next.js Bug Fixing (1 hour) | $40 | Remote |

## Try These!

```
market:laptop              # Find all laptops (3 items)
market:Remote              # Find remote services (2 items)
market:500-600             # Budget laptops (2 items)
market:design              # Design services (1 item)
market:gaming              # Gaming PC (1 item)
```

**Cost**: 0.01 BSA USD per query
**Network**: TON Testnet
