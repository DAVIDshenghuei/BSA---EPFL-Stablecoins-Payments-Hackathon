"use client";

import { useState } from "react";

interface MarketItem {
    item: string;
    price_usd: number;
    seller: string;
    trust_score: number;
    location: string;
    condition: string;
    delivery_speed: string;
    tags: string[];
}

export default function MarketplaceAPIDemo() {
    const [items, setItems] = useState<MarketItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [filters, setFilters] = useState({
        name: "",
        price: "",
        location: ""
    });

    const fetchMarketplaceData = async () => {
        setLoading(true);
        setError("");

        try {
            // Build query params
            const params = new URLSearchParams();
            if (filters.name) params.append("name", filters.name);
            if (filters.price) params.append("price", filters.price);
            if (filters.location) params.append("location", filters.location);

            const url = `http://localhost:3000/api/market?${params.toString()}`;
            
            // This would normally trigger the x402 payment flow
            // For demo purposes, we'll just show what would happen
            const response = await fetch(url);
            
            if (response.status === 402) {
                const paymentInfo = await response.json();
                setError(`Payment Required: ${JSON.stringify(paymentInfo, null, 2)}`);
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setItems(data.items || []);
        } catch (err: any) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ marginBottom: "1rem" }}>🛍️ Marketplace API Demo</h1>
            <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
                Test the /api/market endpoint with x402 payment protection
            </p>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>🔍 Filters</h3>
                
                <div style={{ display: "grid", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Item Name</label>
                        <input
                            type="text"
                            placeholder="e.g., MacBook"
                            value={filters.name}
                            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                            style={{ width: "100%", padding: "0.5rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text)" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Price Range</label>
                        <input
                            type="text"
                            placeholder="e.g., 500-700"
                            value={filters.price}
                            onChange={(e) => setFilters({ ...filters, price: e.target.value })}
                            style={{ width: "100%", padding: "0.5rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text)" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Location</label>
                        <input
                            type="text"
                            placeholder="e.g., Lausanne"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            style={{ width: "100%", padding: "0.5rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text)" }}
                        />
                    </div>
                </div>

                <button
                    onClick={fetchMarketplaceData}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                >
                    {loading ? "Loading..." : "🔍 Fetch Marketplace Data (0.01 BSA USD)"}
                </button>
            </div>

            {error && (
                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "1rem", marginBottom: "2rem" }}>
                    <strong style={{ color: "var(--error)" }}>⚠️ Error:</strong>
                    <pre style={{ marginTop: "0.5rem", fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                        {error}
                    </pre>
                </div>
            )}

            {items.length > 0 && (
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem" }}>
                    <h3 style={{ marginBottom: "1rem" }}>📦 Results ({items.length} items)</h3>
                    
                    <div style={{ display: "grid", gap: "1rem" }}>
                        {items.map((item, index) => (
                            <div key={index} style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem" }}>
                                <h4 style={{ marginBottom: "0.5rem" }}>{item.item}</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.875rem", color: "var(--muted)" }}>
                                    <div>💰 ${item.price_usd}</div>
                                    <div>🏪 {item.seller}</div>
                                    <div>📍 {item.location}</div>
                                    <div>⭐ {item.trust_score}%</div>
                                    <div>📦 {item.condition}</div>
                                    <div>🚚 {item.delivery_speed}</div>
                                </div>
                                <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                    {item.tags.map((tag, i) => (
                                        <span key={i} style={{ background: "rgba(6, 182, 212, 0.15)", color: "var(--cyan)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginTop: "2rem", padding: "1rem", background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.2)", borderRadius: "8px", fontSize: "0.875rem" }}>
                <strong style={{ color: "var(--cyan)" }}>💡 Note:</strong> This demo fetches from /api/market which requires 0.01 BSA USD payment via x402 protocol.
                Without a wallet configured, you'll see a 402 Payment Required response. Use the Telegram bot to make actual payments!
            </div>
        </div>
    );
}
