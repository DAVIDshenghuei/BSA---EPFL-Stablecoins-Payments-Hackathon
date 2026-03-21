import { paymentGate } from "@ton-x402/middleware";
import { getPaymentConfig } from "../../../lib/payment-config";

const handler = (_request: Request) => {
    // Marketplace data
    const marketplaceItems = [
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

    return Response.json({
        success: true,
        total_items: marketplaceItems.length,
        items: marketplaceItems,
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