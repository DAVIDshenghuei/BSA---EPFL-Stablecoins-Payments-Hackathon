"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { CartProvider } from "../context/CartContext";
import { ToastProvider } from "./ToastProvider";
import { Navbar } from "./Navbar";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/DAVIDshenghuei/BSA---EPFL-Stablecoins-Payments-Hackathon/main/tonconnect-manifest.json">
            <CartProvider>
                <ToastProvider>
                    <Navbar />
                    {children}
                </ToastProvider>
            </CartProvider>
        </TonConnectUIProvider>
    );
}
