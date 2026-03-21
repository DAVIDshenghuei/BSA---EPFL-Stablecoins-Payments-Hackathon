# 🛍️ BSA Marketplace Guide

## Overview

The BSA Marketplace is a modern, eBay-style marketplace built with Zeabur-inspired design, featuring cryptocurrency payments via the TON blockchain and x402 protocol.

## Features

### 🎨 Modern UI
- **Clean Design**: Inspired by Zeabur's modern aesthetic
- **Dark Theme**: Eye-friendly dark mode with cyan/blue accents
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Hover effects and transitions for better UX

### 🔍 Advanced Filtering
- **Search by Name**: Find products by keyword
- **Location Filter**: Filter by city (Lausanne, Geneva, Zurich, Remote)
- **Price Range**: Set minimum and maximum price
- **Condition Filter**: New, Like New, or Used items
- **Sort Options**: Newest, Price (Low/High), Trust Score

### 💳 Crypto Payments
- **TON Blockchain**: Secure payments via TON
- **x402 Protocol**: Micropayments for data access
- **BSA USD**: Stablecoin payments (0.01 BSA USD per request)

## Pages

### 1. Main Marketplace (`/marketplace`)
- **URL**: `http://localhost:3001/marketplace`
- **Features**:
  - Full product grid with filters
  - Interactive sidebar for filtering
  - Real-time search and sort
  - Product cards with images, prices, seller info
  - Trust score badges
  - Location and delivery info

### 2. API Demo (`/marketplace/demo`)
- **URL**: `http://localhost:3001/marketplace/demo`
- **Features**:
  - Test the `/api/market` endpoint
  - See x402 payment flow
  - Try different filter combinations
  - View API responses

## Design Elements

### Color Palette
```css
--bg: #060d1f           /* Background */
--bg-card: #0d1b35      /* Card background */
--border: #1e3a5f       /* Borders */
--blue: #2563eb         /* Primary blue */
--cyan: #06b6d4         /* Accent cyan */
--text: #f0f9ff         /* Text */
--muted: #64748b        /* Muted text */
```

### Typography
- **Headings**: System fonts (San Francisco, Segoe UI)
- **Body**: -apple-system, BlinkMacSystemFont, 'Segoe UI'
- **Code**: 'Fira Code', 'Cascadia Code', monospace

### Components

#### Product Card
- Gradient background placeholder for images
- Condition badge (top-right)
- Product title (2 line max)
- Large price display in cyan
- Seller info with trust score
- Location and delivery speed
- Tags for categories
- Gradient CTA button

#### Filters Sidebar
- Sticky positioning
- Search input
- Dropdown selectors
- Price range inputs
- Info tip box
- Reset button

## Usage

### For Users

1. **Browse Products**
   ```
   Visit: http://localhost:3001/marketplace
   ```

2. **Filter Products**
   - Enter search term (e.g., "MacBook")
   - Select location from dropdown
   - Set price range (min - max)
   - Choose condition
   - Sort results

3. **View Details**
   - Click on any product card
   - See full product information
   - Check seller trust score
   - Review delivery options

### For Telegram Bot Users

Use natural language commands:
```
market                          # All items
market MacBook                  # Search by name
market price 500-700            # Filter by price
market in Lausanne              # Filter by location
market laptop price 600-800     # Combined filters
```

### For Developers

#### API Endpoint
```
GET /api/market?name=MacBook&price=500-700&location=Lausanne
```

**Response Format:**
```json
{
  "success": true,
  "total_items": 3,
  "filters_applied": {
    "name": "MacBook",
    "price": "500-700",
    "location": "Lausanne"
  },
  "items": [
    {
      "item": "MacBook Pro 14\" M3 Pro",
      "price_usd": 1899,
      "seller": "TechStore",
      "trust_score": 98,
      "location": "Lausanne",
      "condition": "New",
      "delivery_speed": "1-2 days",
      "tags": ["laptop", "apple", "m3"]
    }
  ]
}
```

#### Adding New Products

Edit `/api/market/route.ts`:
```typescript
const allItems = [
  {
    item: "Your Product Name",
    price_usd: 999,
    seller: "Your Store",
    trust_score: 95,
    location: "City",
    condition: "New",
    delivery_speed: "1-2 days",
    tags: ["category1", "category2"]
  },
  // ... more items
];
```

## Navigation

### Header Links
- **Home** → Landing page (`/`)
- **Marketplace** → Product grid (`/marketplace`)
- **Quickstart** → Setup guide (`/quickstart`)
- **TON Docs** → External documentation

### Footer Links
- Quick Links section
- Support section
- GitHub repository
- TON documentation

## Responsive Design

### Desktop (>968px)
- Sidebar + Content grid layout
- 3-4 product cards per row
- Full navigation bar

### Tablet (768px - 968px)
- Stacked sidebar + content
- 2-3 product cards per row
- Simplified navigation

### Mobile (<768px)
- Single column layout
- 1 product card per row
- Collapsed navigation
- Filters below content

## Integration with x402

The marketplace integrates seamlessly with the x402 payment protocol:

1. **User requests data** → `/api/market?filters`
2. **Server returns 402** → Payment Required
3. **Client pays** → TON blockchain transaction
4. **Server verifies** → Via facilitator
5. **Data returned** → Filtered marketplace items

## Customization

### Change Colors
Edit `marketplace.css`:
```css
:root {
  --cyan: #your-color;
  --blue: #your-color;
}
```

### Change Layout
Modify grid columns in `products-grid`:
```css
.products-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
```

### Add Categories
Update filter section in `page.tsx`:
```typescript
const categories = ["Electronics", "Computers", "Phones"];
```

## Performance

- **Fast Loading**: Optimized images and lazy loading
- **Smooth Animations**: Hardware-accelerated CSS
- **Efficient Filtering**: Client-side processing
- **Minimal API Calls**: Only when needed

## Security

- **Blockchain Verified**: All payments on TON
- **Trust Scores**: Seller reputation system
- **Secure Protocol**: x402 payment verification
- **No Direct Payments**: Handled via smart contracts

## Future Enhancements

- [ ] Real image uploads
- [ ] User authentication
- [ ] Shopping cart
- [ ] Order history
- [ ] Seller dashboard
- [ ] Reviews and ratings
- [ ] Real-time chat
- [ ] Multi-currency support

## Support

- **Documentation**: Check `/api/market/README.md`
- **GitHub**: [bsa-sp-template-x402-2026](https://github.com/bsaepfl/bsa-sp-template-x402-2026)
- **TON Docs**: [docs.ton.org](https://docs.ton.org)

---

**Built with ❤️ using TON x402 Protocol**
