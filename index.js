require('dotenv').config();
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const API_TOKEN = process.env.API_TOKEN;
const PORT = process.env.PORT || 3000;

const app = express();
app.get('/', (req, res) => res.send('Bot Online ✅'));
app.listen(PORT, () => console.log(`🌐 Servidor na porta ${PORT}`));

console.log('[BOT] Iniciando cliente...');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: '/app/sessions' }),
    authTimeoutMs: 60000, // Aumenta o tempo de espera para 60 segundos
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/google-chrome', // Caminho direto do Chrome no Docker
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

client.on('ready', () => console.log('🚀 BOT CONECTADO!'));

// Evita que o erro de timeout feche o processo imediatamente
client.initialize().catch(err => {
    console.error('❌ Erro na inicialização:', err.message);
});
