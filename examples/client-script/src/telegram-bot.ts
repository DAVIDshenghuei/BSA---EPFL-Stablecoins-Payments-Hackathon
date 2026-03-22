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
async function buyItem(item: any) {
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

// Store processed message IDs to prevent duplicate processing
const processedMessages = new Set<string>();

// Handle Telegram updates
async function handleUpdate(update: TelegramUpdate) {
    if (!update.message?.text) return;

    const chatId = update.message.chat.id;
    const messageId = update.message.message_id;
    const text = update.message.text.toLowerCase().trim();
    const username = update.message.from?.first_name || "User";

    // Generate unique message ID
    const uniqueMessageId = `${chatId}_${messageId}`;
    
    // Check if message was already processed
    if (processedMessages.has(uniqueMessageId)) {
        console.log(`⏭️ Skipping already processed message: ${uniqueMessageId}`);
        return;
    }
    
    // Mark as processed
    processedMessages.add(uniqueMessageId);
    
    // Clean up old message IDs (keep latest 100)
    if (processedMessages.size > 100) {
        const firstItem = processedMessages.values().next().value;
        processedMessages.delete(firstItem);
    }

    console.log(`📨 Received message: "${text}" from ${username} (${chatId})`);

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
            const result = await buyItem(targetItem);

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
            `Welcome to the Payment Bot!\n\n` +
            `📝 Available Commands:\n` +
            `• weather - Get weather data (0.01 BSA USD)\n` +
            `• market - Browse marketplace items (0.01 BSA USD)\n` +
            `• buy - Purchase an item (0.1 TON)\n\n` +
            `🔍 Market Filters:\n` +
            `• market MacBook\n` +
            `• market price 500-700\n` +
            `• market in Lausanne\n\n` +
            `🛒 Buy Combo (after market search):\n` +
            `• buy - Auto-buy if only 1 result\n` +
            `• buy MacBook - Buy matching item\n\n` +
            `💡 Just type naturally!`;
        await sendMessage(chatId, welcomeMessage);
    } else if (text === "/help" || text === "help") {
        const helpMessage = 
            `📖 Help\n\n` +
            `This bot uses the x402 protocol on the TON blockchain.\n\n` +
            `Commands:\n` +
            `• weather - Weather data (0.01 BSA USD)\n` +
            `• market - Browse items (0.01 BSA USD)\n` +
            `• buy - Purchase item (0.1 TON)\n\n` +
            `Market Filters:\n` +
            `• market MacBook\n` +
            `• market price 500-700\n` +
            `• market in Lausanne\n` +
            `• market Dell price 500-600\n\n` +
            `Buy Combo (market then buy):\n` +
            `1. Search: market MacBook\n` +
            `2. If 1 result: type "buy"\n` +
            `3. If multiple: type "buy MacBook Air"\n` +
            `4. Receipt generated after payment\n\n` +
            `Each buy costs 0.1 TON via x402.`;
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
