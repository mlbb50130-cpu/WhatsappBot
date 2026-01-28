const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const config = require('./config');
const { connectDatabase } = require('./database');
const { loadCommands, handleMessage } = require('./handler');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { getGroupMetadataWithCache, invalidateGroupCache } = require('./utils/metadataCache');

let sock = null;
let qrShown = false;

async function connectToWhatsApp() {
  qrShown = false;
  
  // Ensure sessions directory exists
  if (!fs.existsSync('./tetsubot_session')) {
    fs.mkdirSync('./tetsubot_session', { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState('./whatsapp_auth');

  // Récupérer la dernière version de Baileys
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`[BAILEYS] Using version: ${version.join('.')}, isLatest: ${isLatest}`);

  sock = makeWASocket({
    version,
    auth: state,
    logger: require('pino')({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
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
      
      if (shouldReconnect) {
        console.log('⚠️  Disconnected. Reconnecting in 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        return connectToWhatsApp();
      } else {
        console.log('❌ Logout. Delete tetsubot_session folder and restart.');
      }
    }
  });

  // Handle messages
  sock.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0];
    if (!message.message) return;

    // Extract message content (Baileys 7.0 compatible)
    let messageContent = '';
    if (message.message.conversation) {
      messageContent = message.message.conversation;
    } else if (message.message.extendedTextMessage?.text) {
      messageContent = message.message.extendedTextMessage.text;
    }

    console.log(`[MESSAGE] Received: ${messageContent}`);

    const senderJid = message.key.remoteJid;
    const isGroup = senderJid.endsWith('@g.us');

    // Get group data if in group with cache and retry
    let groupData = null;
    if (isGroup) {
      groupData = await getGroupMetadataWithCache(sock, senderJid);
    }

    // Handle message
    await handleMessage(sock, message, isGroup, groupData);
  });

  // Handle group updates
  sock.ev.on('groups.upsert', async (updates) => {
    for (const update of updates) {
      console.log(`${config.COLORS.CYAN}📢 Group update: ${update.subject}${config.COLORS.RESET}`);
      
      try {
        const Group = require('./models/Group');
        const ModuleManager = require('./utils/ModuleManager');
        const PackManager = require('./utils/PackManager');
        let group = await Group.findOne({ groupJid: update.id });
        
        // Si le groupe n'existe pas encore (nouveau groupe)
        if (!group) {
          // Créer l'entrée du groupe
          group = new Group({
            groupJid: update.id,
            groupName: update.subject,
            isActive: false
          });
          await group.save();

          // Initialiser avec le pack par défaut (Otaku)
          PackManager.applyPack('otaku', update.id);
          
          // Envoyer le message de sélection de pack
          await sock.sendMessage(update.id, {
            text: PackManager.getPackMessage()
          });

          // Créer une clé de session pour tracker la sélection en cours
          if (!global.packSelections) {
            global.packSelections = {};
          }
          global.packSelections[update.id] = true;
          
          // Envoyer un message d'accueil
          await sock.sendMessage(update.id, {
            text: '👋 *Bienvenue!* 🎉\n\n' +
                  'Je suis **TetsuBot** - Un bot RPG pour votre groupe!\n\n' +
                  '📚 *DOCUMENTATION COMPLÈTE:*\n' +
                  'Tape `!documentation` pour lire la documentation détaillée\n' +
                  '(Accessible même sans activation!)\n\n' +
                  '⚙️ *Pour m\'activer dans ce groupe:*\n' +
                  'Mon propriétaire doit envoyer: `!activatebot`\n\n' +
                  '📞 Contactez le propriétaire: @22954959093\n\n' +
                  '🚀 Une fois activé, vous pourrez:\n' +
                  '• Gagner de l\'XP et monter de niveau\n' +
                  '• Participer à des quêtes quotidiennes\n' +
                  '• Affronter d\'autres joueurs en duel\n' +
                  '• Ouvrir des loots aléatoires\n' +
                  '• Voir des images anime\n' +
                  '• Et bien plus!\n\n' +
                  '⏳ En attente d\'activation...',
            mentions: ['22954959093@s.whatsapp.net']
          });
          
          console.log(`[NEW GROUP] ${update.subject} - Waiting for activation`);
        }
      } catch (error) {
        console.error('[GROUP UPDATE ERROR]', error.message);
      }
    }
  });

  // Handle participant updates (nouveau membre / membre qui part)
  sock.ev.on('group-participants.update', async (update) => {
    console.log(`${config.COLORS.CYAN}👥 Group participants update in ${update.id}${config.COLORS.RESET}`);
    
    try {
      const groupJid = update.id;
      const action = update.action; // 'add' ou 'remove'
      const participants = update.participants;
      const Group = require('./models/Group');
      let groupDoc = await Group.findOne({ groupJid }).catch(() => null);
      if (!groupDoc) {
        groupDoc = new Group({
          groupJid,
          groupName
        });
        await groupDoc.save();
      }
      const autoWelcome = groupDoc?.features?.autoWelcome ?? true;
      const autoGoodbye = groupDoc?.features?.autoGoodbye ?? true;
      
      // Récupérer les infos du groupe avec cache
      let groupName = groupJid;
      try {
        const groupMetadata = await getGroupMetadataWithCache(sock, groupJid);
        if (groupMetadata) {
          groupName = groupMetadata.subject;
        }
      } catch (e) {
        // Ignore if group metadata fails
      }
      
      if (action === 'add' && autoWelcome) {
        // Nouveau membre
        for (const participant of participants) {
          const userName = participant.split('@')[0];
          const userTag = `@${userName.replace(/[^0-9]/g, '')}`;
          const customWelcome = groupDoc?.messages?.welcome;
          const defaultWelcome = `
╔════════════════════════════════════════╗
║   👋 BIENVENUE DANS LE GROUPE! 🎉      ║
╚════════════════════════════════════════╝

Bienvenue ${userTag} dans *${groupName}*! 🌟

Je suis **TetsuBot** - Un bot RPG interactif pour WhatsApp!

📚 *POUR COMMENCER:*
Envoie \`!documentation\` pour voir toutes mes commandes
(Accessible même sans activation du bot)

📊 *CE QUE TU PEUX FAIRE:*
✨ Gagner de l'XP et monter de niveau
📜 Participer à des quêtes quotidiennes  
⚔️ Affronter d'autres joueurs en duel
🎲 Ouvrir des loots aléatoires
📺 Voir des images anime
🎮 Jouer à des quiz
🏆 Participer à des tournois

💡 *BESOIN D'AIDE?*
Tape \`!help\` pour avoir les commandes disponibles

Amusez-vous bien! 🎊`;
          const welcomeText = (customWelcome || defaultWelcome)
            .replace(/\{user\}/g, userTag)
            .replace(/\{group\}/g, groupName);
          
          await sock.sendMessage(groupJid, {
            text: welcomeText,
            mentions: [participant]
          });
        }
      } else if (action === 'remove' && autoGoodbye) {
        // Membre qui part
        for (const participant of participants) {
          const userName = participant.split('@')[0];
          const userTag = `@${userName.replace(/[^0-9]/g, '')}`;
          const customGoodbye = groupDoc?.messages?.goodbye;
          const defaultGoodbye = `
╔════════════════════════════════════════╗
║    👋 UN MEMBRE NOUS QUITTE 😢        ║
╚════════════════════════════════════════╝

${userTag} a quitté le groupe *${groupName}*

Merci d'avoir participé! À bientôt! 🤗`;
          const goodbyeText = (customGoodbye || defaultGoodbye)
            .replace(/\{user\}/g, userTag)
            .replace(/\{group\}/g, groupName);
          
          await sock.sendMessage(groupJid, {
            text: goodbyeText,
            mentions: [participant]
          });
        }
      }
    } catch (error) {
      console.error('[PARTICIPANTS UPDATE ERROR]', error.message);
    }
  });

  // Handle errors
  sock.ev.on('error', (error) => {
    console.error('[SOCKET ERROR]', error);
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

  // Start equipment passive XP scheduler
  const EquipmentPassiveXP = require('./utils/equipmentPassiveXP');
  setInterval(() => {
    EquipmentPassiveXP.applyPassiveEquipmentXP();
  }, 3600000); // Toutes les heures (3600000ms)
  console.log(`${config.COLORS.GREEN}📦 Equipment Passive XP Scheduler started (every 1 hour)${config.COLORS.RESET}`);

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
