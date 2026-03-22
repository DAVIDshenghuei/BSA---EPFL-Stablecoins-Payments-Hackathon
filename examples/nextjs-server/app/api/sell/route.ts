import { paymentGate } from "@ton-x402/middleware";
import { getPaymentConfig } from "../../../lib/payment-config";

const handler = (_request: Request) => {
    return Response.json({
        success: true,
        message: "Listing fee paid — product can now be listed",
        timestamp: new Date().toISOString(),
    });
};

export const GET = paymentGate(handler, {
    config: getPaymentConfig({
        amount: "100000000", // 0.1 TON
        asset: "TON",
        description: "Wisemanager Listing Fee (0.1 TON)",
    }),
});
