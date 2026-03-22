"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useToast } from "../components/ToastProvider";

export default function CartPage() {
    const { cart, removeFromCart, clearCart, cartTotal } = useCart();
    const { addToast } = useToast();
    const total = cartTotal();

    function handleRemove(id: number | string, title: string) {
        removeFromCart(id);
        addToast(`Removed "${title}" from cart`);
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
                <div className="cart-total">
                    Total: <span className="gradient-text">${total.toFixed(2)}</span>
                </div>
                <div className="cart-buttons">
                    <button className="clear-button" onClick={() => { clearCart(); addToast("Cart cleared"); }}>
                        Clear Cart
                    </button>
                    <button className="checkout-button" onClick={() => addToast("Checkout via x402 coming soon!")}>
                        Checkout with TON
                    </button>
                </div>
            </div>
        </div>
    );
}
