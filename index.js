require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// --- Configurações Iniciais ---
const API_TOKEN = process.env.API_TOKEN;
const PORT = process.env.PORT || 3000;

if (!API_TOKEN) {
  console.error('[CONFIG] ✗ API_TOKEN não definido no .env');
  process.exit(1);
}

// --- Servidor Express (Para manter a porta aberta no Railway) ---
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ status: 'Online', message: 'Bot WhatsApp rodando ✅' });
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor HTTP ativo na porta ${PORT}`);
});

// --- Configuração do Bot WhatsApp ---
console.log('[BOT] Inicializando cliente...');

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: '/app/sessions' // Caminho fixo para facilitar volumes no Docker
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', 
      '--disable-gpu'
    ]
  }
});

client.on('qr', qr => {
  console.log('📱 ESCANEIE O QR CODE ABAIXO:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('🚀 Bot iniciado e conectado com sucesso!');
});

client.on('message', msg => {
  if (msg.body.toLowerCase() === 'oi') {
    msg.reply('Olá! Sou a Lu do Espaço TS. Como posso ajudar?');
  }
});

client.initialize().catch(err => {
  console.error('❌ Erro fatal ao inicializar:', err);
});
