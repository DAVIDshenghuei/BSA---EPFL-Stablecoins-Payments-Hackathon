"use client";

import dynamic from "next/dynamic";
import { useCart } from "../context/CartContext";

const SpendingChart = dynamic(() => import("../components/SpendingChart"), { ssr: false });

export default function DashboardPage() {
    const { invoices, cart, cartTotal, cartCount } = useCart();

    const totalSpent = invoices.reduce((s, inv) => s + parseFloat(inv.amount || "0"), 0);
    const paidInvoices = invoices.filter(i => i.status === "paid");

    return (
        <div className="page-container dashboard-container">
            <h1 className="page-title">Dashboard</h1>
            <p className="subtitle">Overview of your activity and spending.</p>

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
            </div>

            <div className="chart-container">
                <SpendingChart invoices={invoices} />
            </div>

            <div className="transactions-section">
                <h2 className="section-title">Recent Invoices</h2>
                {invoices.length === 0 ? (
                    <p style={{ color: "var(--muted)", textAlign: "center", padding: "2rem" }}>
                        No invoices yet. They will appear here after checkout.
                    </p>
                ) : (
                    invoices.slice(0, 10).map(inv => (
                        <div className="transaction-card" key={inv.id}>
                            <div className="transaction-header">
                                <span className="transaction-amount">${inv.amount}</span>
                                <span className={`status-badge ${inv.status}`}>{inv.status}</span>
                            </div>
                            <div className="transaction-detail">
                                <span>Merchant</span>
                                <span>{inv.merchant}</span>
                            </div>
                            <div className="transaction-detail">
                                <span>Date</span>
                                <span>{new Date(inv.timestamp).toLocaleDateString()}</span>
                            </div>
                            {inv.transactionHash && (
                                <div className="transaction-detail">
                                    <span>TX</span>
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
