![Wisemanager — cover](docs/screen.png)

# Wisemanager: Autonomous Agent Commerce on TON

**Empowering the next generation of AI-driven marketplaces through the x402 protocol on TON.**

[![TON](https://img.shields.io/badge/Blockchain-TON-0098EA)](https://ton.org/)
[![Protocol](https://img.shields.io/badge/Payments-x402-06b6d4)](https://github.com/coinbase/x402)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**[Website — Coming Soon](#)** · **[Live Demo Bot](https://t.me/Wisemanagersbot)** · **[Engineering appendix](#appendix-engineering--operations)** · **[Pitch deck (Canva)](https://canva.link/mau0khv02c1w0nv)**

---

Wisemanager is **social and agent-ready commerce infrastructure on TON**. We combine the **x402 protocol** with **BSA USD / TON** settlement so users on super-apps like Telegram get **chat-to-checkout** and **automation-friendly micropayments**—humans, **AI agents**, bots, and APIs can complete paid delivery **without repeated wallet popups**.

---

## Achievements

| Milestone | Detail |
|-----------|--------|
| **BSA × EPFL Hackathon** | **3rd Place** — Stablecoins & Payments track |
| **Technical** | x402 payment gates live on **TON testnet** (market data, checkout, bot purchases, listing fee) |
| **Product** | End-to-end flows validated: natural-language **market → buy**, **sell** listing wizard, **Web Shop / Cart / Dashboard** with receipt sync |

---

## Why Wisemanager? (What problem we solve)

### 1. Smart matching & agent-ready commerce

Traditional e‑commerce depends on fixed search boxes and forms. Wisemanager lets users state intent in **natural language** inside Telegram; the system parses category, price band, location, and tags, and returns shoppable candidates—the same APIs can be called by an **AI agent**, closing the loop from **plain language → pay → result**.

### 2. Frictionless micropayments (x402)

Web3 commerce is often blocked by “open the wallet again.” x402 turns **HTTP 402** into an executable payment instruction: **client / bot** signs, retries, and settles automatically—ideal for **API metering, pay-per-use content, and bot commerce**. Wisemanager implements this on TON with **BSA USD (Jetton)** and related asset configs for hackathon and experimental deployments.

### 3. Traceable transactions (trust & transparency)

Every gated payment leaves auditable context. The **Dashboard** unifies purchases, sales, and source (Bot / Web) so buyers and sellers see cash flow in one view—laying groundwork for **reputation, dispute resolution, and B2B settlement** later.

---

## Core value props (impact, not only features)

| **AI-agent commerce** | **x402 micropayments** | **Trustless reputation** |
|------------------------|-------------------------|---------------------------|
| Natural language bridges humans and structured APIs: **conversation is search**, search can **pay**, shrinking intent-to-order friction. | Payment instructions live in **REST**: 402 → sign → retry → settle—built for **low-latency, small-ticket, highly automated** machine economies. | Trades and receipts are accounted for and tied to seller / buyer labels—foundation for **open-market governance**. |

---

## Why now?

- **900M+ native distribution** — Telegram is one of the largest open chat distribution channels; **conversational UI** is the next front for commerce and support.
- **The payment gap** — LLMs and agents can persuade users but lack a **machine-executable, reconcilable, evolvable** payment standard; **x402 + on-chain settlement** closes the last mile for the API economy.
- **TON’s fit** — Low-friction activation and mini-app ecosystems let **social + payments + digital goods** close the loop on one chain.

---

## Product demo

[![Wisemanager demo](https://img.youtube.com/vi/_iTJZTHn_Sc/0.jpg)](https://youtu.be/_iTJZTHn_Sc)

*~60s story: natural-language `market` → `buy`, `sell` listing, Web Shop checkout, Dashboard receipt sync.*

---

## Technical architecture (30-second version for reviewers)

### x402 on TON (conceptual flow)

1. **Request** — Client / bot calls a protected resource (e.g. `/api/market`).
2. **Challenge** — Server returns **402 Payment Required** with payment metadata (amount, asset, pay-to address).
3. **Execution** — Client-side wallet keys sign offline; client **retries** with payment proof.
4. **Settlement** — Facilitator verifies and broadcasts; resource unlocks after confirmation.

```mermaid
sequenceDiagram
    participant User
    participant Bot
    participant Server
    participant Facilitator
    participant TON
    User->>Bot: natural language command
    Bot->>Server: GET protected API
    Server-->>Bot: 402 + payment instructions
    Bot->>Server: retry with payment proof
    Server->>Facilitator: verify / settle
    Facilitator->>TON: broadcast
    Server-->>Bot: 200 + data + receipt context
```

### Product surface today

| Surface | What it proves |
|---------|----------------|
| **Telegram Bot** | NL `market` / `buy` / `sell` + automated x402 payments |
| **Web app** | Glassmorphic **Shop**, **Cart**, **Dashboard**; TonConnect; server-side checkout proxy |
| **Shared state** | Demo-grade in-memory receipts / listings (swap for a database in production) |

---

## Roadmap & market

| Horizon | Focus |
|---------|--------|
| **Q2 2026** | Southeast Asia **quick commerce** pilots and localized payment routing |
| **Q3 2026** | **AI-agent SDK** — standardized **intent → quote → pay** adapter for third parties |
| **Q4 2026** | Integrations with **TON Society–style reputation** — map completed trades to composable identity |

---

## Contact & community

- **Telegram Bot:** [@Wisemanagersbot](https://t.me/Wisemanagersbot)
- **Founder:** *[Shenghuei LIN]*
- **Email:** *[shenghuei1102@gmail.com]*

**Cover asset:** repository image at [`docs/screen.png`](docs/screen.png) (also used at the top of this README).

---

# Appendix: Engineering & operations

Everything below is for engineers and deep technical review—investors can stop above.

## Tech stack

TypeScript · Next.js 15 (App Router) · TON SDK · Telegram Bot API · pnpm monorepo · `@ton-x402/*` (core / client / middleware / facilitator)

## Monorepo layout (short)

```text
packages/          → core, client, middleware, facilitator
examples/
  nextjs-server/   → Web UI + API routes + payment gates
  client-script/   → Telegram bot + CLI pay scripts
```

## Quick start (short)

```bash
pnpm install && pnpm build
cd examples/nextjs-server && cp .env.example .env.local
# Set PAYMENT_ADDRESS, JETTON_MASTER_ADDRESS, TON_RPC_URL, RPC_API_KEY, WALLET_MNEMONIC, etc.
pnpm dev   # http://localhost:3000
```

```bash
cd examples/client-script
npx tsx --env-file=../nextjs-server/.env.local src/telegram-bot.ts
```

More detail: `examples/client-script/TELEGRAM_BOT_README.md`, `TROUBLESHOOTING.md`, `MARKET_FILTER_GUIDE.md`.

## Bot commands (summary)

| Command | Description |
|---------|-------------|
| `weather` | Paywalled weather data |
| `market …` | Natural-language product search (name / price / location / category) |
| `buy` / `buy <name>` | Purchase from the latest `market` results (x402) |
| `sell` | Multi-step listing + listing fee (x402) |

## Web routes (summary)

| Path | Description |
|------|-------------|
| `/` | Landing — Your Wisemanager |
| `/shop` | Product grid (includes user listings) |
| `/cart` | Cart + Checkout with TON |
| `/dashboard` | Purchase / sale receipts and charts |

## API highlights

| Endpoint | Purpose |
|----------|---------|
| `GET /api/market` | Paywalled market feed (static catalog + user listings merged) |
| `GET /api/buy` | Bot single-item purchase |
| `GET /api/sell` | Listing-fee gate |
| `POST /api/checkout` | Web checkout (server-side x402 proxy) |
| `GET /api/receipts` | Demo receipt list |
| `GET /api/products`, `POST /api/products` | List and create user-listed products |

## Security

- Never commit `.env.local`, mnemonics, or bot tokens.
- Production: prefer webhooks, a dedicated facilitator, secret management, and a real database.

## License

MIT

**Built on the BSA × TON x402 template — evolved into Wisemanager.**
