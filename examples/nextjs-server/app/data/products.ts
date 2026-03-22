export interface Product {
    id: number;
    title: string;
    price: number;
    category: string;
    description: string;
    image: string;
}

const EMOJI_MAP: Record<string, string> = {
    electronics: "💻",
    jewelery: "💍",
    "men's clothing": "👔",
    "women's clothing": "👗",
};

const PRODUCTS: Product[] = [
    {
        id: 1,
        title: "MacBook Pro 14\"",
        price: 1299,
        category: "electronics",
        description: "Apple M3 chip, 18GB RAM, 512GB SSD, Liquid Retina XDR display.",
        image: "💻",
    },
    {
        id: 2,
        title: "Wireless Noise-Cancelling Headphones",
        price: 249,
        category: "electronics",
        description: "40h battery life, ANC, Hi-Res Audio, comfortable over-ear design.",
        image: "🎧",
    },
    {
        id: 3,
        title: "Slim Fit Premium Jacket",
        price: 89,
        category: "men's clothing",
        description: "Water-resistant, lightweight, modern fit for everyday wear.",
        image: "🧥",
    },
    {
        id: 4,
        title: "Gold Chain Necklace",
        price: 320,
        category: "jewelery",
        description: "18K gold-plated, 20-inch chain, hypoallergenic, polished finish.",
        image: "📿",
    },
    {
        id: 5,
        title: "Mechanical Keyboard RGB",
        price: 129,
        category: "electronics",
        description: "Hot-swappable switches, per-key RGB, aluminum frame, PBT keycaps.",
        image: "⌨️",
    },
    {
        id: 6,
        title: "Summer Floral Dress",
        price: 59,
        category: "women's clothing",
        description: "Breathable cotton-blend, midi length, floral pattern, relaxed fit.",
        image: "👗",
    },
    {
        id: 7,
        title: "4K Ultra HD Monitor 27\"",
        price: 449,
        category: "electronics",
        description: "IPS panel, HDR400, 60Hz, USB-C PD 65W, height-adjustable stand.",
        image: "🖥️",
    },
    {
        id: 8,
        title: "Leather Crossbody Bag",
        price: 75,
        category: "women's clothing",
        description: "Genuine leather, adjustable strap, multiple compartments.",
        image: "👜",
    },
    {
        id: 9,
        title: "Smart Watch Series 5",
        price: 199,
        category: "electronics",
        description: "Health tracking, GPS, 3-day battery, always-on AMOLED display.",
        image: "⌚",
    },
    {
        id: 10,
        title: "Diamond Stud Earrings",
        price: 550,
        category: "jewelery",
        description: "0.5 carat total, VS clarity, 14K white gold setting.",
        image: "💎",
    },
    {
        id: 11,
        title: "Classic Oxford Shirt",
        price: 45,
        category: "men's clothing",
        description: "100% cotton, button-down collar, slim fit, machine washable.",
        image: "👔",
    },
    {
        id: 12,
        title: "Portable Bluetooth Speaker",
        price: 79,
        category: "electronics",
        description: "IP67 waterproof, 24h playtime, 360° sound, compact design.",
        image: "🔊",
    },
];

export function getProducts(): Product[] {
    return PRODUCTS;
}

export function getProductById(id: number): Product | undefined {
    return PRODUCTS.find(p => p.id === id);
}

export function getCategories(): string[] {
    return [...new Set(PRODUCTS.map(p => p.category))];
}

export function getCategoryEmoji(category: string): string {
    return EMOJI_MAP[category] ?? "🛍️";
}
