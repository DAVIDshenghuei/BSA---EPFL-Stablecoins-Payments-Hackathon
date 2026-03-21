"use client";
import Link from "next/link";

export default function Page() {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "2rem",
            background: "var(--bg)"
        }}>
            {/* Simple Logo/Badge */}
            <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(6, 182, 212, 0.1)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                color: "var(--cyan)",
                padding: "0.5rem 1.2rem",
                borderRadius: "999px",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "3rem",
                letterSpacing: "0.05em"
            }}>
                🚀 POWERED BY TON BLOCKCHAIN
            </div>

            {/* Main Heading */}
            <h1 style={{
                fontSize: "clamp(3rem, 10vw, 6rem)",
                fontWeight: "900",
                lineHeight: "1.1",
                marginBottom: "3rem",
                letterSpacing: "-0.03em"
            }}>
                Your <span style={{
                    background: "linear-gradient(135deg, var(--blue-light), var(--cyan))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                }}>Wisemanager</span>
            </h1>

            {/* Telegram Button */}
            <a
                href="https://t.me/Wisemanagersbot"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "1rem",
                    background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                    color: "white",
                    padding: "1.25rem 3rem",
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    borderRadius: "16px",
                    textDecoration: "none",
                    border: "none",
                    boxShadow: "0 8px 32px rgba(6, 182, 212, 0.4)",
                    transition: "all 0.3s ease"
                }}
            >
                <span style={{ fontSize: "1.5rem" }}>💬</span>
                Start Chat on Telegram
            </a>

            {/* Optional: Small navigation at bottom */}
            <div style={{
                position: "fixed",
                bottom: "2rem",
                display: "flex",
                gap: "2rem",
                fontSize: "0.9rem"
            }}>
                <Link 
                    href="/marketplace" 
                    style={{
                        color: "var(--muted)",
                        textDecoration: "none",
                        transition: "color 0.2s"
                    }}
                >
                    Marketplace
                </Link>
                <Link 
                    href="/quickstart"
                    style={{
                        color: "var(--muted)",
                        textDecoration: "none",
                        transition: "color 0.2s"
                    }}
                >
                    Quickstart
                </Link>
            </div>
        </div>
    );
}