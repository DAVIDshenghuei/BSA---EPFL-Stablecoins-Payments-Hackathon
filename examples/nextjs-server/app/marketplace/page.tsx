"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function MarketplacePage() {
    const [items, setItems] = useState<MarketItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MarketItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLocation, setSelectedLocation] = useState<string>("all");
    const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
    const [selectedCondition, setSelectedCondition] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("newest");

    // Fetch items on mount
    useEffect(() => {
        fetchItems();
    }, []);

    // Apply filters whenever state changes
    useEffect(() => {
        applyFilters();
    }, [items, searchTerm, selectedLocation, priceRange, selectedCondition, sortBy]);

    const fetchItems = async () => {
        try {
            // Mock data - in production, this would fetch from your API
            const mockItems: MarketItem[] = [
                {
                    item: "MacBook Pro 14\" M3 Pro",
                    price_usd: 1899,
                    seller: "TechStore",
                    trust_score: 98,
                    location: "Lausanne",
                    condition: "New",
                    delivery_speed: "1-2 days",
                    tags: ["laptop", "apple", "m3"]
                },
                {
                    item: "Dell XPS 13 Plus",
                    price_usd: 1299,
                    seller: "CompuWorld",
                    trust_score: 95,
                    location: "Geneva",
                    condition: "Like New",
                    delivery_speed: "2-3 days",
                    tags: ["laptop", "dell", "ultrabook"]
                },
                {
                    item: "iPhone 15 Pro Max 256GB",
                    price_usd: 1199,
                    seller: "MobilePlus",
                    trust_score: 99,
                    location: "Zurich",
                    condition: "New",
                    delivery_speed: "1-2 days",
                    tags: ["phone", "apple", "iphone"]
                },
                {
                    item: "Sony WH-1000XM5 Headphones",
                    price_usd: 349,
                    seller: "AudioHub",
                    trust_score: 97,
                    location: "Lausanne",
                    condition: "New",
                    delivery_speed: "1-2 days",
                    tags: ["headphones", "sony", "wireless"]
                },
                {
                    item: "iPad Air M2 128GB",
                    price_usd: 599,
                    seller: "TechStore",
                    trust_score: 98,
                    location: "Lausanne",
                    condition: "Like New",
                    delivery_speed: "1-2 days",
                    tags: ["tablet", "apple", "ipad"]
                },
                {
                    item: "Samsung Galaxy S24 Ultra",
                    price_usd: 1299,
                    seller: "PhoneZone",
                    trust_score: 96,
                    location: "Geneva",
                    condition: "New",
                    delivery_speed: "2-3 days",
                    tags: ["phone", "samsung", "android"]
                },
                {
                    item: "LG 27\" 4K Monitor",
                    price_usd: 399,
                    seller: "DisplayWorld",
                    trust_score: 94,
                    location: "Zurich",
                    condition: "New",
                    delivery_speed: "3-5 days",
                    tags: ["monitor", "lg", "4k"]
                },
                {
                    item: "Logitech MX Master 3S",
                    price_usd: 99,
                    seller: "PeripheralPro",
                    trust_score: 93,
                    location: "Remote",
                    condition: "New",
                    delivery_speed: "2-4 days",
                    tags: ["mouse", "logitech", "wireless"]
                }
            ];
            
            setItems(mockItems);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch items:", error);
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...items];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.item.toLowerCase().includes(term) ||
                item.tags.some(tag => tag.toLowerCase().includes(term))
            );
        }

        // Location filter
        if (selectedLocation !== "all") {
            filtered = filtered.filter(item => 
                item.location.toLowerCase() === selectedLocation.toLowerCase()
            );
        }

        // Price filter
        filtered = filtered.filter(item =>
            item.price_usd >= priceRange.min && item.price_usd <= priceRange.max
        );

        // Condition filter
        if (selectedCondition !== "all") {
            filtered = filtered.filter(item =>
                item.condition.toLowerCase() === selectedCondition.toLowerCase()
            );
        }

        // Sort
        switch (sortBy) {
            case "price-low":
                filtered.sort((a, b) => a.price_usd - b.price_usd);
                break;
            case "price-high":
                filtered.sort((a, b) => b.price_usd - a.price_usd);
                break;
            case "trust":
                filtered.sort((a, b) => b.trust_score - a.trust_score);
                break;
            default:
                // newest - keep original order
                break;
        }

        setFilteredItems(filtered);
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedLocation("all");
        setPriceRange({ min: 0, max: 2000 });
        setSelectedCondition("all");
        setSortBy("newest");
    };

    const locations = ["all", "Lausanne", "Geneva", "Zurich", "Remote"];
    const conditions = ["all", "New", "Like New", "Used"];

    return (
        <div className="marketplace-container">
            {/* Header */}
            <nav className="marketplace-nav">
                <Link href="/" className="nav-logo" style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                    🛍️ <span style={{ marginLeft: "0.5rem" }}>Marketplace</span>
                </Link>
                <div className="nav-links">
                    <Link href="/" className="nav-link">Home</Link>
                    <Link href="/marketplace" className="nav-link active">Marketplace</Link>
                    <button className="btn btn-wallet" disabled>
                        Connect Wallet
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="marketplace-hero">
                <div className="marketplace-hero-content">
                    <div className="badge">🛍️ Powered by TON x402</div>
                    <h1>
                        Discover Amazing Deals<br />
                        <span className="gradient">Pay with Crypto</span>
                    </h1>
                    <p>
                        Browse premium tech products. Every transaction is secured by TON blockchain.
                        Pay with BSA USD and get instant access to seller information.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <div className="marketplace-main">
                {/* Sidebar Filters */}
                <aside className="marketplace-sidebar">
                    <div className="filter-section">
                        <div className="filter-header">
                            <h3>🔍 Filters</h3>
                            <button className="filter-reset" onClick={resetFilters}>
                                Reset
                            </button>
                        </div>

                        {/* Search */}
                        <div className="filter-group">
                            <label>Search</label>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="MacBook, iPhone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Location */}
                        <div className="filter-group">
                            <label>📍 Location</label>
                            <select
                                className="filter-select"
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>
                                        {loc === "all" ? "All Locations" : loc}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="filter-group">
                            <label>💰 Price Range</label>
                            <div className="price-range-vertical">
                                <input
                                    type="number"
                                    className="filter-input"
                                    placeholder="Min Price"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({
                                        ...priceRange,
                                        min: Number(e.target.value)
                                    })}
                                />
                                <input
                                    type="number"
                                    className="filter-input"
                                    placeholder="Max Price"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({
                                        ...priceRange,
                                        max: Number(e.target.value)
                                    })}
                                />
                            </div>
                        </div>

                        {/* Condition */}
                        <div className="filter-group">
                            <label>📦 Condition</label>
                            <select
                                className="filter-select"
                                value={selectedCondition}
                                onChange={(e) => setSelectedCondition(e.target.value)}
                            >
                                {conditions.map(cond => (
                                    <option key={cond} value={cond}>
                                        {cond === "all" ? "All Conditions" : cond}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Info Box */}
                        <div className="filter-info">
                            <div className="filter-info-icon">💡</div>
                            <div className="filter-info-text">
                                <strong>Tip:</strong> Use our Telegram bot to browse and pay instantly!
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Products Grid */}
                <main className="marketplace-content">
                    {/* Toolbar */}
                    <div className="marketplace-toolbar">
                        <div className="toolbar-left">
                            <span className="results-count">
                                {loading ? "Loading..." : `${filteredItems.length} items found`}
                            </span>
                        </div>
                        <div className="toolbar-right">
                            <label>Sort by:</label>
                            <select
                                className="sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="trust">Highest Trust Score</option>
                            </select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading products...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>No items found</h3>
                            <p>Try adjusting your filters or search terms</p>
                            <button className="btn btn-primary" onClick={resetFilters}>
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredItems.map((item, index) => (
                                <div key={index} className="product-card">
                                    <div className="product-image">
                                        <div className="product-image-placeholder">
                                            <span>📱</span>
                                        </div>
                                        <div className="product-badge">{item.condition}</div>
                                    </div>
                                    <div className="product-content">
                                        <h3 className="product-title">{item.item}</h3>
                                        <div className="product-price">
                                            ${item.price_usd.toLocaleString()}
                                        </div>
                                        <div className="product-meta">
                                            <div className="product-seller">
                                                <span className="seller-icon">🏪</span>
                                                {item.seller}
                                                <span className="trust-badge">⭐ {item.trust_score}%</span>
                                            </div>
                                            <div className="product-location">
                                                <span>📍</span> {item.location}
                                            </div>
                                            <div className="product-delivery">
                                                <span>🚚</span> {item.delivery_speed}
                                            </div>
                                        </div>
                                        <div className="product-tags">
                                            {item.tags.map((tag, i) => (
                                                <span key={i} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                        <button className="btn-product">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
