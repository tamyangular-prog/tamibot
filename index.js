require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Interface simples para monitoramento
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1 style="color: #25d366;">Lu - Espaço TS</h1>
            <p>O servidor está rodando na porta ${PORT}</p>
            <p>Verifique os <b>Logs do Railway</b> para escaneiar o QR Code.</p>
        </div>
    `);
});

app.listen(PORT, () => console.log(`🌐 Servidor ativo na porta ${PORT}`));

console.log('[BOT] Iniciando o navegador Chrome...');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: '/app/sessions' // Local definido no seu Dockerfile
    }),
    puppeteer: {
        headless: true,
        // O caminho abaixo é o padrão da imagem que você colocou no Dockerfile
        executablePath: '/usr/bin/google-chrome',
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

// Evento de geração do QR Code
client.on('qr', (qr) => {
    console.log('📱 QR CODE GERADO COM SUCESSO!');
    console.log('Abaixe o zoom do console se o código parecer quebrado.');
    qrcode.generate(qr, { small: true });
});

// Evento de conexão bem-sucedida
client.on('ready', () => {
    console.log('🚀 BOT CONECTADO E PRONTO PARA USO!');
});

// Tratamento de erros para evitar que o bot caia
client.initialize().catch(err => {
    console.error('❌ Erro ao iniciar o WhatsApp:', err);
});

process.on('unhandledRejection', error => {
    console.log('Sincronizando navegador...', error.message);
});
