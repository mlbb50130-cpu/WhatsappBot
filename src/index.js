const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const config = require('./config');
const { connectDatabase } = require('./database');
const { loadCommands, handleMessage } = require('./handler');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const express = require('express');
const fs = require('fs');
const path = require('path');

let sock = null;
let qrShown = false;
let currentQR = null;
const app = express();
const PORT = process.env.PORT || 3000;

// QR Code Display Route
app.get('/qr', async (req, res) => {
  if (!currentQR) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>TetsuBot QR Code</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; }
          h1 { color: #333; }
          p { color: #666; font-size: 16px; }
        </style>
      </head>
      <body>
        <h1>🤖 TetsuBot QR Code</h1>
        <p>En attente du QR code...</p>
        <p>Veuillez relancer le bot.</p>
        <script>
          setTimeout(() => location.reload(), 3000);
        </script>
      </body>
      </html>
    `);
  }

  try {
    const qrImage = await QRCode.toDataURL(currentQR);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TetsuBot QR Code</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
          }
          h1 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
          }
          img {
            max-width: 400px;
            width: 100%;
            border: 3px solid #667eea;
            border-radius: 10px;
            padding: 10px;
            background: #f5f5f5;
          }
          .instructions {
            margin-top: 30px;
            text-align: left;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .instructions h3 {
            margin: 0 0 15px 0;
            color: #333;
          }
          .instructions ol {
            margin: 0;
            padding-left: 20px;
          }
          .instructions li {
            margin: 8px 0;
            color: #555;
          }
          .status {
            margin-top: 20px;
            padding: 10px;
            background: #e8f5e9;
            border-radius: 5px;
            color: #2e7d32;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 TetsuBot</h1>
          <p class="subtitle">Scanne le QR code avec WhatsApp</p>
          <img src="${qrImage}" alt="QR Code">
          <div class="instructions">
            <h3>📱 Comment scanner:</h3>
            <ol>
              <li>Ouvre <strong>WhatsApp</strong> sur ton téléphone</li>
              <li>Va à <strong>Menu > Appareils Liés > Ajouter un Appareil</strong></li>
              <li>Scanne ce QR code</li>
              <li>Attends la confirmation</li>
            </ol>
          </div>
          <div class="status">✅ Bot en attente d'authentification</div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Erreur lors de la génération du QR code');
  }
});

app.listen(PORT, () => {
  console.log(`\n🌐 Serveur QR disponible sur: http://localhost:${PORT}/qr\n`);
});

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
      currentQR = qr;
      qrShown = true;
      const qrUrl = `http://localhost:${PORT}/qr`;
      console.log('\n╔════════════════════════════════════════╗');
      console.log('║  📱 SCAN THIS QR WITH WHATSAPP       ║');
      console.log('╚════════════════════════════════════════╝\n');
      console.log(`🔗 QR Code disponible ici: ${qrUrl}\n`);
      
      console.log('✅ Steps:');
      console.log('1. Ouvre le lien ci-dessus dans ton navigateur');
      console.log('2. Ouvre WhatsApp sur ton téléphone');
      console.log('3. Va à Menu > Appareils Liés > Ajouter un Appareil');
      console.log('4. Scanne le QR code');
      console.log('5. Attends la confirmation\n');
    }

    // Connection states
    if (connection === 'connecting') {
      console.log('⏳ Connecting to WhatsApp...');
    }

    if (connection === 'open') {
      currentQR = null; // Efface le QR une fois connecté
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
