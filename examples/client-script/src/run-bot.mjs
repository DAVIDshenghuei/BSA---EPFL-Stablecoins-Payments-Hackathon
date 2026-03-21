import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botPath = join(__dirname, 'telegram-bot.ts');
const tsxPath = join(__dirname, '..', 'node_modules', '.bin', 'tsx');

console.log('🤖 start Telegram Bot...');
console.log(`📁 Bot script: ${botPath}`);

// 在 Windows 上使用 node 運行 tsx
const proc = spawn('node', [
    join(__dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs'),
    botPath
], {
    stdio: 'inherit',
    shell: true
});

proc.on('error', (error) => {
    console.error('❌ start bot error:', error);
    process.exit(1);
});

proc.on('exit', (code) => {
    console.log(`Bot get off，code: ${code}`);
    process.exit(code);
});
