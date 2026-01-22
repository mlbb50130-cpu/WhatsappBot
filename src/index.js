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
    // Browser Configuration - Imiter un vrai client
    browser: ['TetsuBot', 'Chrome', '120.0.0.0'],
    
    // Session Management
    markOnlineOnConnect: true,
    syncFullHistory: false,
    shouldIgnoreJid: (jid) => jid.includes('broadcast'),
    
    // Connection Settings
    maxMsToWaitForConnection: 60000,
    retryRequestDelayMs: 5000,
    keepAliveIntervalMs: 30000,
    
    // QR & Pairing Code
    pairingCodeTimeoutMs: 120000,
    
    // Link Preview & Media
    generateHighQualityLinkPreview: true,
    
    // Connection Behavior
    emitOwnEventsUnfiltered: true,
    defaultQueryTimeoutMs: 60000,
    
    // Compatibility
    version: [2, 2407, 3],
  });

  // Save credentials when updated
  sock.ev.on('creds.update', saveCreds);

  // Connection update handler
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr, isNewLogin, receivedPendingNotifications } = update;

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
        console.log('📱 QR Code (base64):', qr.substring(0, 50) + '...');
      }
      
      console.log('\n✅ Étapes:');
      console.log('1. Ouvrez WhatsApp sur votre téléphone');
      console.log('2. Menu > Paramètres > Appareils liés > Nouvel appareil');
      console.log('3. Scannez le code QR ci-dessus');
      console.log('4. Attendez 30-60 secondes pour la connexion\n');
    }

    // Connection states
    if (connection === 'connecting') {
      if (!qrShown) {
        console.log('⏳ Connexion à WhatsApp (établissement du tunnel)...');
      }
    }

    if (connection === 'open') {
      console.log('\n✅ BOT CONNECTÉ AVEC SUCCÈS!\n');
      console.log(`📱 ID Utilisateur: ${sock.user?.id || 'inconnu'}`);
      console.log(`📱 Nom: ${sock.user?.name || 'inconnu'}`);
      qrShown = false;
    }

    if (connection === 'close') {
      qrShown = false;
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      const reason = lastDisconnect?.error?.message || 'Raison inconnue';
      
      console.log(`\n⚠️  Connexion fermée`);
      console.log(`Status Code: ${statusCode}`);
      console.log(`Raison: ${reason}`);
      
      // Gérer les différents codes d'erreur
      if (statusCode === 405) {
        console.log('\n❌ Erreur 405: Connection Failure');
        console.log('📌 Causes possibles:');
        console.log('   1. WhatsApp bloque ce numéro temporairement');
        console.log('   2. "Appareils liés" est désactivé/indisponible');
        console.log('   3. Trop de tentatives de connexion');
        console.log('   4. WhatsApp détecte une activité suspecte\n');
        console.log('💡 Solutions:');
        console.log('   ✓ Attendez 24-48h avant de réessayer');
        console.log('   ✓ Utilisez un autre numéro WhatsApp');
        console.log('   ✓ Supprimez whatsapp_auth et relancez');
        console.log('   ✓ Assurez-vous que "Appareils liés" est actif\n');
        console.log('🔄 Nouvelle tentative dans 120 secondes...\n');
        setTimeout(() => connectToWhatsApp(), 120000);
      } else if (statusCode === 401) {
        console.log('\n❌ Erreur 401: Unauthorized');
        console.log('🔄 Suppression de la session et reconnexion...\n');
        if (fs.existsSync('./whatsapp_auth')) {
          fs.rmSync('./whatsapp_auth', { recursive: true });
        }
        setTimeout(() => connectToWhatsApp(), 5000);
      } else if (statusCode === 408) {
        console.log('\n⚠️  Erreur 408: Request Timeout');
        console.log('🔄 Tentative de reconnexion dans 15 secondes...\n');
        setTimeout(() => connectToWhatsApp(), 15000);
      } else {
        console.log('\n🔄 Tentative de reconnexion dans 10 secondes...\n');
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
