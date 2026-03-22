"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { Invoice } from "../context/CartContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
    invoices: Invoice[];
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SpendingChart({ invoices }: Props) {
    const byMonth = new Array(12).fill(0);
    invoices.forEach(inv => {
        const m = new Date(inv.timestamp).getMonth();
        byMonth[m] += parseFloat(inv.amount || "0");
    });

    const hasData = byMonth.some(v => v > 0);

    const data = {
        labels: MONTH_LABELS,
        datasets: [
            {
                label: "Spent ($)",
                data: hasData ? byMonth : [40, 55, 30, 70, 45, 60, 80, 50, 65, 35, 75, 90],
                backgroundColor: "rgba(6, 182, 212, 0.5)",
                borderColor: "rgba(6, 182, 212, 1)",
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    return (
        <>
            {!hasData && (
                <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                    Sample data shown. Actual data will appear after purchases.
                </p>
            )}
            <Bar
                data={data}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: "#94a3b8" } },
                    },
                    scales: {
                        x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.04)" } },
                        y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.04)" } },
                    },
                }}
            />
        </>
    );
}
