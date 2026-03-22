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

            addReceipt({
                id: `WEB-${Date.now().toString(36).toUpperCase()}`,
                source: "web",
                item: itemNames,
                item_price_usd: total,
                seller: "Wisemanager Shop",
                location: "Web Checkout",
                payment_amount: "0.1 TON",
                payment_protocol: "x402",
                status: "confirmed",
                txHash,
                network,
                timestamp: new Date().toISOString(),
            });

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
