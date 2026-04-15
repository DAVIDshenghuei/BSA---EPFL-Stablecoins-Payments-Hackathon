"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useToast } from "../components/ToastProvider";

export default function CartPage() {
    const { cart, removeFromCart, clearCart, cartTotal, addInvoice } = useCart();
    const { addToast } = useToast();
    const total = cartTotal();
    const [paying, setPaying] = useState(false);

    function handleRemove(id: number | string, title: string) {
        removeFromCart(id);
        addToast(`Removed "${title}" from cart`);
    }

    async function handleCheckout() {
        if (paying) return;
        setPaying(true);
        addToast("Processing x402 payment (0.1 TON)...");

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cart.map(i => ({
                        id: i.id,
                        title: i.title,
                        price: i.price,
                        quantity: i.quantity,
                        seller: i.seller || "Wisemanager Shop",
                    })),
                }),
            });

            const result = await res.json();

            if (result.success) {
                const sellers = [...new Set(cart.map(i => i.seller || "Wisemanager Shop"))];
                addInvoice({
                    id: `inv-${Date.now()}`,
                    amount: total.toFixed(2),
                    timestamp: Date.now(),
                    merchant: sellers.join(", "),
                    transactionHash: result.txHash || "",
                    status: result.txHash ? "paid" : "pending",
                    items: [...cart],
                });
                clearCart();
                addToast(`Payment confirmed! TX: ${result.txHash?.slice(0, 12) ?? "pending"}...`);
            } else {
                addToast(`Payment failed: ${result.error}`);
            }
        } catch (err: any) {
            addToast(`Error: ${err.message || String(err)}`);
        } finally {
            setPaying(false);
        }
    }

    if (cart.length === 0) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-state-icon">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p style={{ marginBottom: "1.5rem" }}>Start shopping to add items here.</p>
                    <Link href="/shop" className="primary-button">
                        Browse Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1 className="page-title" style={{ marginBottom: "2rem" }}>Your Cart</h1>

            <div className="cart-list">
                {cart.map(item => (
                    <div key={item.id} className="cart-item">
                        <div className="cart-item-image">{item.image ?? "📦"}</div>

                        <div className="cart-info">
                            <div className="cart-title">{item.title}</div>
                            <div className="cart-meta">
                                Qty: {item.quantity} &middot; ${item.price.toFixed(2)} each
                            </div>
                        </div>

                        <div className="cart-actions">
                            <div className="cart-price">${(item.price * item.quantity).toFixed(2)}</div>
                            <button className="remove-button" onClick={() => handleRemove(item.id, item.title)}>
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cart-summary">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                    <div className="cart-total">
                        Total: <span className="gradient-text">${total.toFixed(2)}</span>
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        x402 Payment: 0.1 TON
                    </div>
                </div>
                <div className="cart-buttons">
                    <button className="clear-button" onClick={() => { clearCart(); addToast("Cart cleared"); }}>
                        Clear Cart
                    </button>
                    <button
                        className="checkout-button"
                        onClick={handleCheckout}
                        disabled={paying}
                        style={paying ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                    >
                        {paying ? "⏳ Processing..." : "Checkout with TON"}
                    </button>
                </div>
            </div>
        </div>
    );
}
