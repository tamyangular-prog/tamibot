const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('<h1>Bot Lu - Espaço TS</h1><p>Status: Servidor Ativo ✅</p>'));
app.listen(PORT, () => console.log(`🌐 Servidor rodando na porta ${PORT}`));

console.log('[BOT] Iniciando WhatsApp...');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: '/app/sessions' }),
    puppeteer: {
        headless: true,
        // Deixamos sem o executablePath para o Puppeteer usar o que ele baixou no build
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

client.on('qr', qr => {
    console.log('📱 QR CODE RECEBIDO! ESCANEIE ABAIXO:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('🚀 BOT CONECTADO COM SUCESSO!');
});

client.on('auth_failure', msg => {
    console.error('❌ Falha na autenticação:', msg);
});

client.initialize().catch(err => {
    console.error('❌ Erro de inicialização:', err.message);
});
