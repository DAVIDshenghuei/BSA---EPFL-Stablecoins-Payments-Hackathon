import type { Metadata } from "next";
import { Providers } from "./components/Providers";
import "./globals.css";

export const metadata: Metadata = {
    title: "IntentPay — Smart Marketplace on TON",
    description: "x402 payment protocol on TON blockchain. Marketplace, smart Telegram bot, and micro-payment APIs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}