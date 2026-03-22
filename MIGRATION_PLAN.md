# Migration Plan: workshop-style-hachathon → Wisemanager

## Overview

Migrate the **Shop / Cart / Dashboard / Glassmorphic UI** from `workshop-style-hachathon` (React + Vite + react-router) into `bsa-sp-template-x402-2026` (Next.js 15 App Router), while **keeping** the existing Telegram bot and x402 payment API layer.

### What We Keep from Wisemanager
- Telegram Bot (`telegram-bot.ts`) — unchanged
- x402 payment API routes (`/api/weather`, `/api/market`, `/api/facilitator`) — unchanged
- Existing `.env.local` config — unchanged
- All x402 packages (`core`, `client`, `middleware`, `facilitator`) — unchanged

### What We Adopt from workshop-style-hachathon
- Shop page → replaces current `/marketplace`
- Cart page → new `/cart` route
- Dashboard page → new `/dashboard`
- Glassmorphic CSS variables and styles
- Navbar component (adapted for Next.js)
- TonConnect UI wallet button
- Toast notification system
- PaymentContext (cart state via localStorage)
- Product data model

### What We Skip
- Checkout page (NFT deployment) — not needed
- Success page (NFT result) — not needed
- Login page (Clerk auth) — not needed
- MerchantAI page — not needed
- Supabase integration — not needed
- AuthContext (role-based auth) — not needed

---

## Architecture Comparison

| Aspect | workshop (source) | Wisemanager (target) |
|--------|-------------------|----------------------|
| Framework | React 18 + Vite | Next.js 15 App Router |
| Routing | react-router-dom | Next.js file-based routing |
| Styling | global.css (19KB) | globals.css (adapted) |
| State | React Context + localStorage | Same approach, "use client" |
| Wallet | @tonconnect/ui-react | Same package |
| Charts | chart.js + react-chartjs-2 | Same packages |
| Data | FakeStore API + Supabase | Local mock data (our market items) |
| Bot | N/A | Telegram bot (keep as-is) |
| Payments | Simulated TON | Real x402 protocol on TON |

---

## Phase 1: Dependencies & Configuration

### 1.1 Install New Packages

```bash
cd examples/nextjs-server
pnpm add @tonconnect/ui-react chart.js react-chartjs-2
```

### 1.2 Create TonConnect Manifest

Create `public/tonconnect-manifest.json`:
```json
{
  "url": "https://wisemanager.app",
  "name": "Wisemanager",
  "iconUrl": "https://wisemanager.app/icon.png"
}
```

---

## Phase 2: Global Styles Migration

### 2.1 Replace `globals.css`

Replace the current `globals.css` with a new version that merges:
- **Source**: workshop's `src/styles/global.css` (glassmorphic design system)
- **Adaptation**: Change primary color from EPFL red (`#E1001A`) to Wisemanager blue/cyan

**Key CSS variables to adapt:**
```css
:root {
  /* Glass effects (keep from source) */
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  --glass-blur: blur(14px);

  /* Colors (adapt to Wisemanager brand) */
  --primary: #06b6d4;        /* was #E1001A */
  --primary-light: #22d3ee;  /* was #ff4d4d */
  --primary-glow: rgba(6, 182, 212, 0.55);  /* was red glow */
  --secondary-glow: rgba(37, 99, 235, 0.35);
  --accent-gold: #fbbf24;    /* keep gold for prices */
}
```

**Affected CSS classes to port (all from source `global.css`):**
- `.navbar`, `.nav-container`, `.logo`, `.nav-links`, `.nav-link`
- `.page-container`, `.page-title`, `.subtitle`
- `.grid`, `.product-card`, `.product-info`, `.product-title`, `.product-footer`, `.price`, `.add-button`
- `.skeleton`, `.skeleton .img`, `.skeleton .line`
- `.dashboard-container`, `.stats-grid`, `.stat-card`, `.stat-label`, `.stat-value`
- `.chart-container`, `.transactions-section`, `.section-title`, `.transaction-card`
- `.cart-list`, `.cart-item`, `.cart-info`, `.cart-title`, `.cart-meta`, `.cart-actions`, `.cart-price`
- `.cart-summary`, `.cart-buttons`, `.clear-button`, `.checkout-button`
- `.remove-button`, `.pay-button`, `.primary-button`, `.secondary-button`
- `.status-badge`, `.status-badge.paid`, `.status-badge.pending`
- `@keyframes pulse` (skeleton animation)
- All responsive `@media` queries

**Estimated size**: ~500 lines of CSS

---

## Phase 3: Shared Components & Context

### 3.1 Create Cart Context Provider

**File**: `app/context/CartContext.tsx`

Adapted from source `src/context/PaymentContext.tsx`:
- Keep: `cart`, `addToCart`, `removeFromCart`, `clearCart`, `cartTotal`
- Keep: `invoices`, `addInvoice`, `updateInvoiceStatus`
- Keep: localStorage persistence (`localpay_state_v1`)
- Remove: Supabase `recordSale` import
- Add: `"use client"` directive

**Types needed** (from `src/types/index.ts`):
```typescript
interface CartItem {
  id: number | string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
}

interface Invoice {
  id: string;
  amount: string;
  timestamp: number;
  merchant: string;
  transactionHash: string;
  status: "pending" | "paid";
  items: CartItem[];
}
```

### 3.2 Create Toast Provider

**File**: `app/components/ToastProvider.tsx`

Direct port from `src/components/ToastProvider.tsx`:
- Add `"use client"` directive
- Keep toast notification logic unchanged
- Style with `.toast-container` and `.toast` classes

### 3.3 Create Navbar Component

**File**: `app/components/Navbar.tsx`

Adapted from source `src/components/Navbar.tsx`:
- Replace `react-router-dom` `Link` → Next.js `Link`
- Replace `useLocation()` → `usePathname()` from `next/navigation`
- Replace `useNavigate()` → `useRouter()` from `next/navigation`
- Keep: TonConnectButton
- Keep: Cart count badge
- Remove: Login/Logout (no auth)
- Remove: Merchant Dashboard link (combine into single Dashboard)
- Change logo: "🏛️ Winnie" → "💎 Wisemanager"
- Add: Telegram bot link

**Nav links:**
```
💎 Wisemanager    |    Shop    Cart (3)    Dashboard    |    [TonConnect Button]
```

### 3.4 Create Root Layout with Providers

**File**: `app/layout.tsx` (modify existing)

Wrap children with:
```tsx
<TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
  <CartProvider>
    <ToastProvider>
      <Navbar />
      {children}
    </ToastProvider>
  </CartProvider>
</TonConnectUIProvider>
```

**Important**: Since TonConnectUIProvider needs `"use client"`, create a separate `Providers.tsx` client component wrapper.

---

## Phase 4: Page Migration

### 4.1 Home Page (`/`)

**File**: `app/page.tsx`

**Design**: Keep our minimalist landing page concept but add workshop-style glassmorphic elements:
- Hero with "Your Wisemanager" gradient title
- Telegram bot CTA button (keep)
- Feature cards (glassmorphic cards)
- Quick links to Shop / Cart / Dashboard

### 4.2 Shop Page (`/shop`) — replaces `/marketplace`

**File**: `app/shop/page.tsx`

Adapted from source `src/pages/Home.tsx`:
- "use client" directive
- Product grid with glassmorphic cards
- Skeleton loaders while loading
- "Add to Cart" button for each product
- Remove: Merchant CRUD (add/edit/delete)
- Data source: Use our existing market items (from `/api/market/route.ts`) as mock data instead of FakeStore API

**Product data**: Use the 8 marketplace items already defined in our API:
```typescript
const products = [
  { id: 1, title: "MacBook Pro 14\" M3 Pro", price: 1899, image: "📱", category: "Laptop", ... },
  { id: 2, title: "Dell XPS 13 Plus", price: 1299, image: "💻", ... },
  // ... etc
];
```

### 4.3 Cart Page (`/cart`)

**File**: `app/cart/page.tsx`

Adapted from source `src/pages/Cart.tsx`:
- "use client" directive
- Cart item list with glassmorphic styling
- Remove/quantity controls
- Cart summary with total
- Replace "Proceed to Checkout" (NFT deploy) → "Pay with x402" or "Complete Order"
- On checkout: simulate payment via x402, record invoice
- Empty cart state with "Return to Shop" link

### 4.4 Dashboard Page (`/dashboard`)

**File**: `app/dashboard/page.tsx`

Merged from source `src/pages/Dashboard.tsx` + `MerchantDashboard.tsx`:
- "use client" directive
- Stats grid: Total Spent, This Month, Items in Cart
- Chart.js line chart: weekly spending
- Transaction history list
- Remove: AI Invoice Summary (requires external API)
- Keep: Chart.js registration and configuration

**Important**: Chart.js needs dynamic import in Next.js to avoid SSR issues:
```typescript
import dynamic from 'next/dynamic';
const Line = dynamic(() => import('react-chartjs-2').then(m => m.Line), { ssr: false });
```

### 4.5 Remove Old Pages

Delete:
- `app/marketplace/page.tsx`
- `app/marketplace/demo/page.tsx`
- `app/quickstart/page.tsx` (optional, can keep)

---

## Phase 5: Integration Details

### 5.1 TonConnect Wallet Integration

Source uses `@tonconnect/ui-react` with:
- `TonConnectUIProvider` wrapping the app
- `TonConnectButton` in Navbar
- `useTonWallet()` for wallet state

In Next.js, we need:
1. A `"use client"` wrapper component for `TonConnectUIProvider`
2. Buffer polyfill (source does this in `main.tsx`)

```typescript
// app/components/Providers.tsx
"use client";
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from './ToastProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      <CartProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </CartProvider>
    </TonConnectUIProvider>
  );
}
```

### 5.2 Cart ↔ x402 Payment Bridge

Connect the cart system to our existing x402 payment infrastructure:

```typescript
// When user clicks "Pay" in cart:
async function handlePayment(cartItems: CartItem[], total: number) {
  // 1. Create invoice
  const invoice: Invoice = {
    id: `inv_${Date.now()}`,
    amount: total.toFixed(2),
    timestamp: Date.now(),
    merchant: "Wisemanager",
    transactionHash: "",
    status: "pending",
    items: cartItems
  };
  
  addInvoice(invoice);
  
  // 2. Trigger x402 payment (optional real payment)
  // For now, simulate success
  
  // 3. Update invoice status
  updateInvoiceStatus(invoice.id, `simulated_${Date.now()}`);
  
  // 4. Clear cart
  clearCart();
  
  // 5. Show success toast
  addToast("Payment successful!");
}
```

### 5.3 Telegram Bot Integration

The bot link stays in:
- Landing page hero section
- Navbar (optional small link/icon)

The existing bot commands (`weather`, `market`) continue to work independently.

---

## File-by-File Implementation Checklist

### New Files to Create

| # | File | Lines (est.) | Priority |
|---|------|-------------|----------|
| 1 | `app/components/Providers.tsx` | ~30 | P0 |
| 2 | `app/context/CartContext.tsx` | ~100 | P0 |
| 3 | `app/components/ToastProvider.tsx` | ~40 | P0 |
| 4 | `app/components/Navbar.tsx` | ~80 | P0 |
| 5 | `app/shop/page.tsx` | ~200 | P1 |
| 6 | `app/cart/page.tsx` | ~150 | P1 |
| 7 | `app/dashboard/page.tsx` | ~250 | P2 |
| 8 | `public/tonconnect-manifest.json` | ~5 | P0 |

### Files to Modify

| # | File | Change |
|---|------|--------|
| 1 | `app/globals.css` | Replace with glassmorphic styles |
| 2 | `app/layout.tsx` | Wrap with Providers component |
| 3 | `app/page.tsx` | Redesign landing page |

### Files to Delete

| # | File | Reason |
|---|------|--------|
| 1 | `app/marketplace/page.tsx` | Replaced by `/shop` |
| 2 | `app/marketplace/demo/page.tsx` | No longer needed |
| 3 | `app/marketplace/marketplace.css` | Already deleted |

---

## Estimated Effort

| Phase | Description | Est. Lines | Time |
|-------|-------------|-----------|------|
| Phase 1 | Dependencies | 10 | 5 min |
| Phase 2 | CSS Migration | ~500 | 15 min |
| Phase 3 | Components & Context | ~250 | 15 min |
| Phase 4 | Page Migration | ~600 | 25 min |
| Phase 5 | Integration & Testing | ~100 | 10 min |
| **Total** | | **~1,460** | **~70 min** |

---

## Visual Comparison

### Current Wisemanager
```
/ (landing)          → "Your Wisemanager" + Telegram link
/marketplace         → eBay-style grid with filters
/marketplace/demo    → API testing page
/quickstart          → Setup guide
```

### After Migration
```
/ (landing)          → Glassmorphic landing + Telegram link + quick nav
/shop                → Product grid (glassmorphic cards) + "Add to Cart"
/cart                → Cart items + summary + "Pay" button
/dashboard           → Stats + Chart.js + Transaction history
```

### Navbar (all pages)
```
💎 Wisemanager    Shop    Cart (3)    Dashboard    💬 Bot    [Connect Wallet]
```

---

## Key Decisions

### 1. Color Scheme
- **Option A**: Keep workshop red theme (`#E1001A`) — EPFL branding
- **Option B**: Use Wisemanager blue/cyan (`#06b6d4`) — current brand ✅ Recommended
- **Option C**: Custom new color

### 2. Product Data Source
- **Option A**: Hardcoded mock data (like current marketplace) ✅ Recommended for now
- **Option B**: Fetch from `/api/market` (requires x402 payment per request)
- **Option C**: Add a free `/api/products` endpoint

### 3. Payment on Cart Checkout
- **Option A**: Simulated payment (like workshop) ✅ Recommended for demo
- **Option B**: Real x402 payment through facilitator
- **Option C**: TON direct payment via TonConnect

### 4. Dashboard Data
- **Option A**: localStorage only (like workshop) ✅ Recommended
- **Option B**: Supabase backend
- **Option C**: Hybrid

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| TonConnect SSR issues | Page crash | Dynamic imports, "use client" |
| Chart.js SSR issues | Build error | Dynamic import with `ssr: false` |
| CSS conflicts | Visual bugs | Namespace glassmorphic classes |
| localStorage not available (SSR) | Error | Guard with `typeof window` check |
| Next.js hydration mismatch | Warning/error | Consistent server/client rendering |

---

## Next Steps

When you're ready to proceed, tell me which phase to start with, or say **"go"** and I'll implement everything in order.

Recommended approach:
1. **Phase 1** → Install dependencies
2. **Phase 2** → CSS (this changes the visual foundation)
3. **Phase 3** → Components (Navbar, Context, Toast)
4. **Phase 4** → Pages (Shop, Cart, Dashboard, Home)
5. **Phase 5** → Test and fix integration issues
