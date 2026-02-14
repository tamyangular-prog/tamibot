require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('[CONFIG] ✓ Arquivo .env carregado');

const API_TOKEN = process.env.API_TOKEN;
const PORT = process.env.PORT || 3000;

console.log('[CONFIG] Validando configurações...');

if (!API_TOKEN) {
  console.error('[CONFIG] ✗ API_TOKEN não definido');
  process.exit(1);
}

console.log('[CONFIG] ✓ Token válido');

// =========================
// EXPRESS
// =========================

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bot Lu rodando no Render ✅');
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor HTTP ativo na porta ${PORT}`);
});

// =========================
// WHATSAPP CLIENT
// =========================

console.log('[BOT] Iniciando cliente WhatsApp...');

const client = new Client({
  authStrategy: new LocalAuth(),

  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  }
});

client.on('qr', qr => {
  console.log('📱 Escaneie o QR Code:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('🚀 Bot iniciado com sucesso');
});

client.on('message', msg => {
  if (msg.body.toLowerCase() === 'oi') {
    msg.reply('Olá! Sou a Lu do Espaço TS. Como posso te ajudar?');
  }
});

client.initialize().catch(err => {
  console.error('❌ Erro ao inicializar cliente:', err.message);
});
