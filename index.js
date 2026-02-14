const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot Lu Ativo ✅'));
app.listen(PORT, () => console.log(`🌐 Servidor na porta ${PORT}`));

console.log('[BOT] Iniciando WhatsApp...');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: '/app/sessions' }),
    puppeteer: {
        headless: true,
        // No Docker do Puppeteer, o executável fica SEMPRE aqui:
        executablePath: '/usr/bin/google-chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

client.on('qr', qr => {
    console.log('📱 QR CODE RECEBIDO!');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('🚀 BOT CONECTADO!'));

// Tratamento de erro detalhado para pegarmos o vilão
client.initialize().catch(err => {
    console.log('❌ ERRO DETALHADO:', err);
});
