"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useCart } from "../context/CartContext";

export function Navbar() {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const count = cartCount();

    const linkClass = (path: string) =>
        `nav-link${pathname === path ? " active" : ""}`;

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link href="/" className="logo">
                    <span className="logo-icon">💎</span>
                    Wisemanager
                </Link>

                <div className="nav-links">
                    <Link href="/shop" className={linkClass("/shop")}>
                        Shop
                    </Link>
                    <Link href="/cart" className={linkClass("/cart")}>
                        Cart
                        {count > 0 && <span className="cart-badge">{count}</span>}
                    </Link>
                    <Link href="/dashboard" className={linkClass("/dashboard")}>
                        Dashboard
                    </Link>
                    <a
                        href="https://t.me/Wisemanagersbot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link"
                    >
                        💬 Bot
                    </a>
                </div>

                <div className="wallet-wrapper">
                    <TonConnectButton />
                </div>
            </div>
        </nav>
    );
}
