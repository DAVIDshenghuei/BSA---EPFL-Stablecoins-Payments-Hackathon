"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export interface CartItem {
    id: number | string;
    title: string;
    price: number;
    image?: string;
    quantity: number;
}

export interface Invoice {
    id: string;
    amount: string;
    timestamp: number;
    merchant: string;
    transactionHash: string;
    status: "pending" | "paid";
    items: CartItem[];
}

interface CartContextType {
    invoices: Invoice[];
    addInvoice: (invoice: Invoice) => void;
    updateInvoiceStatus: (id: string, transactionHash: string) => void;
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => void;
    removeFromCart: (id: number | string) => void;
    clearCart: () => void;
    cartTotal: () => number;
    cartCount: () => number;
}

const STORAGE_KEY = "wisemanager_state_v1";
const CartContext = createContext<CartContextType | undefined>(undefined);

function loadState<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed[key] ?? fallback;
    } catch {
        return fallback;
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [invoices, setInvoices] = useState<Invoice[]>(() => loadState("invoices", []));
    const [cart, setCart] = useState<CartItem[]>(() => loadState("cart", []));

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ invoices, cart }));
        } catch {}
    }, [invoices, cart]);

    const addInvoice = useCallback((invoice: Invoice) => {
        setInvoices(prev => [invoice, ...prev]);
    }, []);

    const updateInvoiceStatus = useCallback((id: string, transactionHash: string) => {
        setInvoices(prev =>
            prev.map(inv => inv.id === id ? { ...inv, status: "paid" as const, transactionHash } : inv)
        );
    }, []);

    const addToCart = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
        setCart(prev => {
            const exists = prev.find(p => p.id === item.id);
            if (exists) return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + qty } : p);
            return [{ ...item, quantity: qty }, ...prev];
        });
    }, []);

    const removeFromCart = useCallback((id: number | string) => {
        setCart(prev => prev.filter(p => p.id !== id));
    }, []);

    const clearCart = useCallback(() => setCart([]), []);
    const cartTotal = useCallback(() => cart.reduce((s, it) => s + it.price * it.quantity, 0), [cart]);
    const cartCount = useCallback(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

    return (
        <CartContext.Provider value={{ invoices, addInvoice, updateInvoiceStatus, cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
}
