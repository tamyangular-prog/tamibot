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
// EXPRESS SERVER (obrigatório no Render)
// =========================

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bot Lu rodando no Render ✅');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor HTTP ativo na porta ${PORT}`);
});

// =========================
// WHATSAPP BOT
// =========================

console.log('[BOT] Iniciando cliente WhatsApp...');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
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

// =========================
// EVENTOS
// =========================

client.on('qr', qr => {
  console.log('📱 Escaneie o QR Code abaixo:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('🚀 Bot iniciado com sucesso');
});

client.on('authenticated', () => {
  console.log('🔐 Autenticado com sucesso');
});

client.on('auth_failure', msg => {
  console.error('❌ Falha na autenticação:', msg);
});

client.on('disconnected', reason => {
  console.log('⚠️ Bot desconectado:', reason);
});

// =========================
// MENSAGENS
// =========================

client.on('message', async msg => {
  try {
    if (msg.from.endsWith('@c.us')) {
      const text = msg.body.toLowerCase().trim();

      if (text === 'oi' || text === 'olá' || text === 'ola') {
        await msg.reply('Olá! Sou a Lu do Espaço TS. Como posso te ajudar?');
      }
    }
  } catch (err) {
    console.error('Erro ao responder mensagem:', err.message);
  }
});

// =========================
// START
// =========================

client.initialize().catch(err => {
  console.error('❌ Erro ao inicializar cliente:', err.message);
});
