"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { getProducts, getCategories, type Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { useToast } from "../components/ToastProvider";

interface UserProduct {
    id: string;
    title: string;
    price: number;
    category: string;
    description: string;
    image: string;
    imageUrl?: string;
    seller: string;
    location: string;
    listedAt: string;
    source: "bot" | "web";
}

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
    const staticProducts = getProducts();
    const staticCategories = getCategories();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
    const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUserProducts = useCallback(async () => {
        try {
            const res = await fetch("/api/products");
            if (res.ok) {
                const data = await res.json();
                setUserProducts(data.products ?? []);
            }
        } catch {} finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserProducts();
        const interval = setInterval(fetchUserProducts, 8000);
        return () => clearInterval(interval);
    }, [fetchUserProducts]);

    const allProducts: Product[] = useMemo(() => {
        const userAsProducts: Product[] = userProducts.map(up => ({
            id: up.id as any,
            title: up.title,
            price: up.price,
            category: up.category,
            description: up.description,
            image: up.imageUrl ? `🖼️` : up.image,
            _imageUrl: up.imageUrl,
            _seller: up.seller,
            _location: up.location,
            _isUserListed: true,
        } as any));
        return [...userAsProducts, ...staticProducts];
    }, [staticProducts, userProducts]);

    const allCategories = useMemo(() => {
        const cats = new Set([...staticCategories, ...userProducts.map(p => p.category)]);
        return [...cats];
    }, [staticCategories, userProducts]);

    const displayed = useMemo(() => {
        let list = selectedCategory
            ? allProducts.filter(p => p.category === selectedCategory)
            : [...allProducts];
        if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
        if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
        return list;
    }, [allProducts, selectedCategory, sortBy]);

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
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                    {userProducts.length > 0 && (
                        <span style={{
                            fontSize: "0.8rem",
                            color: "var(--primary-light)",
                            background: "rgba(6,182,212,0.1)",
                            padding: "0.35rem 0.75rem",
                            borderRadius: 8,
                            border: "1px solid rgba(6,182,212,0.2)",
                        }}>
                            📤 {userProducts.length} user listed
                        </span>
                    )}
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
                        {allCategories.map(c => (
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
                    {displayed.map(product => {
                        const p = product as any;
                        const isUser = p._isUserListed;
                        const imageUrl = p._imageUrl;

                        return (
                            <div className="product-card" key={product.id} style={isUser ? { borderColor: "rgba(6,182,212,0.3)" } : {}}>
                                {isUser && (
                                    <div style={{
                                        position: "absolute",
                                        top: 10,
                                        right: 10,
                                        background: "rgba(6,182,212,0.9)",
                                        color: "#fff",
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        padding: "0.2rem 0.5rem",
                                        borderRadius: 6,
                                        zIndex: 2,
                                    }}>
                                        USER LISTED
                                    </div>
                                )}
                                <div className="product-image-area">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={product.title}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                borderRadius: 16,
                                            }}
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                        />
                                    ) : (
                                        product.image
                                    )}
                                </div>
                                <div className="product-info">
                                    <div>
                                        <div className="product-name">{product.title}</div>
                                        <div className="product-category">
                                            {product.category}
                                            {isUser && p._seller && (
                                                <span style={{ marginLeft: "0.5rem", color: "var(--primary-light)" }}>
                                                    by {p._seller}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="product-footer">
                                        <span className="price">${product.price.toFixed(2)}</span>
                                        <button className="add-button" onClick={() => handleAdd(product)}>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
