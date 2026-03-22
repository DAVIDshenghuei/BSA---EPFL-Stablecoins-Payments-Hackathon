import { paymentGate } from "@ton-x402/middleware";
import { getPaymentConfig } from "../../../lib/payment-config";
import { addReceipt } from "../../../lib/receipt-store";

const handler = (request: Request) => {
    const url = new URL(request.url);
    const itemName = url.searchParams.get("item") ?? "Unknown Item";
    const itemPrice = url.searchParams.get("price") ?? "0";
    const seller = url.searchParams.get("seller") ?? "Unknown";
    const location = url.searchParams.get("location") ?? "Unknown";
    const txHash = url.searchParams.get("txHash") ?? "";
    const network = url.searchParams.get("network") ?? "testnet";

    const receiptId = `RCP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const receipt = {
        id: receiptId,
        source: "bot" as const,
        item: itemName,
        item_price_usd: parseFloat(itemPrice),
        seller,
        location,
        payment_amount: "0.1 TON",
        payment_protocol: "x402",
        status: "confirmed",
        txHash,
        network,
        timestamp: new Date().toISOString(),
    };

    addReceipt(receipt);

    return Response.json({ success: true, receipt });
};

export const GET = paymentGate(handler, {
    config: getPaymentConfig({
        amount: "100000000", // 0.1 TON (9 decimals)
        asset: "TON",
        description: "Wisemanager Item Purchase (0.1 TON)",
    }),
});
