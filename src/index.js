const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const QRCode = require('qrcode');
const config = require('./config');
const { connectDatabase } = require('./database');
const { loadCommands, handleMessage } = require('./handler');
const { createWebServer, updateBotStats, incrementStat } = require('./webserver');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

let sock = null;
let isReady = false;
let pairingCodeGenerated = false;

async function connectToWhatsApp() {
  try {
    pairingCodeGenerated = false;
    
    // Créer le dossier auth
    const authPath = path.join(__dirname, '../whatsapp_auth');
    if (!fs.existsSync(authPath)) {
      fs.mkdirSync(authPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    // Créer la socket
    sock = makeWASocket({
      auth: state,
      logger: P({ level: 'silent' }),
      browser: ['TetsuBot', 'Chrome', '120.0.0.1'],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      pairingCodeTimeoutMs: 60000,
    });

    // Sauvegarder les credentials
    sock.ev.on('creds.update', saveCreds);

  // Handle connection updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // QR Code + Pairing Code
    if (qr && !pairingCodeGenerated) {
      pairingCodeGenerated = true;
      
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║              📱 SCAN THE QR CODE WITH WHATSAPP              ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      
      try {
        qrcode.generate(qr, { small: true });
      } catch (err) {
        console.log('QR Code:\n' + qr);
      }
      
      console.log('\n👉 Steps:');
      console.log('1. Open WhatsApp on your phone');
      console.log('2. Menu > Linked Devices > New Device');
      console.log('3. Scan the QR code above');
      console.log('4. Wait for connection\n');
    }

    if (connection === 'connecting') {
      console.log('⏳ Connecting to WhatsApp...');
    }

    if (connection === 'open') {
      pairingCodeGenerated = false;
      isReady = true;
      updateBotStats({ connected: true });
      console.log('\n✅ BOT CONNECTED!\n');
    }

    if (connection === 'close') {
      pairingCodeGenerated = false;
      isReady = false;
      updateBotStats({ connected: false });
      isReady = false;
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== 401;
      
      console.log('[CONNECTION] Disconnect reason:', lastDisconnect?.error?.message);
      
      if (shouldReconnect) {
        console.log('⚠️  Disconnected. Reconnecting in 10 seconds...');
        setTimeout(() => connectToWhatsApp(), 10000);
      } else {
        console.log('❌ Logout detected. Please delete whatsapp_auth folder and restart.');
      }
    }
  });

  // Handle messages with error catching
  sock.ev.on('messages.upsert', async (m) => {
    try {
      console.log('[MESSAGE] Event triggered:', m.messages?.length);
      
      if (!m || !m.messages || m.messages.length === 0) {
        console.log('[MESSAGE] No messages in event');
        return;
      }
      
      const message = m.messages[0];
      
      // Extract text from different message formats (Baileys 7.0 compatibility)
      let messageText = '';
      if (message.message?.conversation) {
        messageText = message.message.conversation;
      } else if (message.message?.extendedTextMessage?.text) {
        messageText = message.message.extendedTextMessage.text;
      } else if (message.body) {
        messageText = message.body;
      }
      
      console.log('[MESSAGE] Message received:', message.key?.remoteJid, messageText || '[no text]');
      
      // Ignore messages without text content
      if (!messageText) {
        console.log('[MESSAGE] No text content in message (may be media/status)');
        return;
      }

      const senderJid = message.key?.remoteJid;
      if (!senderJid) {
        console.log('[MESSAGE] No sender JID');
        return;
      }

      console.log('[MESSAGE] Processing message from:', senderJid, 'Text:', messageText);
      const isGroup = senderJid.endsWith('@g.us');
      console.log('[MESSAGE] Is group:', isGroup);

      // Get group data if in group
      let groupData = null;
      if (isGroup) {
        try {
          groupData = await sock.groupMetadata(senderJid);
          console.log('[MESSAGE] Group metadata retrieved:', groupData?.subject);
        } catch (error) {
          console.error('[MESSAGE] Error fetching group metadata:', error.message);
        }
      }

      // Handle message
      console.log('[MESSAGE] Calling handleMessage...');
      
      // Add timeout to prevent blocking
      const handleMessagePromise = handleMessage(sock, message, isGroup, groupData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Message handling timeout')), 30000)
      );
      
      try {
        await Promise.race([handleMessagePromise, timeoutPromise]);
      } catch (timeoutError) {
        console.error('[MESSAGE] Handler timeout or error:', timeoutError.message);
      }
      
      console.log('[MESSAGE] Message processed successfully');
    } catch (error) {
      console.error('❌ Error handling message:', error.message);
      console.error(error.stack);
    }
  });

  // Handle group updates
  sock.ev.on('groups.upsert', (updates) => {
    try {
      if (updates && Array.isArray(updates)) {
        // Désactiver les logs pour éviter le spam
        // for (const update of updates) {
        //   console.log(`📢 Group update: ${update.subject}`);
        // }
      }
    } catch (error) {
      console.error('Error handling group update:', error.message);
    }
  });

  // Désactiver les logs de participant updates (cause du spam)
  // sock.ev.on('group-participants.update', (update) => {
  //   try {
  //     if (update) {
  //       console.log(`👥 Group participants update`);
  //     }
  //   } catch (error) {
  //     console.error('Error handling participant update:', error.message);
  //   }
  // });

  // Handle socket errors BEFORE closing
  sock.ev.on('error', (error) => {
    console.error('❌ [SOCKET ERROR] Socket error:', error);
    console.error(error.stack);
  });

  // Handle disconnection errors
  sock.ev.on('connection.error', (error) => {
    console.error('❌ [CONNECTION ERROR] Connection error:', error);
    console.error(error.stack);
  });

  return sock;
  
  } catch (error) {
    console.error('❌ [CONNECT ERROR] Error in connectToWhatsApp:', error);
    console.error(error.stack);
    throw error;
  }
}

async function main() {
  try {
    console.log(`🤖 TetsuBot - Otaku RPG WhatsApp Bot`);
    console.log(`═══════════════════════════════════\n`);

    // Démarrer le serveur web
    createWebServer(process.env.PORT || 3000);

    // Connect to database
    await connectDatabase();

    // Load commands
    loadCommands();

    // Connect to WhatsApp
    sock = await connectToWhatsApp();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    console.log(`\n⏸️  Shutting down... (SIGINT received)`);
    console.trace('SIGINT Stack trace');
    if (sock) {
      await sock.end();
    }
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error.message);
    process.exit(1);
  }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit - keep running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - keep running
});

// Start the bot
main();
