const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const config = require('./config');
const { connectDatabase } = require('./database');
const { loadCommands, handleMessage } = require('./handler');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

let sock = null;
let qrDisplayed = false;
let connectionTimeout;

async function connectToWhatsApp() {
  qrDisplayed = false;
  
  // Créer le dossier session s'il n'existe pas
  if (!fs.existsSync(config.SESSION_DIR)) {
    fs.mkdirSync(config.SESSION_DIR, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(config.SESSION_DIR);

  // Configuration minimaliste et stable
  sock = makeWASocket({
    auth: state,
    logger: require('pino')({ level: 'silent' }),
    browser: ['TetsuBot', 'Chrome', '120.0.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    emitOwnEventsUnfiltered: true,
    pairingCodeTimeoutMs: 120000,
    maxMsToWaitForConnection: 120000,
    retryRequestDelayMs: 5000,
    keepAliveIntervalMs: 30000,
    version: [2, 2407, 3],
  });

  // Sauvegarder les credentials
  sock.ev.on('creds.update', saveCreds);

  // Événement pour le QR code direct
  sock.ev.on('qr', (qr) => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  📱 QR CODE GÉNÉRÉ PAR BAILEYS       ║');
    console.log('╚════════════════════════════════════════╝\n');
    try {
      const qrcode = require('qrcode-terminal');
      qrcode.generate(qr, { small: true });
    } catch (err) {
      console.log('QR:', qr);
    }
    qrDisplayed = true;
  });

  // Timer pour afficher un message d'attente du QR
  connectionTimeout = setTimeout(() => {
    if (!qrDisplayed) {
      console.log('⏳ En attente du QR code...');
    }
  }, 5000);

  // Gestion de la connexion
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr, isNewLogin, pairingCode } = update;

    // Afficher le QR code
    if (qr) {
      clearTimeout(connectionTimeout);
      qrDisplayed = true;
      console.log('\n╔════════════════════════════════════════╗');
      console.log('║  📱 SCANNER AVEC WHATSAPP            ║');
      console.log('╚════════════════════════════════════════╝\n');
      try {
        qrcode.generate(qr, { small: true });
      } catch (err) {
        console.log('QR Code (base64):', qr);
      }
      console.log('\nÉtapes:');
      console.log('1. Ouvrez WhatsApp sur votre téléphone');
      console.log('2. Menu > Paramètres > Appareils liés > Nouvel appareil');
      console.log('3. Scannez le code QR ci-dessus');
      console.log('⏱️  Délai d\'expiration: 120 secondes\n');
    }

    // Pairing code si le QR échoue
    if (pairingCode) {
      clearTimeout(connectionTimeout);
      console.log('\n📌 Code d\'appairage (alternative au QR):\n');
      console.log(pairingCode.match(/.{1,4}/g).join('-'));
      console.log('\n');
    }

    if (connection === 'connecting') {
      console.log('⏳ Connexion en cours...');
    }

    if (connection === 'open') {
      clearTimeout(connectionTimeout);
      console.log('\n✅ BOT CONNECTÉ AVEC SUCCÈS!\n');
    }

    if (connection === 'close') {
      clearTimeout(connectionTimeout);
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      const reason = lastDisconnect?.error?.message || 'Raison inconnue';
      
      console.log(`\n⚠️  Déconnexion`);
      console.log(`   Status: ${statusCode}`);
      console.log(`   Raison: ${reason}`);
      
      if (statusCode === 405) {
        console.log('\n❌ ERREUR 405: Connection Failure');
        console.log('╔════════════════════════════════════════╗');
        console.log('║  ⛔ CE NUMÉRO EST BLOQUÉ PAR WHATSAPP  ║');
        console.log('╚════════════════════════════════════════╝\n');
        console.log('Le QR code NE peut PAS être généré car:');
        console.log('  • WhatsApp a bloqué ce numéro');
        console.log('  • Trop de tentatives de connexion');
        console.log('  • "Appareils liés" est désactivé/indisponible\n');
        console.log('SOLUTIONS:\n');
        console.log('  1️⃣  ATTENDRE 24-48h');
        console.log('     WhatsApp débloquera automatiquement\n');
        console.log('  2️⃣  UTILISER UN AUTRE NUMÉRO');
        console.log('     Assurez-vous que "Appareils liés" est ACTIF\n');
        console.log('  3️⃣  VÉRIFIER WHATSAPP WEB');
        console.log('     Allez sur web.whatsapp.com');
        console.log('     Si ça fonctionne, le numéro n\'est pas bloqué\n');
        console.log('🔄 Nouvelle tentative dans 120 secondes...\n');
        setTimeout(() => connectToWhatsApp(), 120000);
      } else if (statusCode === 401) {
        console.log('\n❌ Erreur 401: Session invalide');
        if (fs.existsSync(config.SESSION_DIR)) {
          fs.rmSync(config.SESSION_DIR, { recursive: true });
        }
        setTimeout(() => connectToWhatsApp(), 5000);
      } else {
        console.log('🔄 Reconnexion dans 10 secondes...\n');
        setTimeout(() => connectToWhatsApp(), 10000);
      }
    }
  });

  // Gestion des messages
  sock.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0];
    if (!message.message) return;

    const senderJid = message.key.remoteJid;
    const isGroup = senderJid.endsWith('@g.us');

    let groupData = null;
    if (isGroup) {
      try {
        groupData = await sock.groupMetadata(senderJid);
      } catch (error) {
        // Ignorer
      }
    }

    await handleMessage(sock, message, isGroup, groupData);
  });

  return sock;
}

async function main() {
  console.log('\n🤖 TetsuBot - WhatsApp Bot\n');

  // Connexion à MongoDB
  await connectDatabase();

  // Charger les commandes
  loadCommands();

  // Connexion à WhatsApp
  sock = await connectToWhatsApp();
}

// Arrêt gracieux
process.on('SIGINT', async () => {
  console.log('\n⏸️  Arrêt...');
  if (sock) {
    await sock.end();
  }
  process.exit(0);
});

main().catch(error => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});
