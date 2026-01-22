const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const config = require('./config');
const { connectDatabase } = require('./database');
const { loadCommands, handleMessage } = require('./handler');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

let sock = null;
let qrShown = false;

async function connectToWhatsApp() {
  qrShown = false;
  
  // Ensure sessions directory exists
  if (!fs.existsSync('./whatsapp_auth')) {
    fs.mkdirSync('./whatsapp_auth', { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState('./whatsapp_auth');

  sock = makeWASocket({
    auth: state,
    logger: require('pino')({ level: 'silent' }),
    browser: ['TetsuBot', 'Safari', '17.0'],
    syncFullHistory: false,
    shouldIgnoreJid: (jid) => jid.includes('broadcast'),
    generateHighQualityLinkPreview: false,
    maxMsToWaitForConnection: 60000,
  });

  // Save credentials when updated
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr, isNewLogin } = update;

    // Display QR Code when generated
    if (qr) {
      qrShown = true;
      console.log('\n╔════════════════════════════════════════╗');
      console.log('║  📱 SCAN THIS QR WITH WHATSAPP       ║');
      console.log('║     Nouveau QR généré!               ║');
      console.log('╚════════════════════════════════════════╝\n');
      
      try {
        qrcode.generate(qr, { small: true });
      } catch (err) {
        console.log('QR Code:', qr);
      }
      
      console.log('\n✅ Étapes:');
      console.log('1. Ouvrez WhatsApp');
      console.log('2. Menu > Appareils liés > Nouvel appareil');
      console.log('3. Scannez le code QR ci-dessus');
      console.log('4. Attendez la connexion (30-60 secondes)\n');
    }

    // Connection states
    if (connection === 'connecting') {
      if (!qrShown) {
        console.log('⏳ Connexion à WhatsApp...');
      }
    }

    if (connection === 'open') {
      console.log('\n✅ BOT CONNECTÉ AVEC SUCCÈS!\n');
      console.log(`📱 Numéro: ${sock.user?.id || 'inconnu'}`);
      qrShown = false;
    }

    if (connection === 'close') {
      qrShown = false;
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      const reason = (lastDisconnect?.error)?.output?.payload?.message || 'unknown';
      
      console.log(`\n⚠️  Disconnected. Code: ${statusCode}`);
      console.log(`Raison: ${reason}`);
      
      if (statusCode === 405) {
        console.log('❌ Erreur 405: WhatsApp rejette la connexion');
        console.log('⏳ Attendez 60 secondes avant de réessayer...\n');
        setTimeout(() => connectToWhatsApp(), 60000);
      } else if (statusCode === 401) {
        console.log('❌ Erreur 401: Session expirée ou invalide');
        console.log('🔄 Suppression de la session et reconnexion...\n');
        if (fs.existsSync('./whatsapp_auth')) {
          fs.rmSync('./whatsapp_auth', { recursive: true });
        }
        setTimeout(() => connectToWhatsApp(), 5000);
      } else {
        console.log('🔄 Tentative de reconnexion dans 10 secondes...\n');
        setTimeout(() => connectToWhatsApp(), 10000);
      }
    }
  });

  // Handle messages
  sock.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0];
    if (!message.message) return;

    const messageContent = message.body || '';
    const senderJid = message.key.remoteJid;
    const isGroup = senderJid.endsWith('@g.us');

    // Get group data if in group
    let groupData = null;
    if (isGroup) {
      try {
        groupData = await sock.groupMetadata(senderJid);
      } catch (error) {
        console.error('Error fetching group metadata:', error.message);
      }
    }

    // Handle message
    await handleMessage(sock, message, isGroup, groupData);
  });

  // Handle group updates
  sock.ev.on('groups.upsert', (updates) => {
    for (const update of updates) {
      console.log(`${config.COLORS.CYAN}📢 Group update: ${update.subject}${config.COLORS.RESET}`);
    }
  });

  // Handle participant updates
  sock.ev.on('group-participants.update', (update) => {
    console.log(`${config.COLORS.CYAN}👥 Group participants update in ${update.id}${config.COLORS.RESET}`);
  });

  return sock;
}

async function main() {
  console.log(`${config.COLORS.BLUE}🤖 TetsuBot - Otaku RPG WhatsApp Bot${config.COLORS.RESET}`);
  console.log(`${config.COLORS.BLUE}═══════════════════════════════════${config.COLORS.RESET}\n`);

  // Connect to database
  await connectDatabase();

  // Load commands
  loadCommands();

  // Connect to WhatsApp
  sock = await connectToWhatsApp();
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(`\n${config.COLORS.YELLOW}⏸️  Shutting down...${config.COLORS.RESET}`);
  if (sock) {
    await sock.end();
  }
  process.exit(0);
});

main().catch(error => {
  console.error(`${config.COLORS.RED}❌ Fatal Error: ${error.message}${config.COLORS.RESET}`);
  process.exit(1);
});
