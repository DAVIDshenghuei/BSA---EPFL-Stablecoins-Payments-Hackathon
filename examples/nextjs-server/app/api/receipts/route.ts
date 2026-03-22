import { getReceipts } from "../../../lib/receipt-store";

export function GET() {
    return Response.json({ receipts: getReceipts() });
}
