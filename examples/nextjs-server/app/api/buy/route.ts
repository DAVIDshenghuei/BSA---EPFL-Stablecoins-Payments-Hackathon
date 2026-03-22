import { paymentGate } from "@ton-x402/middleware";
import { getPaymentConfig } from "../../../lib/payment-config";
import { addReceipt } from "../../../lib/receipt-store";

const handler = (request: Request) => {
    const url = new URL(request.url);
    const itemName = url.searchParams.get("item") ?? "Unknown Item";
    const itemPrice = url.searchParams.get("price") ?? "0";
    const seller = url.searchParams.get("seller") ?? "Unknown";
    const location = url.searchParams.get("location") ?? "Unknown";
    const buyer = url.searchParams.get("buyer") ?? "Bot User";

    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const purchaseId = `RCP-${ts}-${rand}`;
    const saleId = `SALE-${ts}-${rand}`;
    const now = new Date().toISOString();
    const price = parseFloat(itemPrice);

    addReceipt({
        id: purchaseId,
        type: "purchase",
        source: "bot",
        item: itemName,
        item_price_usd: price,
        seller,
        buyer,
        location,
        payment_amount: "0.1 TON",
        payment_protocol: "x402",
        status: "confirmed",
        txHash: "",
        network: "testnet",
        timestamp: now,
    });

    addReceipt({
        id: saleId,
        type: "sale",
        source: "bot",
        item: itemName,
        item_price_usd: price,
        seller,
        buyer,
        location,
        payment_amount: "0.1 TON",
        payment_protocol: "x402",
        status: "confirmed",
        txHash: "",
        network: "testnet",
        timestamp: now,
    });

    return Response.json({
        success: true,
        receipt: {
            id: purchaseId,
            item: itemName,
            item_price_usd: price,
            seller,
            location,
            payment_amount: "0.1 TON",
            payment_protocol: "x402",
            status: "confirmed",
            timestamp: now,
        },
    });
};

export const GET = paymentGate(handler, {
    config: getPaymentConfig({
        amount: "100000000",
        asset: "TON",
        description: "Wisemanager Item Purchase (0.1 TON)",
    }),
});
