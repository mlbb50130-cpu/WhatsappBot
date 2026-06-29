const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const config = require('./config');
const { connectDatabase } = require('./database');
const { loadCommands, handleMessage } = require('./handler');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { getGroupMetadataWithCache, invalidateGroupCache } = require('./utils/metadataCache');
const MessageFormatter = require('./utils/messageFormatter');
const BotSettings = require('./models/BotSettings');
const { rememberContactIdentity, rememberMessageIdentity } = require('./utils/jid');

let sock = null;
let qrShown = false;
let atlasRecapAnnouncementStarted = false;
let atlasRecapEmptyGroupRetries = 0;
const recentMessages = new Map();
const RECENT_MESSAGE_TTL = 15 * 60 * 1000;
const RECENT_MESSAGE_MAX = 500;
const ATLAS_RECAP_ANNOUNCEMENT_KEY = 'atlasCommandRecapV2';
const ATLAS_RECAP_FILE = path.join(__dirname, '..', 'ATLAS_COMMANDES_RECAP.txt');
const ATLAS_RECAP_MAX_EMPTY_GROUP_RETRIES = 3;
const ATLAS_RECAP_OPEN_DELAY_MS = 30000;
const ATLAS_RECAP_GROUP_DELAY_MS = 4500;

function installCompactMessageFormatter(socket) {
  const sendMessage = socket.sendMessage.bind(socket);

  socket.sendMessage = async (jid, content, options) => {
    return sendMessage(jid, MessageFormatter.formatOutgoingContent(content), options);
  };
}

function recentMessageKey(key = {}) {
  if (!key.remoteJid || !key.id) return '';
  return `${key.remoteJid}:${key.id}`;
}

function rememberMessage(message) {
  if (!message?.key?.id || !message?.key?.remoteJid || !message.message) return;
  if (message.message.protocolMessage) return;

  const key = recentMessageKey(message.key);
  if (!key) return;

  recentMessages.set(key, {
    message,
    storedAt: Date.now(),
  });

  if (recentMessages.size > RECENT_MESSAGE_MAX) {
    const firstKey = recentMessages.keys().next().value;
    if (firstKey) recentMessages.delete(firstKey);
  }
}

function cleanupRecentMessages() {
  const now = Date.now();
  for (const [key, value] of recentMessages.entries()) {
    if (now - value.storedAt > RECENT_MESSAGE_TTL) {
      recentMessages.delete(key);
    }
  }
}

async function handleAntiDelete(sock, message, senderJid) {
  const protocol = message.message?.protocolMessage;
  if (!protocol || protocol.type !== 0 || !protocol.key?.id) return false;

  const deletedId = protocol.key.id;
  if (global.botDeletedMsgIds?.has(deletedId)) return true;

  const originalJid = protocol.key.remoteJid || senderJid;
  const cacheKey = recentMessageKey({ remoteJid: originalJid, id: deletedId });
  const cached = recentMessages.get(cacheKey)?.message;
  if (!cached) return false;

  const Group = require('./models/Group');
  const group = await Group.findOne({ groupJid: senderJid }).catch(() => null);
  if (!group?.features?.antiDelete) return false;

  const deletedBy = message.key.participant || message.key.remoteJid;
  await sock.sendMessage(senderJid, {
    text: MessageFormatter.panel({
      title: 'Anti-delete',
      body: [`Message supprime par @${deletedBy.split('@')[0]}`],
    }),
    mentions: [deletedBy],
  }).catch(() => null);

  await sock.sendMessage(senderJid, { forward: cached }).catch(async () => {
    await sock.sendMessage(senderJid, {
      text: MessageFormatter.warning('Message supprime detecte, mais impossible de le restaurer.'),
    }).catch(() => null);
  });

  return true;
}

async function getCurrentGroupJids(socket) {
  try {
    if (typeof socket.groupFetchAllParticipating === 'function') {
      const groups = await socket.groupFetchAllParticipating();
      return Object.keys(groups || {}).filter((jid) => jid.endsWith('@g.us'));
    }
  } catch (error) {
  }

  try {
    const Group = require('./models/Group');
    const groups = await Group.find({}).select('groupJid').lean();
    return groups.map((group) => group.groupJid).filter((jid) => jid && jid.endsWith('@g.us'));
  } catch (error) {
    return [];
  }
}

async function sendAtlasCommandRecapOnce(socket) {
  if (atlasRecapAnnouncementStarted) return;
  atlasRecapAnnouncementStarted = true;

  try {
    const settings = await BotSettings.getGlobal();
    const announcement = settings.announcements?.[ATLAS_RECAP_ANNOUNCEMENT_KEY];

    const failedPreviously = Array.isArray(announcement?.failedGroups) ? announcement.failedGroups : [];

    if (announcement?.sentAt && failedPreviously.length === 0) {
      return;
    }

    const alreadySentGroups = new Set(Array.isArray(announcement?.groups) ? announcement.groups : []);
    await BotSettings.updateOne(
      { key: 'global' },
      { $set: { [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.attemptedAt`]: new Date() } },
      { upsert: true }
    );

    const fileBuffer = await fs.promises.readFile(ATLAS_RECAP_FILE);
    const groupJids = await getCurrentGroupJids(socket);

    if (groupJids.length === 0 && atlasRecapEmptyGroupRetries < ATLAS_RECAP_MAX_EMPTY_GROUP_RETRIES) {
      atlasRecapEmptyGroupRetries += 1;
      atlasRecapAnnouncementStarted = false;
      setTimeout(() => {
        sendAtlasCommandRecapOnce(socket).catch((error) => {
        });
      }, 30000);
      return;
    }

    if (groupJids.length === 0) {
      return;
    }

    const pendingGroupJids = groupJids.filter((groupJid) => !alreadySentGroups.has(groupJid));
    const sentGroups = [];
    const failedGroups = [];

    if (pendingGroupJids.length === 0) {
      await BotSettings.updateOne(
        { key: 'global' },
        {
          $set: {
            [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.sentAt`]: new Date(),
            [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.groupCount`]: alreadySentGroups.size,
            [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.failedGroups`]: [],
          },
        },
        { upsert: true }
      );
      return;
    }

    for (const groupJid of pendingGroupJids) {
      try {
        await socket.sendMessage(groupJid, {
          document: fileBuffer,
          mimetype: 'text/plain',
          fileName: 'ATLAS_COMMANDES_RECAP.txt',
          caption: MessageFormatter.panel({
            title: 'Nouvelles commandes',
            body: [
              'Recapitulatif des commandes Atlas ajoutees a Kassim-bot.',
              'Ce fichier est envoye une seule fois apres ce redeploiement.',
            ],
          }),
        });
        sentGroups.push(groupJid);
        alreadySentGroups.add(groupJid);
        await BotSettings.updateOne(
          { key: 'global' },
          { $addToSet: { [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.groups`]: groupJid } },
          { upsert: true }
        );
        await new Promise((resolve) => setTimeout(resolve, ATLAS_RECAP_GROUP_DELAY_MS));
      } catch (error) {
        failedGroups.push(groupJid);
      }
    }

    const update = failedGroups.length === 0
      ? {
        $set: {
          [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.sentAt`]: new Date(),
          [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.groupCount`]: alreadySentGroups.size,
          [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.groups`]: Array.from(alreadySentGroups),
          [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.failedGroups`]: [],
        },
      }
      : {
        $set: {
          [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.groupCount`]: alreadySentGroups.size,
          [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.groups`]: Array.from(alreadySentGroups),
          [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.failedGroups`]: failedGroups,
        },
        $unset: {
          [`announcements.${ATLAS_RECAP_ANNOUNCEMENT_KEY}.sentAt`]: '',
        },
      };

    await BotSettings.updateOne(
      { key: 'global' },
      update,
      { upsert: true }
    );

  } catch (error) {
  } finally {
    atlasRecapAnnouncementStarted = false;
  }
}

async function connectToWhatsApp() {
  qrShown = false;
  
  // Ensure sessions directory exists
  if (!fs.existsSync('./tetsubot_session')) {
    fs.mkdirSync('./tetsubot_session', { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState('./whatsapp_auth');

  // Récupérer la dernière version de Baileys
  const { version, isLatest } = await fetchLatestBaileysVersion();

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
  installCompactMessageFormatter(sock);

  // Save credentials when updated
  sock.ev.on('creds.update', saveCreds);

  // Connexion par PAIRING CODE (au lieu du QR) si un numero est configure.
  // Multi-device natif: on lie le bot via "Connecter avec le numero de telephone".
  if (config.USE_PAIRING_CODE && !sock.authState.creds.registered) {
    if (!config.PHONE_NUMBER) {
      console.log('⚠️ USE_PAIRING_CODE actif mais aucun BOT_PHONE_NUMBER configure. Fallback QR.');
    } else {
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(config.PHONE_NUMBER);
          const pretty = code && code.match(/.{1,4}/g) ? code.match(/.{1,4}/g).join('-') : code;
          console.log('\n================= PAIRING CODE =================');
          console.log(`📱 Numero : +${config.PHONE_NUMBER}`);
          console.log(`🔗 Code   : ${pretty}`);
          console.log('WhatsApp > Appareils connectes > Connecter un appareil');
          console.log('   > Connecter avec le numero de telephone > saisir le code');
          console.log('===============================================\n');
        } catch (err) {
          console.log('❌ Echec du pairing code:', err && err.message ? err.message : err);
        }
      }, 3000);
    }
  }

  sock.ev.on('contacts.upsert', (contacts = []) => {
    contacts.forEach(rememberContactIdentity);
  });

  sock.ev.on('contacts.update', (updates = []) => {
    updates.forEach(rememberContactIdentity);
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Display QR Code when generated (sauf si on utilise le pairing code)
    if (qr && !config.USE_PAIRING_CODE) {
      qrShown = true;
      try {
        qrcode.generate(qr, { small: true });
      } catch (err) {
      }
    }

    // Connection states
    if (connection === 'open') {
      qrShown = false;
      setTimeout(() => {
        sendAtlasCommandRecapOnce(sock).catch((error) => {
        });
      }, ATLAS_RECAP_OPEN_DELAY_MS);
    }

    if (connection === 'close') {
      qrShown = false;
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== 401;
      
      if (shouldReconnect) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return connectToWhatsApp();
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


    const senderJid = message.key.remoteJid;
    const isGroup = senderJid.endsWith('@g.us');

    if (isGroup) {
      const antiDeleteHandled = await handleAntiDelete(sock, message, senderJid);
      if (antiDeleteHandled) return;
    }

    rememberMessage(message);
    cleanupRecentMessages();

    // Get group data if in group with cache and retry
    let groupData = null;
    if (isGroup) {
      groupData = await getGroupMetadataWithCache(sock, senderJid);
    }
    rememberMessageIdentity(message, groupData?.participants || []);

    // Handle message
    await handleMessage(sock, message, isGroup, groupData);
  });

  // Handle group updates
  sock.ev.on('groups.upsert', async (updates) => {
    for (const update of updates) {
      
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
                  'Je suis **' + config.BOT_NAME + '** - Un bot RPG pour votre groupe!\n\n' +
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
          
        }
      } catch (error) {
      }
    }
  });

  // Handle participant updates (nouveau membre / membre qui part)
  sock.ev.on('group-participants.update', async (update) => {
    
    try {
      const groupJid = update.id;
      const action = update.action; // 'add' ou 'remove'
      const participants = update.participants;
      const Group = require('./models/Group');
      let groupName = update.subject || groupJid;
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
      groupName = groupJid;
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

Je suis **${config.BOT_NAME}** - Un bot RPG interactif pour WhatsApp!

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
    }
  });

  // Handle errors
  sock.ev.on('error', (error) => {
  });

  return sock;
}

async function main() {

  // Connect to database
  await connectDatabase();

  // Load commands
  loadCommands();

  // Start equipment passive XP scheduler
  const EquipmentPassiveXP = require('./utils/equipmentPassiveXP');
  setInterval(() => {
    EquipmentPassiveXP.applyPassiveEquipmentXP();
  }, 3600000); // Toutes les heures (3600000ms)

  // Connect to WhatsApp
  sock = await connectToWhatsApp();
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  if (sock) {
    await sock.end();
  }
  process.exit(0);
});

main().catch(error => {
  process.exit(1);
});
