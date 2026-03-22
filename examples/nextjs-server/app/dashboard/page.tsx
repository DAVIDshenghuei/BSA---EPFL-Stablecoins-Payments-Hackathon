"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useCart, type Invoice } from "../context/CartContext";

const SpendingChart = dynamic(() => import("../components/SpendingChart"), { ssr: false });

interface ServerReceipt {
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

function TypeBadge({ type }: { type: string }) {
    if (type === "sale") {
        return (
            <span style={{
                fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.6rem",
                borderRadius: 6, background: "rgba(34,197,94,0.15)", color: "#4ade80",
                border: "1px solid rgba(34,197,94,0.25)",
            }}>
                💰 SALE
            </span>
        );
    }
    if (type === "purchase") {
        return (
            <span style={{
                fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.6rem",
                borderRadius: 6, background: "rgba(59,130,246,0.15)", color: "#60a5fa",
                border: "1px solid rgba(59,130,246,0.25)",
            }}>
                🛒 PURCHASE
            </span>
        );
    }
    return (
        <span style={{
            fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.6rem",
            borderRadius: 6, background: "rgba(251,191,36,0.15)", color: "#fbbf24",
            border: "1px solid rgba(251,191,36,0.25)",
        }}>
            📤 LISTING
        </span>
    );
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

    const purchaseReceipts = serverReceipts.filter(r => r.type === "purchase" || !r.type);
    const saleReceipts = serverReceipts.filter(r => r.type === "sale");

    const serverInvoices = purchaseReceipts.map(receiptToInvoice);
    const localIds = new Set(localInvoices.map(i => i.id));
    const uniqueServerInvoices = serverInvoices.filter(si => !localIds.has(si.id));
    const allPurchases = [...localInvoices, ...uniqueServerInvoices].sort((a, b) => b.timestamp - a.timestamp);

    const totalSpent = allPurchases.reduce((s, inv) => s + parseFloat(inv.amount || "0"), 0);
    const totalRevenue = saleReceipts.reduce((s, r) => s + r.item_price_usd, 0);

    return (
        <div className="page-container dashboard-container">
            <h1 className="page-title">Dashboard</h1>
            <p className="subtitle">Overview of purchases & sales — synced across Web & Telegram Bot.</p>

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
                <div className="stat-card" style={{ borderColor: "rgba(34,197,94,0.3)" }}>
                    <div className="stat-label" style={{ color: "#4ade80" }}>💰 Revenue</div>
                    <div className="stat-value" style={{ background: "linear-gradient(to right, #4ade80, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        ${totalRevenue.toFixed(2)}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">🛒 Purchases</div>
                    <div className="stat-value">{allPurchases.length}</div>
                </div>
                <div className="stat-card" style={{ borderColor: "rgba(34,197,94,0.3)" }}>
                    <div className="stat-label" style={{ color: "#4ade80" }}>💰 Sales</div>
                    <div className="stat-value" style={{ background: "linear-gradient(to right, #4ade80, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {saleReceipts.length}
                    </div>
                </div>
            </div>

            <div className="chart-container">
                <SpendingChart invoices={allPurchases} />
            </div>

            {/* Sales / Revenue Section */}
            {saleReceipts.length > 0 && (
                <div className="transactions-section" style={{ borderColor: "rgba(34,197,94,0.2)" }}>
                    <h2 className="section-title">
                        💰 Sales & Revenue
                        <span style={{ fontSize: "0.8rem", color: "#4ade80", marginLeft: "1rem", fontWeight: 400 }}>
                            Live synced
                        </span>
                    </h2>
                    {saleReceipts.slice(0, 10).map(sale => (
                        <div className="transaction-card" key={sale.id} style={{ borderColor: "rgba(34,197,94,0.15)" }}>
                            <div className="transaction-header">
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <span className="transaction-amount" style={{ color: "#4ade80" }}>
                                        +${sale.item_price_usd.toFixed(2)}
                                    </span>
                                    <TypeBadge type="sale" />
                                </div>
                                <span className="status-badge paid">confirmed</span>
                            </div>
                            <div className="transaction-detail">
                                <span>Item Sold</span>
                                <span>{sale.item}</span>
                            </div>
                            <div className="transaction-detail">
                                <span>Buyer</span>
                                <span>{sale.buyer || "Anonymous"}</span>
                            </div>
                            <div className="transaction-detail">
                                <span>Payment Received</span>
                                <span>{sale.payment_amount}</span>
                            </div>
                            <div className="transaction-detail">
                                <span>Date</span>
                                <span>{new Date(sale.timestamp).toLocaleString()}</span>
                            </div>
                            {sale.txHash && (
                                <div className="transaction-detail">
                                    <span>TX Hash</span>
                                    <span style={{ wordBreak: "break-all", fontSize: "0.75rem" }}>{sale.txHash}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Purchases Section */}
            <div className="transactions-section">
                <h2 className="section-title">
                    🛒 Purchases
                    {serverReceipts.length > 0 && (
                        <span style={{ fontSize: "0.8rem", color: "var(--primary-light)", marginLeft: "1rem", fontWeight: 400 }}>
                            Live synced
                        </span>
                    )}
                </h2>
                {allPurchases.length === 0 ? (
                    <p style={{ color: "var(--muted)", textAlign: "center", padding: "2rem" }}>
                        No purchases yet. Buy via the Shop or Telegram Bot.
                    </p>
                ) : (
                    allPurchases.slice(0, 20).map(inv => (
                        <div className="transaction-card" key={inv.id}>
                            <div className="transaction-header">
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <span className="transaction-amount">${inv.amount}</span>
                                    <TypeBadge type="purchase" />
                                    <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
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
                                    <span style={{ wordBreak: "break-all", fontSize: "0.75rem" }}>{inv.transactionHash}</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
