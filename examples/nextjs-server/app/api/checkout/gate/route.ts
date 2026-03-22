import { paymentGate } from "@ton-x402/middleware";
import { getPaymentConfig } from "../../../../lib/payment-config";

const handler = (request: Request) => {
    return Response.json({
        success: true,
        message: "Payment confirmed — checkout complete",
        timestamp: new Date().toISOString(),
    });
};

export const GET = paymentGate(handler, {
    config: getPaymentConfig({
        amount: "100000000", // 0.1 TON (9 decimals)
        asset: "TON",
        description: "Wisemanager Checkout (0.1 TON)",
    }),
});
