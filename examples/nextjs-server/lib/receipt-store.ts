export interface ServerReceipt {
    id: string;
    type: "purchase" | "sale" | "listing";
    source: "bot" | "web";
    item: string;
    item_price_usd: number;
    seller: string;
    buyer?: string;
    location: string;
    payment_amount: string;
    payment_protocol: string;
    status: string;
    txHash: string;
    network: string;
    timestamp: string;
}

const receipts: ServerReceipt[] = [];

export function addReceipt(receipt: ServerReceipt) {
    receipts.unshift(receipt);
    if (receipts.length > 200) receipts.pop();
}

export function getReceipts(): ServerReceipt[] {
    return receipts;
}
