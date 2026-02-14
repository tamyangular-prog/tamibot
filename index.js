require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('[CONFIG] ✓ Arquivo .env carregado');

// =========================
// CONFIG VARIÁVEIS
// =========================

const API_TOKEN = process.env.API_TOKEN;
const PORT = process.env.PORT || 3000;

console.log('[CONFIG] Validando configurações...');

if (!API_TOKEN) {
  console.error('[CONFIG] ✗ API_TOKEN não definido nas variáveis de ambiente');
  process.exit(1);
}

console.log('[CONFIG] ✓ Token válido');

// =========================
// EXPRESS SERVER
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
// WHATSAPP BOT
// =========================

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', qr => {
  console.log('📱 Escaneie o QR Code abaixo:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('🚀 Bot iniciado com sucesso');
});

client.on('message', async msg => {
  if (msg.body.toLowerCase() === 'oi') {
    msg.reply('Olá! Sou a Lu do Espaço TS. Como posso te ajudar?');
  }
});

client.initialize();
