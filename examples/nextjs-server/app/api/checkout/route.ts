import { x402Fetch } from "@ton-x402/client";
import { nanoToTon } from "@ton-x402/core";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV5R1 } from "@ton/ton";
import { TonClient } from "@ton/ton";
import { NextRequest } from "next/server";
import { addReceipt } from "../../../lib/receipt-store";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return Response.json({ success: false, error: "Cart is empty" }, { status: 400 });
        }

        const mnemonic = process.env.WALLET_MNEMONIC;
        if (!mnemonic) {
            return Response.json({ success: false, error: "Wallet not configured" }, { status: 500 });
        }

        const rpcUrl = process.env.TON_RPC_URL ?? "https://testnet.toncenter.com/api/v2/jsonRPC";

        const origin = request.nextUrl.origin;
        const resourceUrl = `${origin}/api/checkout/gate`;

        const keypair = await mnemonicToPrivateKey(mnemonic.split(" "));
        const wallet = WalletContractV5R1.create({
            publicKey: keypair.publicKey,
            workchain: 0,
        });

        const client = new TonClient({
            endpoint: rpcUrl,
            apiKey: process.env.RPC_API_KEY,
        });
        const walletContract = client.open(wallet);

        const balance = await client.getBalance(wallet.address);
        const seqno = await walletContract.getSeqno();

        console.log(`🛒 Checkout — ${items.length} item(s)`);
        console.log(`💳 Wallet: ${wallet.address.toString({ bounceable: false })}`);
        console.log(`💰 Balance: ${nanoToTon(balance.toString())} TON`);

        const result = await x402Fetch(resourceUrl, {
            wallet,
            keypair,
            seqno,
            client,
            verbose: false,
        });

        if (result.response.ok) {
            const data = await result.response.json();
            const txHash = result.settlement?.txHash ?? "";
            const network = result.settlement?.network ?? "testnet";

            const total = items.reduce((s: number, i: any) => s + (i.price ?? 0) * (i.quantity ?? 1), 0);
            const itemNames = items.map((i: any) => i.title ?? "item").join(", ");
            const now = new Date().toISOString();
            const ts = Date.now().toString(36).toUpperCase();

            addReceipt({
                id: `WEB-${ts}`,
                type: "purchase",
                source: "web",
                item: itemNames,
                item_price_usd: total,
                seller: items[0]?.seller || "Wisemanager Shop",
                buyer: "You",
                location: "Web Checkout",
                payment_amount: "0.1 TON",
                payment_protocol: "x402",
                status: "confirmed",
                txHash,
                network,
                timestamp: now,
            });

            const sellerGroups = new Map<string, { items: string[]; total: number }>();
            for (const it of items) {
                const seller = it.seller || "Wisemanager Shop";
                const group = sellerGroups.get(seller) || { items: [], total: 0 };
                group.items.push(it.title ?? "item");
                group.total += (it.price ?? 0) * (it.quantity ?? 1);
                sellerGroups.set(seller, group);
            }

            let saleIdx = 0;
            for (const [seller, group] of sellerGroups) {
                addReceipt({
                    id: `SALE-W-${ts}-${saleIdx++}`,
                    type: "sale",
                    source: "web",
                    item: group.items.join(", "),
                    item_price_usd: group.total,
                    seller,
                    buyer: "Web Buyer",
                    location: "Web Checkout",
                    payment_amount: "0.1 TON",
                    payment_protocol: "x402",
                    status: "confirmed",
                    txHash,
                    network,
                    timestamp: now,
                });
            }

            return Response.json({
                success: true,
                data,
                txHash: txHash || null,
                network,
                paidAmount: "0.1 TON",
                items,
            });
        } else {
            const text = await result.response.text();
            return Response.json({
                success: false,
                error: text,
                paid: result.paid,
            }, { status: 402 });
        }
    } catch (error: any) {
        console.error("❌ Checkout error:", error);
        return Response.json({
            success: false,
            error: error.message || String(error),
        }, { status: 500 });
    }
}
