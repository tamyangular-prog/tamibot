require('dotenv').config();
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const API_TOKEN = process.env.API_TOKEN;
const PORT = process.env.PORT || 3000;

// Validação básica do token
if (!API_TOKEN) {
    console.error('[CONFIG] ✗ API_TOKEN não definido nas variáveis do Railway');
    process.exit(1);
}

const app = express();

// Rota para checar se o bot está vivo
app.get('/', (req, res) => {
    res.send(`<h1>Bot Lu - Espaço TS</h1><p>Status: Online ✅</p>`);
});

app.listen(PORT, () => console.log(`🌐 Servidor rodando na porta ${PORT}`));

console.log('[BOT] Iniciando cliente WhatsApp...');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: '/app/sessions' }),
    authTimeoutMs: 60000, // Dá 1 minuto para o bot carregar
    puppeteer: {
        headless: true,
        // Removido o executablePath fixo para evitar erro de "Browser not found"
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
        ]
    }
});

client.on('qr', qr => {
    console.log('📱 QR CODE GERADO! ESCANEIE AGORA:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('🚀 BOT CONECTADO COM SUCESSO!');
});

// Resposta simples para teste
client.on('message', msg => {
    if (msg.body.toLowerCase() === 'oi') {
        msg.reply('Olá! Sou a Lu do Espaço TS. Como posso ajudar?');
    }
});

client.initialize().catch(err => {
    console.error('❌ Erro fatal na inicialização:', err.message);
});
