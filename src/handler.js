const fs = require('fs');
const path = require('path');
const config = require('./config');
const User = require('./models/User');
const CooldownManager = require('./utils/cooldown');
const XPSystem = require('./utils/xpSystem');
const PermissionManager = require('./utils/permissions');
const QuestSystem = require('./utils/questSystem');
const BadgeSystem = require('./utils/badgeSystem');
const RankSystem = require('./utils/rankSystem');
const PackManager = require('./utils/PackManager');
const { buildContext, commandVisible } = require('./utils/commandCatalog');
const MessageFormatter = require('./utils/messageFormatter');
const ReactionSystem = require('./utils/reactionSystem');
const Group = require('./models/Group');
const ChatbotService = require('./services/chatbotService');
const BotAccessService = require('./services/botAccessService');

const commands = new Map();

async function sendText(sock, jid, text) {
  return sock.sendMessage(jid, { text });
}

function activationRequiredMessage(pack) {
  return MessageFormatter.panel({
    title: 'Activation requise',
    subtitle: `Bienvenue dans ${config.BOT_NAME}`,
    body: [
      `Pack ${pack.emoji} ${pack.name} sélectionné avec succès.`,
      'Un administrateur du groupe doit maintenant envoyer `!activatebot`.',
      'Les commandes `!documentation` et `!help` restent disponibles avant activation.',
    ],
  });
}

function extractText(msg) {
  if (!msg) return '';
  if (msg.ephemeralMessage?.message) return extractText(msg.ephemeralMessage.message);
  if (msg.viewOnceMessage?.message) return extractText(msg.viewOnceMessage.message);
  if (msg.viewOnceMessageV2?.message) return extractText(msg.viewOnceMessageV2.message);
  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  if (msg.videoMessage?.caption) return msg.videoMessage.caption;
  return '';
}

function getBotJid(sock) {
  const raw = sock?.user?.id || sock?.user?.jid || '';
  if (!raw) return '';
  return raw.includes(':') ? `${raw.split(':')[0]}@s.whatsapp.net` : raw;
}

function hasInviteLink(text = '') {
  return /(chat\.whatsapp\.com\/|whatsapp\.com\/channel\/|wa\.me\/)/i.test(String(text || ''));
}

async function handleAntiLink(sock, message, groupDoc, text) {
  if (!groupDoc?.features?.antiLink && !groupDoc?.permissions?.blockInviteLinks) {
    return false;
  }

  if (!hasInviteLink(text)) return false;

  const jid = message.key.remoteJid;
  const participantJid = message.key.participant || jid;
  const isAdmin = PermissionManager.canUseCommand(
    participantJid,
    { adminOnly: true },
    true,
    jid,
    participantJid,
    (await sock.groupMetadata(jid).catch(() => null))?.participants || []
  );

  if (isAdmin) return false;

  const deleteKey = {
    remoteJid: jid,
    fromMe: false,
    id: message.key.id,
    participant: message.key.participant,
  };

  if (!global.botDeletedMsgIds) global.botDeletedMsgIds = new Set();
  global.botDeletedMsgIds.add(message.key.id);
  setTimeout(() => global.botDeletedMsgIds?.delete(message.key.id), 5 * 60 * 1000);

  await sock.sendMessage(jid, { delete: deleteKey }).catch(() => null);
  await sendText(sock, jid, MessageFormatter.warning('Lien WhatsApp bloque par l antilink.'));
  return true;
}

// Load all commands dynamically
function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');

  const loadDir = (dir) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        loadDir(filePath);
      } else if (file.endsWith('.js')) {
        try {
          const command = require(filePath);
          if (command.name) {
            commands.set(command.name.toLowerCase(), command);
            if (Array.isArray(command.aliases)) {
              command.aliases.forEach((alias) => {
                const aliasName = String(alias || '').toLowerCase();
                if (aliasName && !commands.has(aliasName)) {
                  commands.set(aliasName, command);
                }
              });
            }
          }
        } catch (error) {
        }
      }
    }
  };

  loadDir(commandsPath);
}

async function getOrCreateUser(jid, username) {
  try {
    let user = await User.findOne({ jid });

    if (!user) {
      user = new User({
        jid,
        username: username || 'Anonymous',
        xp: 0,
        level: 1,
      });
      await user.save();
    }

    return user;
  } catch (error) {
    return null;
  }
}

async function addXP(jid, amount = config.XP_PER_MESSAGE) {
  try {
    const user = await User.findOne({ jid });
    if (!user) return null;

    const now = Date.now();
    const lastXpTime = user.lastXpTime ? new Date(user.lastXpTime).getTime() : 0;

    if (now - lastXpTime < config.XP_COOLDOWN) {
      return null;
    }

    user.xp += amount;
    user.stats.messages++;
    user.lastXpTime = new Date();

    const levelInfo = XPSystem.calculateLevelFromXp(user.xp);
    const oldLevel = user.level;
    user.level = levelInfo.level;

    if (levelInfo.level > oldLevel) {
      const rankInfo = XPSystem.getRank(levelInfo.level);
      user.rank = rankInfo.rank;
      user.maxChakra = 100 + (levelInfo.level - 1) * 10;

      const rankUpdate = RankSystem.checkAndUpdateRank(user);

      if (QuestSystem.needsWeeklyReset(user)) {
        QuestSystem.resetWeeklyQuests(user);
      }
      QuestSystem.updateWeeklyProgress(user, 'level', levelInfo.level);

      await user.save();

      return {
        user,
        leveledUp: true,
        oldLevel,
        newLevel: levelInfo.level,
        rankInfo,
        rankUpdate: rankUpdate.rankChanged ? rankUpdate : null,
      };
    }

    const rankUpdate = RankSystem.checkAndUpdateRank(user);
    await user.save();

    return {
      user,
      leveledUp: false,
      rankUpdate: rankUpdate.rankChanged ? rankUpdate : null,
    };
  } catch (error) {
    return null;
  }
}

async function routeDirectQuizAnswer(sock, message, senderJid, participantJid, directMessage, isGroup, groupData) {
  if (!['a', 'b', 'c', 'd'].includes(directMessage)) return false;

  if (!global.quizSessions) global.quizSessions = new Map();
  const quizSession = global.quizSessions.get(senderJid);

  if (quizSession && !quizSession.answered.has(participantJid)) {
    const reponseCommand = commands.get('reponse');
    if (reponseCommand) {
      const userLatest = await User.findOne({ jid: participantJid });
      await reponseCommand.execute(sock, message, [directMessage.toUpperCase()], userLatest, isGroup, groupData);
      return true;
    }
  }

  if (global.tournaments && global.tournaments.has(senderJid)) {
    const tournament = global.tournaments.get(senderJid);
    if (tournament.isActive) {
      const reponseCommand = commands.get('reponse');
      if (reponseCommand) {
        const userLatest = await User.findOne({ jid: participantJid });
        await reponseCommand.execute(sock, message, [directMessage.toUpperCase()], userLatest, isGroup, groupData);
        return true;
      }
    }
  }

  return false;
}

async function handlePackSelection(sock, senderJid, messageContent) {
  if (!global.packSelections || !global.packSelections[senderJid]) return false;

  const choice = messageContent.trim().toLowerCase();
  if (isNaN(choice) && !PackManager.PACKS[choice]) return false;

  let packId = null;

  if (!isNaN(choice)) {
    const num = parseInt(choice, 10) - 1;
    const packs = PackManager.getPacks();
    if (num >= 0 && num < packs.length) {
      packId = packs[num].id;
    }
  } else if (PackManager.PACKS[choice]) {
    packId = choice;
  }

  if (!packId) return false;

  const pack = PackManager.applyPack(packId, senderJid);
  if (!pack) return false;

  global.packSelections[senderJid] = false;

  const doc = PackManager.getPackDocumentation(packId);
  await sendText(sock, senderJid, MessageFormatter.cleanText(doc));
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await sendText(sock, senderJid, activationRequiredMessage(pack));

  return true;
}

async function handleMessage(sock, message, isGroup, groupData) {
  try {
    const messageContent = extractText(message.message);
    if (!messageContent) return;

    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;
    const username = message.pushName || 'Anonymous';

    let groupDoc = null;
    if (isGroup) {
      groupDoc = await Group.findOne({ groupJid: senderJid }).catch(() => null);
    }
    MessageFormatter.setTheme(groupDoc?.theme);

    const user = await getOrCreateUser(participantJid, username);
    if (user?.isBanned) {
      return;
    }

    const canUseBot = await BotAccessService.canUseBot(participantJid, getBotJid(sock)).catch(() => true);
    if (!canUseBot) {
      return;
    }

    if (isGroup && groupDoc) {
      const antiLinkHandled = await handleAntiLink(sock, message, groupDoc, messageContent);
      if (antiLinkHandled) return;
    }

    if (user) {
      user.stats.messages++;

      try {
        const profilePicture = await sock.profilePictureUrl(participantJid, 'image').catch(() => null);
        if (profilePicture && profilePicture !== user.profilePicture) {
          user.profilePicture = profilePicture;
        }
      } catch {
        // Profile pictures are optional.
      }

      if (QuestSystem.needsDailyReset(user)) {
        QuestSystem.resetDailyQuests(user);
      }
      if (QuestSystem.needsWeeklyReset(user)) {
        QuestSystem.resetWeeklyQuests(user);
      }
      // Migration / securite: assigner des quetes si aucune
      QuestSystem.ensureDailyAssigned(user);
      QuestSystem.ensureWeeklyAssigned(user);

      QuestSystem.updateDailyProgress(user, 'messages', 1);
      QuestSystem.updateWeeklyProgress(user, 'messages', 1);
      await user.save();

      if (isGroup) {
        await addXP(participantJid, config.XP_PER_MESSAGE);
      }
    }

    const directMessage = messageContent.trim().toLowerCase();
    const directAnswerHandled = await routeDirectQuizAnswer(
      sock,
      message,
      senderJid,
      participantJid,
      directMessage,
      isGroup,
      groupData
    );
    if (directAnswerHandled) return;

    if (isGroup) {
      const packHandled = await handlePackSelection(sock, senderJid, messageContent);
      if (packHandled) return;
    }

    if (!isGroup) {
      const docCommand = commands.get('documentation');
      const userLatest = await User.findOne({ jid: participantJid });
      const chatbotSettings = await ChatbotService.getSettings();
      const now = new Date();

      if (!chatbotSettings.chatbot.pmEnabled && docCommand && userLatest && (!userLatest.lastDocumentationDM || (now - userLatest.lastDocumentationDM) > 86400000)) {
        await docCommand.execute(sock, message, ['1'], userLatest, isGroup, null);
        userLatest.lastDocumentationDM = now;
        await userLatest.save();
      }
    }

    if (!messageContent.startsWith(config.PREFIX)) {
      if (global.tournamentSetup && global.tournamentSetup.has(senderJid)) {
        const tournoisquizCommand = commands.get('tournoisquiz');
        if (tournoisquizCommand && tournoisquizCommand.handleTournamentSetup) {
          const responseArgs = messageContent.trim().split(/\s+/);
          const handled = await tournoisquizCommand.handleTournamentSetup(sock, message, responseArgs, senderJid, participantJid);
          if (handled) return;
        }
      }
      const chatbotHandled = await ChatbotService.handleIncomingMessage(sock, message, {
        text: messageContent,
        isGroup,
        groupDoc,
      });
      if (chatbotHandled) return;
      return;
    }

    const args = messageContent.slice(config.PREFIX.length).trim().split(/\s+/);
    let commandName = args.shift().toLowerCase();
    commandName = commandName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const command = commands.get(commandName);
    if (!command) return;

    if (isGroup && !commandVisible(command, buildContext({ groupJid: senderJid, isGroup }))) {
      await sendText(sock, senderJid, MessageFormatter.warning('Cette commande nest pas disponible avec les modules actifs du groupe. Un admin peut utiliser `!setmodule status`.'));
      return;
    }

    if (global.tournaments && global.tournaments.has(senderJid)) {
      const tournament = global.tournaments.get(senderJid);
      if (tournament.isActive && commandName !== 'reponse') {
        await sendText(sock, senderJid, MessageFormatter.warning('Un tournoi est en cours. Seule la commande `!reponse` est autorisée jusqu’à la fin du tournoi.'));
        return;
      }
    }

    if (isGroup && groupDoc && !groupDoc.isActive) {
      const allowedWhenInactive = ['activatebot', 'unbangroup', 'unbangc', 'help', 'menu', 'documentation', 'profil', 'profile'];
      if (!allowedWhenInactive.includes(commandName)) {
        await sendText(sock, senderJid, MessageFormatter.warning('Le bot est désactivé dans ce groupe. Un administrateur peut le réactiver avec `!activatebot`.'));
        return;
      }
    }

    const userLatest = await User.findOne({ jid: participantJid });
    if (!userLatest) {
      await sendText(sock, senderJid, MessageFormatter.error('Impossible de récupérer ton profil. Réessaie dans quelques instants.'));
      return;
    }

    if (userLatest.spamBannedUntil && new Date() < new Date(userLatest.spamBannedUntil)) {
      if (commandName !== 'profil' && commandName !== 'profile') {
        const remaining = Math.ceil((new Date(userLatest.spamBannedUntil) - new Date()) / 1000 / 60);
        await sendText(sock, senderJid, MessageFormatter.warning(`Restriction anti-spam active. Réessaie dans ${remaining} minute(s). Seule la commande \`!profil\` est accessible pendant ce délai.`));
        return;
      }
    } else if (userLatest.spamBannedUntil) {
      userLatest.spamBannedUntil = null;
      await userLatest.save();
    }

    if (userLatest.isBanned) {
      await sendText(sock, senderJid, MessageFormatter.error('Tu es banni du bot.'));
      return;
    }

    const now = Date.now();
    const lastCmdTime = userLatest.lastCommandTime ? new Date(userLatest.lastCommandTime).getTime() : 0;
    const timeSinceLastCmd = now - lastCmdTime;
    const antiSpamEnabled = groupDoc?.features?.antiSpam ?? true;
    const spamThresholdMs = 1000;

    if (antiSpamEnabled && timeSinceLastCmd < spamThresholdMs && timeSinceLastCmd > 0) {
      const banUntil = new Date(now + 30 * 60 * 1000);
      userLatest.spamBannedUntil = banUntil;
      await userLatest.save();

      await sendText(sock, senderJid, MessageFormatter.warning('Anti-spam déclenché. Tu es limité pendant 30 minutes à cause d’une utilisation trop rapide des commandes. Pendant ce délai, seule la commande `!profil` reste accessible.'));
      return;
    }

    userLatest.lastCommandTime = new Date();
    await userLatest.save();

    if (commandName === 'tournoisquiz' && global.tournamentSetup && global.tournamentSetup.has(senderJid)) {
      const tournoisquizCommand = commands.get('tournoisquiz');
      if (tournoisquizCommand && tournoisquizCommand.handleTournamentSetup) {
        const handled = await tournoisquizCommand.handleTournamentSetup(sock, message, args, senderJid, participantJid);
        if (handled) return;
      }
    }

    if (CooldownManager.isOnCooldown(participantJid, commandName)) {
      const remaining = CooldownManager.getRemainingTime(participantJid, commandName);
      await sendText(sock, senderJid, MessageFormatter.info(`Patiente encore ${remaining}s avant de relancer cette commande.`));
      return;
    }

    CooldownManager.set(participantJid, commandName, command.cooldown * 1000 || 1000);

    const xpBefore = userLatest.xp || 0;


    if (command.adminOnly) {
      let participants = [];
      if (isGroup) {
        try {
          const groupMetadata = await sock.groupMetadata(senderJid);
          participants = groupMetadata.participants || [];
        } catch (error) {
        }
      }

      const hasPermission = PermissionManager.canUseCommand(
        participantJid,
        command,
        isGroup,
        senderJid,
        participantJid,
        participants
      );

      if (!hasPermission) {
        // Auto-warn: tout utilisateur non autorise (ni admin/owner du groupe, ni admin bot, ni le bot)
        // prend un avertissement et -2000 XP. 3 avertissements => ban.
        const botJid = getBotJid(sock);
        const isBot = message.key.fromMe
          || (botJid && PermissionManager.jidMatches(botJid, PermissionManager.uniqueJids(participantJid)));

        if (isBot) {
          await sendText(sock, senderJid, MessageFormatter.error('Cette commande est réservée aux administrateurs du groupe.'));
          return;
        }

        userLatest.warnings = (userLatest.warnings || 0) + 1;
        const removedXp = Math.min(2000, userLatest.xp || 0);
        userLatest.xp = Math.max(0, (userLatest.xp || 0) - 2000);

        if (userLatest.warnings >= 3) {
          userLatest.isBanned = true;
          await userLatest.save();
          await sendText(sock, senderJid, MessageFormatter.error(
            `Commande non autorisée. Banni après ${userLatest.warnings}/3 avertissements (-${removedXp} XP).`
          ));
          return;
        }

        await userLatest.save();
        await sendText(sock, senderJid, MessageFormatter.warning(
          `Commande réservée aux admins. Avertissement ${userLatest.warnings}/3 et -${removedXp} XP.`
        ));
        return;
      }
    }

    const reply = MessageFormatter.createReplyFunction(sock, message);
    message.reply = reply;
    sock.reply = reply;

    await command.execute(sock, message, args, userLatest, isGroup, groupData, reply);
    await ReactionSystem.addReaction(sock, message, commandName);

    if (isGroup && config.XP_COMMAND_BONUS > 0) {
      const activePack = PackManager.getActivePack(senderJid);
      if (activePack === 'otaku' || activePack === 'complet') {
        const userAfter = await User.findOne({ jid: participantJid });
        if (userAfter && (userAfter.xp || 0) > xpBefore) {
          userAfter.xp += config.XP_COMMAND_BONUS;
          await userAfter.save();
        }
      }
    }
  } catch (error) {
    try {
      const senderJid = message.key.remoteJid;
      await sendText(sock, senderJid, MessageFormatter.error('Une erreur est survenue pendant l’exécution de la commande.'));
    } catch (sendError) {
    }
  }
}

module.exports = {
  loadCommands,
  handleMessage,
  getOrCreateUser,
  addXP,
  getCommand: (name) => commands.get(name.toLowerCase()),
  getAllCommands: () => Array.from(
    new Map(Array.from(commands.values()).map((command) => [command.name, command])).values()
  ),
};
