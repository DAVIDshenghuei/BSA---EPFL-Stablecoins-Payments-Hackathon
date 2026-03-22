"use client";

import Link from "next/link";

export default function HomePage() {
    return (
        <div className="landing-hero">
            <div className="hero-badge">🚀 POWERED BY TON BLOCKCHAIN</div>

            <h1 className="hero-title">
                Your <span className="gradient-text">Wisemanager</span>
            </h1>

            <p className="hero-description">
                A smart marketplace with micro-payment APIs on the TON blockchain.
                Shop, manage, and pay — all powered by the x402 protocol.
            </p>

            <div className="hero-actions">
                <a
                    href="https://t.me/Wisemanagersbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-telegram"
                >
                    <span style={{ fontSize: "1.3rem" }}>💬</span>
                    Chat on Telegram
                </a>
                <Link href="/shop" className="btn-shop">
                    <span style={{ fontSize: "1.3rem" }}>🛍️</span>
                    Browse Shop
                </Link>
            </div>

            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">💎</div>
                    <h3>TON Connect</h3>
                    <p>Connect your TON wallet for seamless on-chain payments.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🤖</div>
                    <h3>Smart Bot</h3>
                    <p>Telegram bot with natural language search and marketplace data.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🔗</div>
                    <h3>x402 Protocol</h3>
                    <p>HTTP 402 micro-payments per API request, settled on TON.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h3>Dashboard</h3>
                    <p>Track spending, invoices, and transaction history in real-time.</p>
                </div>
            </div>
        </div>
    );
}
