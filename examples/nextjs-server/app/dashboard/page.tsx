"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useCart, type Invoice } from "../context/CartContext";

const SpendingChart = dynamic(() => import("../components/SpendingChart"), { ssr: false });

interface ServerReceipt {
    id: string;
    source: "bot" | "web";
    item: string;
    item_price_usd: number;
    seller: string;
    location: string;
    payment_amount: string;
    payment_protocol: string;
    status: string;
    txHash: string;
    network: string;
    timestamp: string;
}

function receiptToInvoice(r: ServerReceipt): Invoice {
    return {
        id: r.id,
        amount: r.item_price_usd.toFixed(2),
        timestamp: new Date(r.timestamp).getTime(),
        merchant: `${r.seller} (${r.source === "bot" ? "🤖 Bot" : "🌐 Web"})`,
        transactionHash: r.txHash || "",
        status: "paid",
        items: [{ id: r.id, title: r.item, price: r.item_price_usd, quantity: 1 }],
    };
}

export default function DashboardPage() {
    const { invoices: localInvoices, cart, cartTotal, cartCount } = useCart();
    const [serverReceipts, setServerReceipts] = useState<ServerReceipt[]>([]);

    const fetchReceipts = useCallback(async () => {
        try {
            const res = await fetch("/api/receipts");
            if (res.ok) {
                const data = await res.json();
                setServerReceipts(data.receipts ?? []);
            }
        } catch {}
    }, []);

    useEffect(() => {
        fetchReceipts();
        const interval = setInterval(fetchReceipts, 5000);
        return () => clearInterval(interval);
    }, [fetchReceipts]);

    const serverInvoices = serverReceipts.map(receiptToInvoice);

    const localIds = new Set(localInvoices.map(i => i.id));
    const uniqueServerInvoices = serverInvoices.filter(si => !localIds.has(si.id));
    const allInvoices = [...localInvoices, ...uniqueServerInvoices]
        .sort((a, b) => b.timestamp - a.timestamp);

    const totalSpent = allInvoices.reduce((s, inv) => s + parseFloat(inv.amount || "0"), 0);
    const paidInvoices = allInvoices.filter(i => i.status === "paid");
    const botPurchases = serverReceipts.filter(r => r.source === "bot").length;
    const webPurchases = localInvoices.length + serverReceipts.filter(r => r.source === "web").length;

    return (
        <div className="page-container dashboard-container">
            <h1 className="page-title">Dashboard</h1>
            <p className="subtitle">Overview of your activity and spending — synced across Web & Telegram Bot.</p>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Cart Items</div>
                    <div className="stat-value">{cartCount()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Cart Value</div>
                    <div className="stat-value">${cartTotal().toFixed(2)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Spent</div>
                    <div className="stat-value">${totalSpent.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Paid Invoices</div>
                    <div className="stat-value">{paidInvoices.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">🤖 Bot Purchases</div>
                    <div className="stat-value">{botPurchases}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">🌐 Web Purchases</div>
                    <div className="stat-value">{webPurchases}</div>
                </div>
            </div>

            <div className="chart-container">
                <SpendingChart invoices={allInvoices} />
            </div>

            <div className="transactions-section">
                <h2 className="section-title">
                    All Transactions
                    {serverReceipts.length > 0 && (
                        <span style={{ fontSize: "0.8rem", color: "var(--primary-light)", marginLeft: "1rem", fontWeight: 400 }}>
                            Live synced
                        </span>
                    )}
                </h2>
                {allInvoices.length === 0 ? (
                    <p style={{ color: "var(--muted)", textAlign: "center", padding: "2rem" }}>
                        No invoices yet. Purchase via the Shop or Telegram Bot to see them here.
                    </p>
                ) : (
                    allInvoices.slice(0, 20).map(inv => (
                        <div className="transaction-card" key={inv.id}>
                            <div className="transaction-header">
                                <div>
                                    <span className="transaction-amount">${inv.amount}</span>
                                    <span style={{ fontSize: "0.8rem", color: "var(--muted)", marginLeft: "0.75rem" }}>
                                        {inv.id.startsWith("RCP-") ? "🤖 Bot" : inv.id.startsWith("WEB-") ? "🌐 Web" : "🛒 Checkout"}
                                    </span>
                                </div>
                                <span className={`status-badge ${inv.status}`}>{inv.status}</span>
                            </div>
                            <div className="transaction-detail">
                                <span>Item</span>
                                <span>{inv.items?.[0]?.title ?? "—"}</span>
                            </div>
                            <div className="transaction-detail">
                                <span>Merchant</span>
                                <span>{inv.merchant}</span>
                            </div>
                            <div className="transaction-detail">
                                <span>Date</span>
                                <span>{new Date(inv.timestamp).toLocaleString()}</span>
                            </div>
                            {inv.transactionHash && (
                                <div className="transaction-detail">
                                    <span>TX Hash</span>
                                    <span style={{ wordBreak: "break-all", fontSize: "0.75rem" }}>
                                        {inv.transactionHash}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
