const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const config = require('./config');
const { connectDatabase } = require('./database');
const { loadCommands, handleMessage } = require('./handler');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

let sock = null;
let qrShown = false;

async function connectToWhatsApp() {
  qrShown = false;
  
  // Ensure sessions directory exists
  const sessionDir = config.SESSION_DIR;
  console.log(`📁 Session directory: ${sessionDir}`);
  
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
    console.log(`✅ Created session directory: ${sessionDir}`);
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket({
    auth: state,
    logger: require('pino')({ level: 'silent' }),
    browser: ['Ubuntu', 'Chrome', '120.0.0.1'],
    syncFullHistory: false,
    shouldIgnoreJid: (jid) => jid.includes('broadcast'),
    generateHighQualityLinkPreview: true,
    printQRInTerminal: false,
  });

  // Save credentials when updated
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Display QR Code when generated
    if (qr) {
      qrShown = true;
      console.log('\n╔════════════════════════════════════════╗');
      console.log('║  📱 SCAN THIS QR WITH WHATSAPP       ║');
      console.log('╚════════════════════════════════════════╝\n');
      
      try {
        qrcode.generate(qr, { small: true });
      } catch (err) {
        console.log(qr);
      }
      
      console.log('\n✅ Steps:');
      console.log('1. Open WhatsApp');
      console.log('2. Menu > Linked Devices > New Device');
      console.log('3. Scan QR code above');
      console.log('4. Wait for connection\n');
    }

    // Connection states
    if (connection === 'connecting') {
      console.log('⏳ Connecting to WhatsApp...');
    }

    if (connection === 'open') {
      console.log('\n✅ BOT CONNECTED!\n');
      qrShown = false;
    }

    if (connection === 'close') {
      qrShown = false;
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== 401;
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      
      console.log(`\n⚠️  Disconnected. Status Code: ${statusCode}`);
      
      if (statusCode === 401) {
        console.log(`\n❌ SESSION EXPIRÉE - Authentification invalide`);
        console.log(`\n🔄 Supprimer le dossier de session et relancer:`);
        console.log(`   rm -rf whatsapp_auth/ (ou supprimer le dossier manuellement)`);
        console.log(`   npm start`);
        process.exit(1);
      }
      
      if (shouldReconnect) {
        console.log('⏳ Tentative de reconnexion dans 10s...');
        setTimeout(() => connectToWhatsApp(), 10000);
      } else {
        console.log('❌ Impossible de se reconnecter. Session invalide.');
        process.exit(1);
      } else {
        console.log('❌ Logout. Delete whatsapp_auth folder and restart.');
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
