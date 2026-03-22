import { x402Fetch } from "@ton-x402/client";
import { nanoToTon } from "@ton-x402/core";
import { TonClient } from "@ton/ton";
import { WalletContractV5R1 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { Agent, setGlobalDispatcher } from "undici";

setGlobalDispatcher(new Agent({ maxResponseSize: 65536 }));

const TELEGRAM_BOT_TOKEN = "8449323987:AAGVDiNtLTdyb7W-ZMpoq4NO4JZtwtV6u-E";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface TelegramUpdate {
    update_id: number;
    message?: {
        message_id: number;
        chat: {
            id: number;
            type: string;
        };
        from?: {
            id: number;
            first_name: string;
            username?: string;
        };
        text?: string;
        caption?: string;
        photo?: { file_id: string; width: number; height: number }[];
        date: number;
    };
}

interface TelegramResponse {
    ok: boolean;
    result: any;
}

// Send message to Telegram
async function sendMessage(chatId: number, text: string, parseMode: string = "Markdown") {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: parseMode,
        }),
    });
    
    const data = await response.json();
    if (!data.ok) {
        console.error("❌ Failed to send message:", data);
    }
    return data;
}

// Get weather data (trigger payment flow)
async function getWeatherData() {
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        throw new Error("❌ Set WALLET_MNEMONIC env var (24-word mnemonic)");
    }

    const rpcUrl = process.env.TON_RPC_URL ?? "https://testnet.toncenter.com/api/v2/jsonRPC";
    const resourceUrl = process.env.RESOURCE_URL ?? "http://localhost:3000/api/weather";

    const keypair = await mnemonicToPrivateKey(mnemonic.split(" "));
    const wallet = WalletContractV5R1.create({
        publicKey: keypair.publicKey,
        workchain: 0,
    });

    const client = new TonClient({
        endpoint: rpcUrl,
        apiKey: process.env.RPC_API_KEY,
    });
    const walletContract = client.open(wallet);

    const balance = await client.getBalance(wallet.address);
    const seqno = await walletContract.getSeqno();

    console.log(`💳 Wallet: ${wallet.address.toString({ bounceable: false })}`);
    console.log(`💰 Balance: ${nanoToTon(balance.toString())} TON`);
    console.log(`🔢 Seqno: ${seqno}`);

    // Execute x402 payment flow
    const result = await x402Fetch(resourceUrl, {
        wallet,
        keypair,
        seqno,
        client,
        verbose: false,
    });

    if (result.response.ok) {
        const data = await result.response.json();
        return {
            success: true,
            data,
            settlement: result.settlement,
        };
    } else {
        const text = await result.response.text();
        return {
            success: false,
            error: text,
            paid: result.paid,
        };
    }
}

// Format weather data as Telegram message
function formatWeatherMessage(data: any, settlement?: any): string {
    let message = "🌤️ **Weather Data**\n\n";
    message += `📍 **Location**: ${data.location}\n`;
    message += `🌡️ **Temperature**: ${data.temperature}°${data.unit === "celsius" ? "C" : "F"}\n`;
    message += `☁️ **Conditions**: ${data.conditions}\n`;
    message += `💧 **Humidity**: ${data.humidity}%\n`;
    message += `🕐 **Time**: ${new Date(data.timestamp).toLocaleString()}\n`;
    
    if (settlement?.txHash) {
        message += `\n✅ **Payment Confirmed**\n`;
        message += `🔗 **Transaction Hash**: \`${settlement.txHash}\`\n`;
        message += `🌐 **Network**: ${settlement.network}\n`;
    }
    
    return message;
}

// Format marketplace data as Telegram message
function formatMarketplaceMessage(data: any, settlement?: any): string {
    let message = "🛍️ Marketplace Items\n\n";
    
    // Show filters if applied - escape special characters for Telegram
    if (data.filters_applied && (data.filters_applied.name || data.filters_applied.price || data.filters_applied.location)) {
        message += "🔍 Filters Applied:\n";
        if (data.filters_applied.name) message += `  • Name: ${data.filters_applied.name}\n`;
        if (data.filters_applied.price) message += `  • Price: $${data.filters_applied.price}\n`;
        if (data.filters_applied.location) message += `  • Location: ${data.filters_applied.location}\n`;
        message += "\n";
    }
    
    message += `📊 Total Items: ${data.total_items}\n\n`;
    
    if (data.total_items === 0) {
        message += "❌ No items found matching your filters.\n\n";
        message += "💡 Try different filters or use 'market' to see all items.";
    } else {
        data.items.forEach((item: any, index: number) => {
            message += `${index + 1}. ${item.item}\n`;
            message += `💰 Price: $${item.price_usd}\n`;
            message += `🏪 Seller: ${item.seller} (⭐ ${item.trust_score}%)\n`;
            message += `📍 Location: ${item.location}\n`;
            message += `📦 Condition: ${item.condition}\n`;
            message += `🚚 Delivery: ${item.delivery_speed}\n`;
            message += `🏷️ Tags: ${item.tags.join(", ")}\n\n`;
        });
    }
    
    if (settlement?.txHash) {
        message += `✅ Payment Confirmed\n`;
        message += `🔗 TX Hash: ${settlement.txHash}\n`;
        message += `🌐 Network: ${settlement.network}\n`;
    }
    
    return message;
}

// Get marketplace data (trigger payment flow)
async function getMarketplaceData(filters?: { name?: string; price?: string; location?: string }) {
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        throw new Error("❌ Set WALLET_MNEMONIC env var (24-word mnemonic)");
    }

    const rpcUrl = process.env.TON_RPC_URL ?? "https://testnet.toncenter.com/api/v2/jsonRPC";
    
    // Build URL with query parameters
    let resourceUrl = "http://localhost:3000/api/market";
    const params = new URLSearchParams();
    
    if (filters?.name) params.append('name', filters.name);
    if (filters?.price) params.append('price', filters.price);
    if (filters?.location) params.append('location', filters.location);
    
    if (params.toString()) {
        resourceUrl += `?${params.toString()}`;
    }

    const keypair = await mnemonicToPrivateKey(mnemonic.split(" "));
    const wallet = WalletContractV5R1.create({
        publicKey: keypair.publicKey,
        workchain: 0,
    });

    const client = new TonClient({
        endpoint: rpcUrl,
        apiKey: process.env.RPC_API_KEY,
    });
    const walletContract = client.open(wallet);

    const balance = await client.getBalance(wallet.address);
    const seqno = await walletContract.getSeqno();

    console.log(`💳 Wallet: ${wallet.address.toString({ bounceable: false })}`);
    console.log(`💰 Balance: ${nanoToTon(balance.toString())} TON`);
    console.log(`🔢 Seqno: ${seqno}`);
    if (filters && Object.keys(filters).length > 0) {
        console.log(`🔍 Filters: ${JSON.stringify(filters)}`);
    }

    // Execute x402 payment flow
    const result = await x402Fetch(resourceUrl, {
        wallet,
        keypair,
        seqno,
        client,
        verbose: false,
    });

    if (result.response.ok) {
        const data = await result.response.json();
        return {
            success: true,
            data,
            settlement: result.settlement,
        };
    } else {
        const text = await result.response.text();
        return {
            success: false,
            error: text,
            paid: result.paid,
        };
    }
}

// Per-chat session: stores last market search results for the "buy" combo
const chatSessions = new Map<number, { items: any[]; timestamp: number }>();

const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

function setSession(chatId: number, items: any[]) {
    chatSessions.set(chatId, { items, timestamp: Date.now() });
}

function getSession(chatId: number): any[] | null {
    const session = chatSessions.get(chatId);
    if (!session) return null;
    if (Date.now() - session.timestamp > SESSION_TTL_MS) {
        chatSessions.delete(chatId);
        return null;
    }
    return session.items;
}

// Buy an item via x402 payment (0.1 TON)
async function buyItem(item: any, buyerName: string = "Bot User") {
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        throw new Error("❌ Set WALLET_MNEMONIC env var (24-word mnemonic)");
    }

    const rpcUrl = process.env.TON_RPC_URL ?? "https://testnet.toncenter.com/api/v2/jsonRPC";

    const params = new URLSearchParams({
        item: item.item,
        price: String(item.price_usd),
        seller: item.seller,
        location: item.location,
        buyer: buyerName,
    });
    const resourceUrl = `http://localhost:3000/api/buy?${params.toString()}`;

    const keypair = await mnemonicToPrivateKey(mnemonic.split(" "));
    const wallet = WalletContractV5R1.create({
        publicKey: keypair.publicKey,
        workchain: 0,
    });

    const client = new TonClient({
        endpoint: rpcUrl,
        apiKey: process.env.RPC_API_KEY,
    });
    const walletContract = client.open(wallet);

    const balance = await client.getBalance(wallet.address);
    const seqno = await walletContract.getSeqno();

    console.log(`🛒 Buying: ${item.item}`);
    console.log(`💳 Wallet: ${wallet.address.toString({ bounceable: false })}`);
    console.log(`💰 Balance: ${nanoToTon(balance.toString())} TON`);

    const result = await x402Fetch(resourceUrl, {
        wallet,
        keypair,
        seqno,
        client,
        verbose: false,
    });

    if (result.response.ok) {
        const data = await result.response.json();
        return { success: true, data, settlement: result.settlement };
    } else {
        const text = await result.response.text();
        return { success: false, error: text, paid: result.paid };
    }
}

function formatReceipt(receipt: any, settlement?: any): string {
    let msg = "🧾 PURCHASE RECEIPT\n";
    msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
    msg += `📋 Receipt ID: ${receipt.id}\n`;
    msg += `🛍️ Item: ${receipt.item}\n`;
    msg += `💵 Item Price: $${receipt.item_price_usd}\n`;
    msg += `🏪 Seller: ${receipt.seller}\n`;
    msg += `📍 Location: ${receipt.location}\n\n`;
    msg += "━━━━━━━━━━━━━━━━━━━━\n";
    msg += `💎 Payment: ${receipt.payment_amount}\n`;
    msg += `🔗 Protocol: ${receipt.payment_protocol}\n`;
    msg += `✅ Status: ${receipt.status.toUpperCase()}\n`;
    msg += `🕐 Time: ${new Date(receipt.timestamp).toLocaleString()}\n`;

    if (settlement?.txHash) {
        msg += `\n🔗 TX Hash: ${settlement.txHash}\n`;
        msg += `🌐 Network: ${settlement.network}\n`;
    }

    msg += "\n━━━━━━━━━━━━━━━━━━━━\n";
    msg += "Thank you for your purchase!";
    return msg;
}

// ── Sell flow: multi-step conversation state machine ──

type SellStep = "photo" | "name" | "price" | "category" | "location" | "description" | "confirm";

interface SellDraft {
    step: SellStep;
    photoFileId?: string;
    photoUrl?: string;
    name?: string;
    price?: number;
    category?: string;
    location?: string;
    description?: string;
    seller: string;
}

const sellSessions = new Map<number, SellDraft>();

const CATEGORY_OPTIONS = ["electronics", "men's clothing", "women's clothing", "jewelery", "services", "other"];

async function getPhotoUrl(fileId: string): Promise<string> {
    const res = await fetch(`${TELEGRAM_API_URL}/getFile?file_id=${fileId}`);
    const data = await res.json();
    if (data.ok) {
        return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${data.result.file_path}`;
    }
    return "";
}

async function payListingFee(): Promise<{ success: boolean; txHash?: string; error?: string }> {
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) throw new Error("WALLET_MNEMONIC not set");

    const rpcUrl = process.env.TON_RPC_URL ?? "https://testnet.toncenter.com/api/v2/jsonRPC";
    const resourceUrl = "http://localhost:3000/api/sell";

    const keypair = await mnemonicToPrivateKey(mnemonic.split(" "));
    const wallet = WalletContractV5R1.create({ publicKey: keypair.publicKey, workchain: 0 });
    const client = new TonClient({ endpoint: rpcUrl, apiKey: process.env.RPC_API_KEY });
    const walletContract = client.open(wallet);

    const balance = await client.getBalance(wallet.address);
    const seqno = await walletContract.getSeqno();

    console.log(`📤 Sell listing fee — Balance: ${nanoToTon(balance.toString())} TON`);

    const result = await x402Fetch(resourceUrl, { wallet, keypair, seqno, client, verbose: false });

    if (result.response.ok) {
        return { success: true, txHash: result.settlement?.txHash };
    } else {
        const text = await result.response.text();
        return { success: false, error: text };
    }
}

async function publishProduct(draft: SellDraft): Promise<boolean> {
    try {
        const res = await fetch("http://localhost:3000/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: draft.name,
                price: draft.price,
                category: draft.category,
                description: draft.description,
                image: "📦",
                imageUrl: draft.photoUrl,
                seller: draft.seller,
                location: draft.location,
                source: "bot",
            }),
        });
        const data = await res.json();
        return data.success === true;
    } catch (err) {
        console.error("❌ Failed to publish product:", err);
        return false;
    }
}

function formatDraftPreview(draft: SellDraft): string {
    let msg = "📋 LISTING PREVIEW\n";
    msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
    msg += `🛍️ Name: ${draft.name}\n`;
    msg += `💰 Price: $${draft.price}\n`;
    msg += `📂 Category: ${draft.category}\n`;
    msg += `📍 Location: ${draft.location}\n`;
    msg += `📝 Description: ${draft.description}\n`;
    msg += draft.photoUrl ? `📸 Photo: attached\n` : `📸 Photo: none\n`;
    msg += `🏪 Seller: ${draft.seller}\n\n`;
    msg += "━━━━━━━━━━━━━━━━━━━━\n";
    msg += `💎 Listing fee: 0.1 TON (x402)\n\n`;
    msg += `Type "yes" to confirm and pay, or "cancel" to abort.`;
    return msg;
}

// Store processed message IDs to prevent duplicate processing
const processedMessages = new Set<string>();

// Handle Telegram updates
async function handleUpdate(update: TelegramUpdate) {
    if (!update.message) return;

    const chatId = update.message.chat.id;
    const messageId = update.message.message_id;
    const text = (update.message.text ?? update.message.caption ?? "").toLowerCase().trim();
    const rawText = update.message.text ?? update.message.caption ?? "";
    const username = update.message.from?.first_name || "User";
    const hasPhoto = !!update.message.photo && update.message.photo.length > 0;

    // Skip messages with neither text nor photo
    if (!text && !hasPhoto) return;

    // Dedup
    const uniqueMessageId = `${chatId}_${messageId}`;
    if (processedMessages.has(uniqueMessageId)) return;
    processedMessages.add(uniqueMessageId);
    if (processedMessages.size > 100) {
        const firstItem = processedMessages.values().next().value;
        processedMessages.delete(firstItem);
    }

    console.log(`📨 Received: "${text || "(photo)"}" from ${username} (${chatId})`);

    // ── Sell session handler (multi-step) ──
    const sellDraft = sellSessions.get(chatId);
    if (sellDraft) {
        // Cancel at any step
        if (text === "cancel" || text === "/cancel") {
            sellSessions.delete(chatId);
            await sendMessage(chatId, "❌ Listing cancelled.");
            return;
        }

        switch (sellDraft.step) {
            case "photo": {
                if (hasPhoto) {
                    const photos = update.message.photo!;
                    const largest = photos[photos.length - 1];
                    sellDraft.photoFileId = largest.file_id;
                    sellDraft.photoUrl = await getPhotoUrl(largest.file_id);
                    sellDraft.step = "name";
                    await sendMessage(chatId, "📸 Photo received!\n\nStep 2/6: What is the product name?");
                } else if (text === "skip") {
                    sellDraft.step = "name";
                    await sendMessage(chatId, "⏭️ Skipped photo.\n\nStep 2/6: What is the product name?");
                } else {
                    await sendMessage(chatId, "📸 Please send a product photo, or type \"skip\" to continue without one.");
                }
                return;
            }
            case "name": {
                if (!rawText.trim()) { await sendMessage(chatId, "Please enter a product name."); return; }
                sellDraft.name = rawText.trim();
                sellDraft.step = "price";
                await sendMessage(chatId, `✅ Name: ${sellDraft.name}\n\nStep 3/6: What is the price (USD)?\nExample: 99.99`);
                return;
            }
            case "price": {
                const price = parseFloat(rawText.replace(/[^0-9.]/g, ""));
                if (isNaN(price) || price <= 0) { await sendMessage(chatId, "❌ Please enter a valid price number.\nExample: 49.99"); return; }
                sellDraft.price = price;
                sellDraft.step = "category";
                const catList = CATEGORY_OPTIONS.map((c, i) => `  ${i + 1}. ${c}`).join("\n");
                await sendMessage(chatId, `✅ Price: $${price}\n\nStep 4/6: Choose a category (type number or name):\n${catList}`);
                return;
            }
            case "category": {
                const num = parseInt(rawText);
                let cat: string;
                if (num >= 1 && num <= CATEGORY_OPTIONS.length) {
                    cat = CATEGORY_OPTIONS[num - 1];
                } else {
                    const match = CATEGORY_OPTIONS.find(c => c.toLowerCase().includes(text));
                    cat = match || rawText.trim();
                }
                sellDraft.category = cat;
                sellDraft.step = "location";
                await sendMessage(chatId, `✅ Category: ${cat}\n\nStep 5/6: Where is the item located?\nExample: Lausanne, Zurich, Remote`);
                return;
            }
            case "location": {
                if (!rawText.trim()) { await sendMessage(chatId, "Please enter a location."); return; }
                sellDraft.location = rawText.trim();
                sellDraft.step = "description";
                await sendMessage(chatId, `✅ Location: ${sellDraft.location}\n\nStep 6/6: Add a short description.\nExample: Brand new, sealed in box`);
                return;
            }
            case "description": {
                sellDraft.description = rawText.trim() || "No description";
                sellDraft.step = "confirm";
                const preview = formatDraftPreview(sellDraft);
                await sendMessage(chatId, preview);
                return;
            }
            case "confirm": {
                if (text === "yes" || text === "y") {
                    await sendMessage(chatId, "⏳ Processing listing fee (0.1 TON via x402)...");
                    try {
                        const payment = await payListingFee();
                        if (payment.success) {
                            const published = await publishProduct(sellDraft);
                            sellSessions.delete(chatId);
                            if (published) {
                                let msg = "✅ PRODUCT LISTED!\n";
                                msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
                                msg += `🛍️ ${sellDraft.name}\n`;
                                msg += `💰 $${sellDraft.price}\n`;
                                msg += `📂 ${sellDraft.category}\n`;
                                msg += `📍 ${sellDraft.location}\n\n`;
                                msg += `Your item is now live on the Shop!\n`;
                                msg += `🌐 http://localhost:3000/shop\n`;
                                if (payment.txHash) msg += `\n🔗 TX: ${payment.txHash}`;
                                await sendMessage(chatId, msg);
                            } else {
                                await sendMessage(chatId, "⚠️ Payment succeeded but publishing failed. Please try again.");
                            }
                        } else {
                            sellSessions.delete(chatId);
                            await sendMessage(chatId, `❌ Payment failed: ${payment.error}\n\nListing cancelled.`);
                        }
                    } catch (err: any) {
                        sellSessions.delete(chatId);
                        await sendMessage(chatId, `❌ Error: ${err.message}`);
                    }
                } else {
                    sellSessions.delete(chatId);
                    await sendMessage(chatId, "❌ Listing cancelled.");
                }
                return;
            }
        }
        return;
    }

    // ── Regular commands ──

    if (text === "sell" || text === "/sell") {
        sellSessions.set(chatId, { step: "photo", seller: username });
        await sendMessage(chatId,
            "📤 SELL AN ITEM\n" +
            "━━━━━━━━━━━━━━━━━━━━\n\n" +
            "I'll guide you through listing your product.\n" +
            "Listing fee: 0.1 TON (x402)\n\n" +
            "Step 1/6: Send a product photo\n" +
            "(or type \"skip\" to continue without one)\n\n" +
            "Type \"cancel\" at any time to abort."
        );
        return;
    }

    if (text === "weather" || text === "/weather") {
        // Send processing message
        await sendMessage(chatId, "⏳ Fetching weather data and processing payment...\nPlease wait...");

        try {
            const result = await getWeatherData();

            if (result.success) {
                const message = formatWeatherMessage(result.data, result.settlement);
                await sendMessage(chatId, message);
                console.log("✅ Weather data sent successfully");
            } else {
                let errorMessage = "❌ **Payment Failed**\n\n";
                if (result.paid) {
                    errorMessage += "⚠️ Payment broadcasted but settlement failed (transaction may still confirm on-chain)\n\n";
                }
                errorMessage += `Error: ${result.error}`;
                await sendMessage(chatId, errorMessage);
                console.error("❌ Payment failed:", result.error);
            }
        } catch (error: any) {
            const errorMessage = `❌ **Error**\n\n${error.message || String(error)}`;
            await sendMessage(chatId, errorMessage);
            console.error("❌ Processing error:", error);
        }
    } else if (text.toLowerCase().startsWith("market")) {
        // Parse filters from natural language command
        // Formats: 
        // - market
        // - market MacBook
        // - market price 500-700
        // - market in Lausanne
        // - market MacBook price 600-700 in Lausanne
        const filters: { name?: string; price?: string; location?: string } = {};
        
        // Remove "market" prefix and trim
        const filterText = text.toLowerCase().replace(/^\/market|^market/i, '').trim();
        
        if (filterText) {
            // Extract price filter (price 500-700, $500-$700, 500-700)
            const priceMatch = filterText.match(/(?:price\s+)?(\$?\d+\s*-\s*\$?\d+)/i);
            if (priceMatch) {
                filters.price = priceMatch[1].replace(/\$/g, '').replace(/\s/g, '');
            }
            
            // Extract location filter (in Lausanne, location Zurich, etc.)
            const locationMatch = filterText.match(/(?:in|location|at)\s+(\w+)/i);
            if (locationMatch) {
                filters.location = locationMatch[1];
            }
            
            // Extract name filter (everything else that's not price or location)
            let nameText = filterText;
            // Remove price part
            if (priceMatch) {
                nameText = nameText.replace(priceMatch[0], '').trim();
            }
            // Remove location part
            if (locationMatch) {
                nameText = nameText.replace(locationMatch[0], '').trim();
            }
            // Remove common filter keywords
            nameText = nameText.replace(/\b(price|in|location|at)\b/gi, '').trim();
            
            if (nameText) {
                filters.name = nameText;
            }
        }
        
        // Send processing message
        const filterDesc = Object.keys(filters).length > 0 
            ? ` with filters` 
            : '';
        await sendMessage(chatId, `⏳ Fetching marketplace data${filterDesc}...\nPlease wait...`);

        try {
            const result = await getMarketplaceData(Object.keys(filters).length > 0 ? filters : undefined);

            if (result.success) {
                // Save results to session for the "buy" combo
                if (result.data.items && result.data.items.length > 0) {
                    setSession(chatId, result.data.items);
                }

                let message = formatMarketplaceMessage(result.data, result.settlement);

                // Append buy hint
                if (result.data.items && result.data.items.length > 0) {
                    message += "\n💡 Quick Buy:\n";
                    if (result.data.items.length === 1) {
                        message += `  Type "buy" to purchase this item (0.1 TON)\n`;
                    } else {
                        message += `  Type "buy <name>" to purchase (0.1 TON)\n`;
                        message += `  e.g. buy ${result.data.items[0].item.split(" ").slice(0, 2).join(" ")}\n`;
                    }
                }

                await sendMessage(chatId, message);
                console.log("✅ Marketplace data sent successfully");
            } else {
                let errorMessage = "❌ Payment Failed\n\n";
                if (result.paid) {
                    errorMessage += "⚠️ Payment broadcasted but settlement failed (transaction may still confirm on-chain)\n\n";
                }
                errorMessage += `Error: ${result.error}`;
                await sendMessage(chatId, errorMessage);
                console.error("❌ Payment failed:", result.error);
            }
        } catch (error: any) {
            const errorMessage = `❌ Error\n\n${error.message || String(error)}`;
            await sendMessage(chatId, errorMessage);
            console.error("❌ Processing error:", error);
        }
    } else if (text.startsWith("buy") || text.startsWith("/buy")) {
        const buyText = text.replace(/^\/buy|^buy/i, "").trim();
        const sessionItems = getSession(chatId);

        if (!sessionItems || sessionItems.length === 0) {
            await sendMessage(chatId, "❌ No recent search results.\n\nUse 'market' first to browse items, then 'buy' to purchase.");
            return;
        }

        let targetItem: any = null;

        if (!buyText) {
            // No name given — auto-buy only if exactly 1 item in session
            if (sessionItems.length === 1) {
                targetItem = sessionItems[0];
            } else {
                let msg = `🛍️ ${sessionItems.length} items in your last search. Specify which one:\n\n`;
                sessionItems.forEach((it: any, i: number) => {
                    msg += `${i + 1}. ${it.item} ($${it.price_usd})\n`;
                });
                msg += `\n💡 Type "buy <name>" e.g. buy ${sessionItems[0].item.split(" ").slice(0, 2).join(" ")}`;
                await sendMessage(chatId, msg);
                return;
            }
        } else {
            // Fuzzy match by name
            const query = buyText.toLowerCase();
            const matches = sessionItems.filter((it: any) =>
                it.item.toLowerCase().includes(query)
            );

            if (matches.length === 1) {
                targetItem = matches[0];
            } else if (matches.length > 1) {
                let msg = `🔍 Multiple matches for "${buyText}":\n\n`;
                matches.forEach((it: any, i: number) => {
                    msg += `${i + 1}. ${it.item} ($${it.price_usd})\n`;
                });
                msg += "\n💡 Be more specific, e.g. buy " + matches[0].item;
                await sendMessage(chatId, msg);
                return;
            } else {
                await sendMessage(chatId, `❌ No item matching "${buyText}" in your last search.\n\n💡 Try 'market' again or use a different name.`);
                return;
            }
        }

        // Confirm and execute purchase
        await sendMessage(chatId, `⏳ Purchasing "${targetItem.item}" for 0.1 TON...\nProcessing x402 payment...`);

        try {
            const result = await buyItem(targetItem, username);

            if (result.success) {
                const receipt = formatReceipt(result.data.receipt, result.settlement);
                await sendMessage(chatId, receipt);
                console.log(`✅ Purchase complete: ${targetItem.item}`);
            } else {
                let errorMsg = "❌ Purchase Failed\n\n";
                if (result.paid) {
                    errorMsg += "⚠️ Payment broadcasted but settlement pending\n\n";
                }
                errorMsg += `Error: ${result.error}`;
                await sendMessage(chatId, errorMsg);
                console.error("❌ Purchase failed:", result.error);
            }
        } catch (error: any) {
            await sendMessage(chatId, `❌ Error\n\n${error.message || String(error)}`);
            console.error("❌ Purchase error:", error);
        }
    } else if (text === "/start" || text === "start") {
        const welcomeMessage = 
            `👋 Hello, ${username}!\n\n` +
            `Welcome to Wisemanager Bot!\n\n` +
            `📝 Commands:\n` +
            `• weather - Weather data (0.01 BSA USD)\n` +
            `• market - Browse items (0.01 BSA USD)\n` +
            `• buy - Purchase item (0.1 TON)\n` +
            `• sell - List your item for sale (0.1 TON)\n\n` +
            `🔍 Market: market MacBook / market price 500-700\n` +
            `🛒 Buy: buy / buy MacBook (after market)\n` +
            `📤 Sell: guided 6-step listing flow\n\n` +
            `💡 Just type naturally!`;
        await sendMessage(chatId, welcomeMessage);
    } else if (text === "/help" || text === "help") {
        const helpMessage = 
            `📖 Help\n\n` +
            `x402 protocol on TON blockchain.\n\n` +
            `Commands:\n` +
            `• weather - Weather data (0.01 BSA USD)\n` +
            `• market - Browse items (0.01 BSA USD)\n` +
            `• buy - Purchase item (0.1 TON)\n` +
            `• sell - List item for sale (0.1 TON)\n\n` +
            `Market: market MacBook / price 500-700 / in Lausanne\n\n` +
            `Buy (after market search):\n` +
            `  buy → auto-buy if 1 result\n` +
            `  buy MacBook Air → match by name\n\n` +
            `Sell (6-step guided flow):\n` +
            `  1. Photo (or skip)\n` +
            `  2. Product name\n` +
            `  3. Price (USD)\n` +
            `  4. Category\n` +
            `  5. Location\n` +
            `  6. Description\n` +
            `  Then confirm + pay 0.1 TON listing fee\n` +
            `  Product appears on Shop page!`;
        await sendMessage(chatId, helpMessage);
    }
}

// Long polling to get updates
async function getUpdates(offset: number = 0): Promise<TelegramUpdate[]> {
    try {
        const response = await fetch(`${TELEGRAM_API_URL}/getUpdates?offset=${offset}&timeout=30`);
        const data: TelegramResponse = await response.json();
        
        if (data.ok) {
            return data.result;
        } else {
            // Check if it's a conflict error (another instance running)
            if (data.error_code === 409) {
                console.error("❌ Detected another Bot instance running!");
                console.error("❌ Error:", data.description);
                console.error("💡 Exiting... Please ensure only one Bot instance is running");
                process.exit(1);
            }
            console.error("❌ Failed to get updates:", data);
            return [];
        }
    } catch (error) {
        console.error("❌ Error getting updates:", error);
        return [];
    }
}

// Main loop
async function main() {
    console.log("🤖 Starting Telegram Bot...");
    console.log(`📱 Bot Token: ${TELEGRAM_BOT_TOKEN.slice(0, 10)}...`);
    
    // Test bot connection
    try {
        const response = await fetch(`${TELEGRAM_API_URL}/getMe`);
        const data = await response.json();
        if (data.ok) {
            console.log(`✅ Bot connected: @${data.result.username}`);
            console.log(`👤 Bot name: ${data.result.first_name}`);
        }
    } catch (error) {
        console.error("❌ Cannot connect to Telegram API:", error);
        process.exit(1);
    }

    let offset = 0;
    console.log("🔄 Listening for messages...\n");

    while (true) {
        try {
            const updates = await getUpdates(offset);
            
            for (const update of updates) {
                await handleUpdate(update);
                offset = update.update_id + 1;
            }
        } catch (error) {
            console.error("❌ Main loop error:", error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

main().catch(console.error);
