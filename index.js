// index.js
// Bot WhatsApp adaptado para o Espaço TS - "Lu, recepcionista do Espaço TS"
// VERSÃO BLINDADA + DADOS PESSOAIS ANTES DO ENCAMINHAMENTO

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Habilita ou não o controlador HTTP (controller.html).
// Defina a variável de ambiente `ENABLE_HTTP_CONTROLLER=true` para habilitar.
const ENABLE_HTTP = process.env.ENABLE_HTTP_CONTROLLER === 'true';
let app = null;
if (ENABLE_HTTP) {
  // Configuração Express
  app = express();
  app.use(cors());
  app.use(express.json());

  // Servir arquivos estáticos (apenas quando o controlador HTTP estiver habilitado)
  app.use(express.static(path.join(__dirname)));
} else {
  console.log('HTTP controller is disabled (ENABLE_HTTP_CONTROLLER not true).');
}

// ======================================================================
// VARIÁVEIS DE AMBIENTE E CONFIGURAÇÃO
// ======================================================================

// Carregar .env (com fallback se não existir)
try {
  require('dotenv').config();
  console.log('[CONFIG] ✓ Arquivo .env carregado');
} catch (err) {
  console.log('[CONFIG] ⚠️  Arquivo .env não encontrado, usando padrões');
}

// Variável para controlar o estado do bot
let botStatus = false;
let botClient = null;

// Token de segurança (use variável de ambiente em produção)
const API_TOKEN = process.env.API_TOKEN || 'bot-lu-default-token-change-me';
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validação de configuração
console.log('[CONFIG] Validando configurações...');
if (API_TOKEN === 'bot-lu-default-token-change-me') {
  console.warn('[CONFIG] ⚠️  AVISO CRÍTICO: Token padrão detectado!');
  console.warn('[CONFIG] ⚠️  Em PRODUÇÃO, mude API_TOKEN em .env imediatamente!');
  if (NODE_ENV === 'production') {
    console.error('[CONFIG] ✗ ERRO: Token padrão não é permitido em produção');
    process.exit(1);
  }
}
console.log(`[CONFIG] ✓ API_TOKEN configurado (primeiros 10 chars: ${API_TOKEN.substring(0, 10)}***)`);
console.log(`[CONFIG] ✓ PORT: ${PORT}`);
console.log(`[CONFIG] ✓ NODE_ENV: ${NODE_ENV}`);

// Configuração
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

botClient = client;

// Helpers
const delay = ms => new Promise(res => setTimeout(res, ms));
const userContexts = {};
const MAX_FALLBACKS = 2;

function setUserContext(userId, context, data = {}) {
  userContexts[userId] = { context, data, timestamp: Date.now() };
}

function getUserContext(userId) {
  return userContexts[userId] || null;
}

function clearUserContext(userId) {
  delete userContexts[userId];
}

async function safeSendMessage(to, message) {
  try {
    await client.sendMessage(to, message);
  } catch (err) {
    console.error('Erro ao enviar mensagem', err);
  }
}

// ======================================================================
// EVENTOS DO CLIENTE WHATSAPP
// ======================================================================

let initializationAttempt = 0;
const MAX_INIT_ATTEMPTS = 3;

// QR Code
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('✓ [QR CODE] Escaneie no WhatsApp para conectar');
});

// Cliente pronto
client.on('ready', () => {
  initializationAttempt = 0; // Reseta tentativas em sucesso
  botStatus = true;
  console.log('✓ [READY] Lu conectada! Bot do Espaço TS está online e pronto.');
  console.log(`   Timestamp: ${new Date().toLocaleString('pt-BR')}`);
});

// Desconectado
client.on('disconnected', (reason) => {
  botStatus = false;
  console.error(`✗ [DISCONNECTED] Bot desconectado. Motivo: ${reason}`);
  console.log('  Tentando reconectar em 5 segundos...');
  
  // Tentar reconectar automaticamente
  setTimeout(() => {
    if (initializationAttempt < MAX_INIT_ATTEMPTS) {
      initializationAttempt++;
      console.log(`  [RETRY] Tentativa ${initializationAttempt} de ${MAX_INIT_ATTEMPTS}`);
      client.initialize().catch(err => {
        console.error(`  [RETRY ERROR] Erro ao reiniciar: ${err.message}`);
      });
    } else {
      console.error(`✗ [FATAL] Falha permanente após ${MAX_INIT_ATTEMPTS} tentativas`);
    }
  }, 5000);
});

// Erro de autenticação
client.on('auth_failure', (msg) => {
  botStatus = false;
  console.error(`✗ [AUTH_FAILURE] Falha de autenticação: ${msg}`);
  console.log('  Solução: Delete a pasta .wwebjs_auth e escaneie o QR novamente');
});

// Erro geral
client.on('error', (err) => {
  console.error(`✗ [ERROR] Erro no cliente WhatsApp: ${err.message}`);
  if (err.message.includes('ECONNREFUSED') || err.message.includes('ERR_INTERNET_DISCONNECTED')) {
    console.log('  [INFO] Erro de conexão de internet detectado');
  }
});

// ----------------------------------------------------------------------
// MENUS
// ----------------------------------------------------------------------

async function sendMainMenu(userId) {
  const msg =
    `Olá! Meu nome é Lu, sou recepcionista do Espaço TS.\n\n` +
    `✋ Caso precise falar com uma atendente, escolha uma opção abaixo (responda com o número):\n\n` +
    `1 - Agendamento (Avaliação/Outros Serviço)\n` +
    `2 - Orçamento\n` +
    `3 - Outras Informações\n` +
    `4 - Reagendar\n` +
    `5 - Falar com a recepçao (lu)`;

  await safeSendMessage(userId, msg);
  setUserContext(userId, 'awaiting_main_option');
}

async function sendServicosMenu(userId) {
  const msg =
    `Perfeito! Para qual serviço você gostaria de agendar uma Avaliação? Escolha a opção:\n\n` +
    `1 - Avaliação / Avaliação online\n` +
    `2 - Corte\n` + 
    `3 - Mechas\n` +
    `4 - Coloração\n` +
    `5 - Realinhamento\n` +
    `6 - Tratamento\n` +
    `7 - Hidro Capilar\n` +
    `8 - Finalização para cachos\n` +
    `9 - Reconstrução CPR\n\n` +
    `0 - Voltar ao Menu Principal`;

  await safeSendMessage(userId, msg);
  setUserContext(userId, 'awaiting_servico_option');
}

// ----------------------------------------------------------------------
// MENSAGENS
// ----------------------------------------------------------------------

client.on('message', async (msg) => {
  try {
    if (!msg.from.endsWith('@c.us')) return;
    const chat = await msg.getChat();
    if (chat.isGroup) return;

    const userId = msg.from;
    const text = (msg.body || '').trim().toLowerCase();
    const ctx = getUserContext(userId);

    // Log de mensagem recebida (sem expor dados sensíveis)
    console.log(`[MSG] ${userId.substring(0, 10)}*** > "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);

    // Ignorar respostas muito curtas ou aleatórias (EXCETO sim/não/s/n que são críticas)
    if (/(^|\s)(ok|certo|obrigado|blz|valeu|kk|k)(\s|$)/i.test(text) && !ctx) {
      clearUserContext(userId);
      return;
    }

    // ------------------------------------------------------------------
    // ETAPA 1 → AVALIAÇÃO (Dia e Hora)
    // ------------------------------------------------------------------

    if (ctx?.context === 'awaiting_avaliacao') {
      const requested = msg.body;

      await delay(1200); await chat.sendStateTyping(); await delay(1500);

      await safeSendMessage(
        userId,
        `Perfeito! Recebi sua preferência: "${requested}".\n\n` +
        `Agora preciso confirmar alguns dados:\n\n` +
        `• Nome completo\n` +
        `• Cidade\n` +
        `• Bairro e número\n` +
        `• CPF\n` +
        `• Data de nascimento\n` +
        `• Email\n\n` +
        `Pode enviar tudo em uma única mensagem.`
      );

      setUserContext(userId, 'awaiting_dados_pessoais', { requested });
      return;
    }

    // ------------------------------------------------------------------
    // ETAPA 1.5 → CORTE (tipo de cabelo)
    // ------------------------------------------------------------------

    if (ctx?.context === 'awaiting_cabelo_type') {
      if (text === '1' || text === 'liso') {
        await delay(1000); await chat.sendStateTyping(); await delay(1200);
        await safeSendMessage(
          userId,
          `Entendi! Cabelo liso. Para agendar, me informe:\n• Nome completo\n• Cidade\n• Data de nascimento\n• Telefone`
        );
        setUserContext(userId, 'awaiting_corte_info', { cabeloType: 'liso' });
        return;
      }

      if (text === '2' || text === 'cacheado') {
        await delay(1000); await chat.sendStateTyping(); await delay(1200);
        await safeSendMessage(
          userId,
          `Entendi! Cabelo cacheado. Para agendar, me informe:\n• Nome completo\n• Cidade\n• Data de nascimento\n• Telefone`
        );
        setUserContext(userId, 'awaiting_corte_info', { cabeloType: 'cacheado' });
        return;
      }

      await safeSendMessage(userId, `Opção inválida. Digite 1 para Liso ou 2 para Cacheado.`);
      setUserContext(userId, 'awaiting_cabelo_type');
      return;
    }

    // ------------------------------------------------------------------
    // ETAPA 2 → CORTE (dados básicos)
    // ------------------------------------------------------------------

    if (ctx?.context === 'awaiting_corte_info') {
      const info = msg.body;

      await delay(1000); await chat.sendStateTyping(); await delay(1200);

      await safeSendMessage(
        userId,
        `Já recebi suas informações, obrigada! Irei te passar agora as vagas disponíveis.`
      );

      setUserContext(userId, 'confirm_send_to_human_final', { requested: info, ...ctx.data });
      return;
    }

    // ------------------------------------------------------------------
    // ETAPA 4 → RECEBIMENTO DOS DADOS PESSOAIS
    // ------------------------------------------------------------------

    if (ctx?.context === 'awaiting_dados_pessoais') {
      const dados = msg.body;

      await delay(1000); await chat.sendStateTyping(); await delay(1200);

      await safeSendMessage(
        userId,
        `Já recebi suas informações, obrigada! Irei te passar agora as vagas disponíveis.`
      );

      setUserContext(userId, 'confirm_send_to_human_final', {
        ...ctx.data,
        dados
      });

      return;
    }

    // ------------------------------------------------------------------
    // ETAPA 5 → CONFIRMAR ENCAMINHAMENTO FINAL
    // ------------------------------------------------------------------

    if (ctx?.context === 'confirm_send_to_human_final') {
      await delay(800); await chat.sendStateTyping(); await delay(1200);

      await safeSendMessage(userId, `Prontinho! Estou encaminhando tudo para a recepção agora. 😊\nAguarde um instante.`);

      clearUserContext(userId);
      return;
    }

    // ------------------------------------------------------------------
    // SUBMENU SERVIÇOS
    // ------------------------------------------------------------------

    if (ctx?.context === 'awaiting_servico_option') {
      switch (text) {
        case '1':
          await safeSendMessage(userId, 'Perfeito! Me diga o dia e horário que prefere.');
          setUserContext(userId, 'awaiting_avaliacao');
          return;

        case '2':
          await safeSendMessage(
            userId,
            'Perfeito! Seu cabelo é liso ou cacheado?\n\n1 - Liso\n2 - Cacheado'
          );
          setUserContext(userId, 'awaiting_cabelo_type');
          return;

        case '3': case '4': case '5': case '6': case '7': case '8': case '9':
          const names = {
            '3': 'Mechas', '4': 'Coloração', '5': 'Realinhamento',
            '6': 'Tratamento', '7': 'Hidro Capilar', '8': 'Finalização para cachos', '9': 'Reconstrução CPR'
          };
          await safeSendMessage(
            userId,
            `${names[text]} — entendi! A avaliação é necessária.\nEnvie o dia e o horário que prefere.`
          );
          setUserContext(userId, 'awaiting_avaliacao');
          return;

        case '0':
          await sendMainMenu(userId);
          return;

        default:
          await safeSendMessage(userId, `Opção inválida. Digite um número de 1 a 9 ou 0 para voltar.`);
          setUserContext(userId, 'awaiting_servico_option');
          return;
      }
    }

    // ------------------------------------------------------------------
    // MENU PRINCIPAL
    // ------------------------------------------------------------------

    if (ctx?.context === 'awaiting_main_option') {
      if (text === '1') {
        await sendServicosMenu(userId);
        return;
      }

      if (['2','3','4','5'].includes(text)) {
        await safeSendMessage(userId, `Tudo bem! Qualquer coisa estou por aqui. 😊`);
        clearUserContext(userId);
        return;
      }

      if (text === '6' || text === '7') {
        await safeSendMessage(userId, `Certo! Vou encaminhar para a recepção.`);
        clearUserContext(userId);
        return;
      }

      await safeSendMessage(userId, `Opção inválida. Digite um número de 1 a 5.`);
      setUserContext(userId, 'awaiting_main_option');
      return;
    }

    // ------------------------------------------------------------------
    // GATILHO INICIAL
    // ------------------------------------------------------------------

    if (!ctx) {
      if (/menu|oi|olá|ola|bom dia|boa tarde|boa noite|start/i.test(text)) {
        await sendMainMenu(userId);
        return;
      }
      return;
    }

    // ------------------------------------------------------------------
    // FALLBACK
    // ------------------------------------------------------------------

    let fallback = ctx?.data?.fallbackCount || 1;

    if (fallback > MAX_FALLBACKS) {
      await safeSendMessage(userId, `Desculpe, não entendi. Vou encaminhar para a recepção.`);
      clearUserContext(userId);
      return;
    }

    await safeSendMessage(userId, `Não entendi. Digite o número da opção ou "menu".`);
    setUserContext(userId, 'unrecognized_input', { fallbackCount: fallback + 1 });

  } catch (err) {
    console.error(`[MSG_ERROR] Erro ao processar mensagem de ${userId}: ${err.message}`);
    try {
      await safeSendMessage(userId, 'Desculpe, houve um erro ao processar sua mensagem. Tente novamente.');
    } catch (e) {
      console.error(`[MSG_ERROR_SEND] Erro ao enviar mensagem de erro: ${e.message}`);
    }
  }
});

// Limpeza automática
setInterval(() => {
  const now = Date.now();
  for (const id in userContexts) {
    if (now - userContexts[id].timestamp > 30 * 60 * 1000) {
      delete userContexts[id];
    }
  }
}, 5 * 60 * 1000);

// ------------------------------------------------------------------
// ROTAS EXPRESS - CONTROLE DO BOT (opcionais)
// ------------------------------------------------------------------

// Middleware de autenticação para APIs
const authMiddleware = (req, res, next) => {
  const token = req.headers['x-api-token'] || req.query.token;
  
  if (!token) {
    console.warn('[AUTH] ⚠️  Tentativa de acesso sem token');
    return res.status(401).json({ 
      success: false,
      error: 'Token ausente',
      message: 'Forneça o token via header x-api-token ou query param ?token=' 
    });
  }
  
  if (token !== API_TOKEN) {
    console.warn(`[AUTH] ✗ Token inválido detectado (primeiros 10 chars: ${token.substring(0, 10)}***)`);
    return res.status(401).json({ 
      success: false,
      error: 'Token inválido',
      message: 'O token fornecido não está correto'
    });
  }
  
  console.log('[AUTH] ✓ Token validado com sucesso');
  next();
};

if (ENABLE_HTTP && app) {
  // Aplicar autenticação em todas as rotas /api
  app.use('/api/', authMiddleware);

  // Rota para ligar o bot
  app.post('/api/bot/start', async (req, res) => {
    try {
      if (botStatus) {
        console.log('[API] POST /api/bot/start - Bot já está ligado');
        return res.json({ 
          success: false, 
          message: 'Bot já está ligado',
          status: botStatus,
          timestamp: new Date().toISOString()
        });
      }

      console.log('[API] POST /api/bot/start - Iniciando bot...');
      await initializeBot();
      
      // Aguardar um pouco para ter certeza que iniciou
      await new Promise(resolve => setTimeout(resolve, 2000));

      res.json({ 
        success: botStatus, 
        message: botStatus ? 'Bot ligado com sucesso' : 'Erro ao ligar bot',
        status: botStatus,
        timestamp: new Date().toISOString()
      });
    } catch (erro) {
      console.error(`[API_ERROR] POST /api/bot/start - ${erro.message}`);
      res.status(500).json({ 
        success: false, 
        message: erro.message,
        error: 'Erro interno ao ligar bot',
        status: botStatus,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Rota para desligar o bot
  app.post('/api/bot/stop', async (req, res) => {
    try {
      if (!botStatus) {
        console.log('[API] POST /api/bot/stop - Bot já está desligado');
        return res.json({ 
          success: false, 
          message: 'Bot já está desligado',
          status: botStatus,
          timestamp: new Date().toISOString()
        });
      }

      console.log('[API] POST /api/bot/stop - Desligando bot...');
      await botClient.destroy();
      botStatus = false;
      
      // Reinicializar cliente para próxima ligação
      botClient = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });

      res.json({ 
        success: true, 
        message: 'Bot desligado com sucesso',
        status: botStatus,
        timestamp: new Date().toISOString()
      });
    } catch (erro) {
      console.error(`[API_ERROR] POST /api/bot/stop - ${erro.message}`);
      res.status(500).json({ 
        success: false, 
        message: erro.message,
        error: 'Erro interno ao desligar bot',
        status: botStatus,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Rota para verificar status do bot
  app.get('/api/bot/status', (req, res) => {
    console.log('[API] GET /api/bot/status');
    res.json({ 
      success: true,
      status: botStatus, 
      message: botStatus ? 'Online' : 'Offline',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version
    });
  });

  // Rota health check (sem autenticação para monitoramento externo)
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok',
      bot: botStatus ? 'online' : 'offline',
      timestamp: new Date().toISOString()
    });
  });

  // Iniciar servidor Express (usando PORT já definido no topo)
  app.listen(PORT, () => {
    console.log(`\n[SERVER] ✓ Servidor Express rodando em http://localhost:${PORT}`);
    console.log(`[SERVER] API Status: http://localhost:${PORT}/api/bot/status (requer token)`);
    console.log(`[SERVER] Health Check: http://localhost:${PORT}/health`);
    console.log(`[SERVER] ⚠️  Não esqueça de mudar API_TOKEN em produção!\n`);
  });
  
  app.on('error', (err) => {
    console.error(`[SERVER_ERROR] Erro ao iniciar servidor: ${err.message}`);
  });
} else {
  console.log('[SERVER] ℹ️  HTTP Controller desabilitado (ENABLE_HTTP_CONTROLLER=false)');
  console.log('[SERVER] ℹ️  Para habilitar, defina ENABLE_HTTP_CONTROLLER=true no .env\n');
}

// ------------------------------------------------------------------
// INICIALIZAR BOT AUTOMATICAMENTE
// ------------------------------------------------------------------

// Função para inicializar com proteção contra inicialização dupla
async function initializeBot() {
  if (botStatus) {
    console.log('[INIT] ⚠️  Bot já está inicializado. Ignorando nova tentativa.');
    return;
  }

  try {
    console.log('[INIT] Iniciando cliente WhatsApp...');
    console.log(`[INIT] Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[INIT] HTTP Controller: ${ENABLE_HTTP ? 'HABILITADO' : 'DESABILITADO'}`);
    console.log(`[INIT] Timestamp: ${new Date().toLocaleString('pt-BR')}`);
    
    await client.initialize();
    // Note: botStatus será setado como true no evento 'ready'
  } catch (err) {
    console.error(`[INIT_ERROR] Erro ao inicializar bot: ${err.message}`);
    console.error('[INIT_ERROR] Stack:', err.stack);
    initializationAttempt++;
    
    if (initializationAttempt < MAX_INIT_ATTEMPTS) {
      console.log(`[INIT_RETRY] Tentando novamente em 10 segundos... (${initializationAttempt}/${MAX_INIT_ATTEMPTS})`);
      setTimeout(initializeBot, 10000);
    } else {
      console.error('[INIT_FATAL] Falha permanente ao inicializar bot');
      process.exit(1);
    }
  }
}

// Inicializar bot na inicialização do processo
initializeBot();
