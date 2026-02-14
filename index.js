const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Rota para manter o Railway feliz
app.get('/', (req, res) => res.send('Bot Lu Ativo ✅'));
app.listen(PORT, () => console.log(`🌐 Servidor na porta ${PORT}`));

console.log('[BOT] Preparando navegador...');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: '/app/sessions' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-extensions',
            '--remote-debugging-port=9222'
        ]
    }
});

client.on('qr', qr => {
    console.log('📱 QR CODE RECEBIDO!');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('🚀 BOT CONECTADO COM SUCESSO!');
});

// Inicialização com tratamento de erro simplificado
client.initialize();

process.on('unhandledRejection', error => {
    console.log('Aguardando inicialização estável...', error.message);
});
