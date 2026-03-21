import { paymentGate } from "@ton-x402/middleware";
import { getPaymentConfig } from "../../../lib/payment-config";

const handler = (request: Request) => {
    // Parse URL to get query parameters
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    const price = url.searchParams.get('price');
    const location = url.searchParams.get('location');

    // Marketplace data
    const allItems = [
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
            tags: ["laptop", "apple", "budget"]
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
            tags: ["laptop", "windows", "office"]
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
            tags: ["gaming", "desktop", "high-performance"]
        },
        {
            id: "srv-001",
            category: "Services",
            item: "Professional Logo Design",
            price_usd: 25,
            seller: "CreativeLoris",
            trust_score: 99,
            location: "Remote",
            delivery_speed: "24 hours",
            tags: ["design", "logo", "branding"]
        },
        {
            id: "srv-002",
            category: "Services",
            item: "Next.js Bug Fixing (1 hour)",
            price_usd: 40,
            seller: "FullStackStan",
            trust_score: 96,
            location: "Remote",
            delivery_speed: "Instant",
            tags: ["programming", "nextjs", "debug"]
        }
    ];

    // Filter items based on query parameters
    let filteredItems = allItems;

    // Filter by name (case insensitive, partial match)
    if (name) {
        filteredItems = filteredItems.filter(item => 
            item.item.toLowerCase().includes(name.toLowerCase())
        );
    }

    // Filter by price (support range like "500-700" or exact price)
    if (price) {
        if (price.includes('-')) {
            const [min, max] = price.split('-').map(p => parseFloat(p.replace('$', '')));
            filteredItems = filteredItems.filter(item => 
                item.price_usd >= min && item.price_usd <= max
            );
        } else {
            const exactPrice = parseFloat(price.replace('$', ''));
            filteredItems = filteredItems.filter(item => 
                item.price_usd === exactPrice
            );
        }
    }

    // Filter by location (case insensitive, partial match)
    if (location) {
        filteredItems = filteredItems.filter(item => 
            item.location.toLowerCase().includes(location.toLowerCase())
        );
    }

    return Response.json({
        success: true,
        total_items: filteredItems.length,
        filters_applied: {
            name: name || null,
            price: price || null,
            location: location || null
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