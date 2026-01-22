const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const config = require('./config');
const { connectDatabase } = require('./database');
const { loadCommands, handleMessage } = require('./handler');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

let sock = null;

async function connectToWhatsApp() {
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
    pairingCodeTimeoutMs: 120000,
  });

  // Sauvegarder les credentials
  sock.ev.on('creds.update', saveCreds);

  // Gestion de la connexion
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📱 QR Code généré!\n');
      try {
        qrcode.generate(qr, { small: true });
      } catch (err) {
        console.log('QR:', qr);
      }
      console.log('\n1. Ouvrez WhatsApp');
      console.log('2. Paramètres > Appareils liés > Nouvel appareil');
      console.log('3. Scannez le QR code\n');
    }

    if (connection === 'connecting') {
      console.log('⏳ Connexion...');
    }

    if (connection === 'open') {
      console.log('\n✅ BOT CONNECTÉ!\n');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      
      if (statusCode === 405) {
        console.log('\n❌ Erreur 405: WhatsApp a refusé la connexion');
        console.log('Attendez 24-48h ou utilisez un autre numéro\n');
        setTimeout(() => connectToWhatsApp(), 120000);
      } else if (statusCode === 401) {
        console.log('\n❌ Erreur 401: Session invalide');
        if (fs.existsSync(config.SESSION_DIR)) {
          fs.rmSync(config.SESSION_DIR, { recursive: true });
        }
        setTimeout(() => connectToWhatsApp(), 5000);
      } else {
        console.log('\n⏳ Reconnexion...\n');
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
