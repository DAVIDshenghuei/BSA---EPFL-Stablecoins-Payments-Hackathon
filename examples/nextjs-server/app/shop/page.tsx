"use client";

import { useState, useMemo } from "react";
import { getProducts, getCategories, type Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { useToast } from "../components/ToastProvider";

function SkeletonCard() {
    return (
        <div className="product-card skeleton">
            <div className="skel-img" />
            <div className="product-info">
                <div className="skel-line" />
                <div className="skel-line short" />
            </div>
        </div>
    );
}

export default function ShopPage() {
    const products = getProducts();
    const categories = getCategories();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
    const [loading] = useState(false);

    const displayed = useMemo(() => {
        let list = selectedCategory
            ? products.filter(p => p.category === selectedCategory)
            : [...products];
        if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
        if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
        return list;
    }, [products, selectedCategory, sortBy]);

    function handleAdd(product: Product) {
        addToCart({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
        });
        addToast(`Added "${product.title}" to cart`);
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Shop</h1>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <select
                        value={selectedCategory ?? ""}
                        onChange={e => setSelectedCategory(e.target.value || null)}
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 10,
                            padding: "0.5rem 1rem",
                            fontSize: "0.9rem",
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 10,
                            padding: "0.5rem 1rem",
                            fontSize: "0.9rem",
                        }}
                    >
                        <option value="default">Default</option>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid">
                    {displayed.map(product => (
                        <div className="product-card" key={product.id}>
                            <div className="product-image-area">
                                {product.image}
                            </div>
                            <div className="product-info">
                                <div>
                                    <div className="product-name">{product.title}</div>
                                    <div className="product-category">{product.category}</div>
                                </div>
                                <div className="product-footer">
                                    <span className="price">${product.price.toFixed(2)}</span>
                                    <button className="add-button" onClick={() => handleAdd(product)}>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
