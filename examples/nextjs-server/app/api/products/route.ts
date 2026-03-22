import { getUserProducts, addUserProduct, type UserProduct } from "../../../lib/product-store";

export function GET() {
    return Response.json({ products: getUserProducts() });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, price, category, description, image, imageUrl, seller, location, source } = body;

        if (!title || !price) {
            return Response.json({ success: false, error: "title and price are required" }, { status: 400 });
        }

        const product: UserProduct = {
            id: `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            title,
            price: parseFloat(price),
            category: category || "other",
            description: description || "",
            image: image || "📦",
            imageUrl: imageUrl || undefined,
            seller: seller || "Anonymous",
            location: location || "Unknown",
            listedAt: new Date().toISOString(),
            source: source || "web",
        };

        addUserProduct(product);

        return Response.json({ success: true, product });
    } catch (err: any) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
    }
}
