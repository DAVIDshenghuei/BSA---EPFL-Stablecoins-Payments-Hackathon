import { paymentGate } from "@ton-x402/middleware";
import { getPaymentConfig } from "../../../lib/payment-config";

const allItems = [
    // ── Original marketplace listings ──
    {
        id: "pc-001",
        category: "Electronics",
        item: "Refurbished MacBook Air M1",
        price_usd: 650,
        seller: "TechRelove",
        trust_score: 98,
        location: "Lausanne",
        condition: "Like New",
        delivery_speed: "1-2 days",
        tags: ["laptop", "apple", "budget"],
    },
    {
        id: "pc-002",
        category: "Electronics",
        item: "Dell XPS 13 (2021)",
        price_usd: 580,
        seller: "SwissPC_Outlet",
        trust_score: 85,
        location: "Geneva",
        condition: "Good",
        delivery_speed: "3-5 days",
        tags: ["laptop", "windows", "office"],
    },
    {
        id: "pc-003",
        category: "Electronics",
        item: "Custom Gaming PC (RTX 3060)",
        price_usd: 850,
        seller: "GamerHub_CH",
        trust_score: 92,
        location: "Zurich",
        condition: "New",
        delivery_speed: "Next day",
        tags: ["gaming", "desktop", "high-performance"],
    },
    {
        id: "srv-001",
        category: "Services",
        item: "Professional Logo Design",
        price_usd: 25,
        seller: "CreativeLoris",
        trust_score: 99,
        location: "Remote",
        condition: "N/A",
        delivery_speed: "24 hours",
        tags: ["design", "logo", "branding"],
    },
    {
        id: "srv-002",
        category: "Services",
        item: "Next.js Bug Fixing (1 hour)",
        price_usd: 40,
        seller: "FullStackStan",
        trust_score: 96,
        location: "Remote",
        condition: "N/A",
        delivery_speed: "Instant",
        tags: ["programming", "nextjs", "debug"],
    },
    // ── Shop products (synced from app/data/products.ts) ──
    {
        id: "shop-001",
        category: "Electronics",
        item: 'MacBook Pro 14"',
        price_usd: 1299,
        seller: "Wisemanager Shop",
        trust_score: 100,
        location: "Lausanne",
        condition: "New",
        delivery_speed: "2-3 days",
        tags: ["laptop", "apple", "pro"],
    },
    {
        id: "shop-002",
        category: "Electronics",
        item: "Wireless Noise-Cancelling Headphones",
        price_usd: 249,
        seller: "Wisemanager Shop",
        trust_score: 100,
        location: "Zurich",
        condition: "New",
        delivery_speed: "1-2 days",
        tags: ["audio", "headphones", "anc"],
    },
    {
        id: "shop-003",
        category: "Men's Clothing",
        item: "Slim Fit Premium Jacket",
        price_usd: 89,
        seller: "Wisemanager Shop",
        trust_score: 100,
        location: "Bern",
        condition: "New",
        delivery_speed: "2-3 days",
        tags: ["jacket", "fashion", "men"],
    },
    {
        id: "shop-004",
        category: "Jewelery",
        item: "Gold Chain Necklace",
        price_usd: 320,
        seller: "Wisemanager Shop",
        trust_score: 100,
        location: "Geneva",
        condition: "New",
        delivery_speed: "3-5 days",
        tags: ["necklace", "gold", "jewelery"],
    },
    {
        id: "shop-005",
        category: "Electronics",
        item: "Mechanical Keyboard RGB",
        price_usd: 129,
        seller: "Wisemanager Shop",
        trust_score: 100,
        location: "Zurich",
        condition: "New",
        delivery_speed: "1-2 days",
        tags: ["keyboard", "mechanical", "rgb"],
    },
    {
        id: "shop-006",
        category: "Women's Clothing",
        item: "Summer Floral Dress",
        price_usd: 59,
        seller: "Wisemanager Shop",
        trust_score: 100,
        location: "Lausanne",
        condition: "New",
        delivery_speed: "2-3 days",
        tags: ["dress", "summer", "women"],
    },
    {
        id: "shop-007",
        category: "Electronics",
        item: '4K Ultra HD Monitor 27"',
        price_usd: 449,
        seller: "Wisemanager Shop",
        trust_score: 100,
        location: "Bern",
        condition: "New",
        delivery_speed: "3-5 days",
        tags: ["monitor", "4k", "display"],
    },
    {
        id: "shop-008",
        category: "Women's Clothing",
        item: "Leather Crossbody Bag",
        price_usd: 75,
        seller: "Wisemanager Shop",
        trust_score: 100,
        location: "Geneva",
        condition: "New",
        delivery_speed: "2-3 days",
        tags: ["bag", "leather", "women"],
    },
    {
        id: "shop-009",
        category: "Electronics",
        item: "Smart Watch Series 5",
        price_usd: 199,
        seller: "Wisemanager Shop",
        trust_score: 100,
        location: "Lausanne",
        condition: "New",
        delivery_speed: "1-2 days",
        tags: ["watch", "smart", "wearable"],
    },
    {
        id: "shop-010",
        category: "Jewelery",
        item: "Diamond Stud Earrings",
        price_usd: 550,
        seller: "Wisemanager Shop",
        trust_score: 100,
        location: "Geneva",
        condition: "New",
        delivery_speed: "3-5 days",
        tags: ["earrings", "diamond", "jewelery"],
    },
    {
        id: "shop-011",
        category: "Men's Clothing",
        item: "Classic Oxford Shirt",
        price_usd: 45,
        seller: "Wisemanager Shop",
        trust_score: 100,
        location: "Bern",
        condition: "New",
        delivery_speed: "2-3 days",
        tags: ["shirt", "oxford", "men"],
    },
    {
        id: "shop-012",
        category: "Electronics",
        item: "Portable Bluetooth Speaker",
        price_usd: 79,
        seller: "Wisemanager Shop",
        trust_score: 100,
        location: "Zurich",
        condition: "New",
        delivery_speed: "1-2 days",
        tags: ["speaker", "bluetooth", "portable"],
    },
];

const handler = (request: Request) => {
    const url = new URL(request.url);
    const name = url.searchParams.get("name");
    const price = url.searchParams.get("price");
    const location = url.searchParams.get("location");
    const category = url.searchParams.get("category");

    let filteredItems = [...allItems];

    if (name) {
        filteredItems = filteredItems.filter(
            (it) =>
                it.item.toLowerCase().includes(name.toLowerCase()) ||
                it.tags.some((t) => t.toLowerCase().includes(name.toLowerCase()))
        );
    }

    if (price) {
        if (price.includes("-")) {
            const [min, max] = price.split("-").map((p) => parseFloat(p.replace("$", "")));
            filteredItems = filteredItems.filter((it) => it.price_usd >= min && it.price_usd <= max);
        } else {
            const exact = parseFloat(price.replace("$", ""));
            filteredItems = filteredItems.filter((it) => it.price_usd === exact);
        }
    }

    if (location) {
        filteredItems = filteredItems.filter((it) =>
            it.location.toLowerCase().includes(location.toLowerCase())
        );
    }

    if (category) {
        filteredItems = filteredItems.filter((it) =>
            it.category.toLowerCase().includes(category.toLowerCase())
        );
    }

    return Response.json({
        success: true,
        total_items: filteredItems.length,
        filters_applied: {
            name: name || null,
            price: price || null,
            location: location || null,
            category: category || null,
        },
        items: filteredItems,
        timestamp: new Date().toISOString(),
    });
};

export const GET = paymentGate(handler, {
    config: getPaymentConfig({
        amount: "10000000", // 0.01 BSA USD (9 decimals)
        asset: process.env.JETTON_MASTER_ADDRESS || "kQCd6G7c_HUBkgwtmGzpdqvHIQoNkYOEE0kSWoc5v57hPPnW",
        description: "Premium marketplace data (0.01 BSA USD)",
        decimals: 9,
    }),
});