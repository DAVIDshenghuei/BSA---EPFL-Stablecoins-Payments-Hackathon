export interface UserProduct {
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

const products: UserProduct[] = [];

export function addUserProduct(product: UserProduct) {
    products.unshift(product);
}

export function getUserProducts(): UserProduct[] {
    return products;
}
