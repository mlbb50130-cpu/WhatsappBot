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

const commands = new Map();

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
            console.log(`${config.COLORS.CYAN}📄 Command loaded: ${command.name}${config.COLORS.RESET}`);
          }
        } catch (error) {
          console.error(`${config.COLORS.RED}❌ Error loading command ${file}: ${error.message}${config.COLORS.RESET}`);
        }
      }
    }
  };
  
  loadDir(commandsPath);
  console.log(`${config.COLORS.GREEN}✅ ${commands.size} commands loaded${config.COLORS.RESET}`);
}

// Get or create user
async function getOrCreateUser(jid, username) {
  try {
    let user = await User.findOne({ jid });
    
    if (!user) {
      user = new User({
        jid,
        username: username || 'Anonymous',
        xp: 0,
        level: 1
      });
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error(`Error getting/creating user: ${error.message}`);
    return null;
  }
}

// Add XP to user
async function addXP(jid, amount = config.XP_PER_MESSAGE) {
  try {
    const user = await User.findOne({ jid });
    if (!user) return;

    const now = Date.now();
    const lastXpTime = user.lastXpTime ? new Date(user.lastXpTime).getTime() : 0;

    // Check cooldown
    if (now - lastXpTime < config.XP_COOLDOWN) {
      return;
    }

    user.xp += amount;
    user.stats.messages++; // Les messages sont déjà comptés dans handler
    user.lastXpTime = new Date();

    // Check level up
    const levelInfo = XPSystem.calculateLevelFromXp(user.xp);
    const oldLevel = user.level;
    user.level = levelInfo.level;

    if (levelInfo.level > oldLevel) {
      const rankInfo = XPSystem.getRank(levelInfo.level);
      user.rank = rankInfo.rank;
      
      // Augmenter le maxChakra quand on level up: +10 par niveau
      const newMaxChakra = 100 + (levelInfo.level - 1) * 10;
      user.maxChakra = newMaxChakra;
      
      // Vérifier et mettre à jour le rang automatiquement avec RankSystem
      const rankUpdate = RankSystem.checkAndUpdateRank(user);
      
      await user.save();
      
      return {
        user,
        leveledUp: true,
        oldLevel,
        newLevel: levelInfo.level,
        rankInfo,
        rankUpdate: rankUpdate.rankChanged ? rankUpdate : null
      };
    }

    // Vérifier et mettre à jour le rang automatiquement à chaque message avec RankSystem
    const rankUpdate = RankSystem.checkAndUpdateRank(user);
    if (rankUpdate.rankChanged) {
      await user.save();
    }

    await user.save();
    return {
      user,
      leveledUp: false,
      rankUpdate: rankUpdate.rankChanged ? rankUpdate : null
    };
  } catch (error) {
    console.error(`Error adding XP: ${error.message}`);
    return null;
  }
}

// Main message handler
async function handleMessage(sock, message, isGroup, groupData) {
  try {
    // Extract message content (Baileys 7.0 compatible)
    let messageContent = '';
    if (message.message?.conversation) {
      messageContent = message.message.conversation;
    } else if (message.message?.extendedTextMessage?.text) {
      messageContent = message.message.extendedTextMessage.text;
    } else {
      return; // Ignore if no text message
    }

    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;
    const username = message.pushName || 'Anonymous';

    console.log(`[HANDLER] Message: "${messageContent}"`);
    console.log(`[HANDLER] From: ${participantJid}`);
    console.log(`[HANDLER] Group/Chat JID: ${senderJid}`);
    console.log(`[HANDLER] Is Group: ${isGroup}`);
    console.log(`---`);

    // TOUJOURS enregistrer les messages (même les non-commandes)
    const user = await getOrCreateUser(participantJid, username);
    if (user) {
      user.stats.messages++;
      
      // Récupérer la photo de profil de l'utilisateur
      try {
        const profilePicture = await sock.profilePictureUrl(participantJid, 'image').catch(() => null);
        if (profilePicture && profilePicture !== user.profilePicture) {
          user.profilePicture = profilePicture;
        }
      } catch (error) {
        // Silently ignore if picture can't be fetched
      }
      
      // Reset et update des quêtes journalières/hebdomadaires
      if (QuestSystem.needsDailyReset(user)) {
        QuestSystem.resetDailyQuests(user);
      }
      if (QuestSystem.needsWeeklyReset(user)) {
        QuestSystem.resetWeeklyQuests(user);
      }
      
      // Update daily quest progress
      QuestSystem.updateDailyProgress(user, 'messages', 1);
      
      await user.save();

      // 💰 Ajouter XP pour le message (en groupe seulement)
      if (isGroup) {
        await addXP(participantJid, config.XP_PER_MESSAGE);
      }
    }

    // 🎯 Traiter les réponses directes au quiz (a, b, c, d en minuscule)
    const directMessage = messageContent.trim().toLowerCase();
    if (['a', 'b', 'c', 'd'].includes(directMessage)) {
      // Vérifier s'il y a une session de quiz active dans le GROUPE
      if (!global.quizSessions) global.quizSessions = new Map();
      const quizSession = global.quizSessions.get(senderJid);
      
      if (quizSession && !quizSession.answered.has(participantJid)) {
        // Exécuter la commande reponse avec la réponse directe
        const reponseCommand = commands.get('reponse');
        if (reponseCommand) {
          const userLatest = await User.findOne({ jid: participantJid });
          await reponseCommand.execute(sock, message, [directMessage.toUpperCase()], userLatest, isGroup, groupData);
          return;
        }
      }
      
      // Vérifier si un tournoi est en cours
      if (global.tournaments && global.tournaments.has(senderJid)) {
        const tournament = global.tournaments.get(senderJid);
        if (tournament.isActive) {
          const reponseCommand = commands.get('reponse');
          if (reponseCommand) {
            const userLatest = await User.findOne({ jid: participantJid });
            await reponseCommand.execute(sock, message, [directMessage.toUpperCase()], userLatest, isGroup, groupData);
            return;
          }
        }
      }
    }

    // Gestion de la sélection de pack pour nouveaux groupes
    if (isGroup && global.packSelections && global.packSelections[senderJid]) {
      const PackManager = require('./utils/PackManager');
      const choice = messageContent.trim().toLowerCase();
      
      if (!isNaN(choice) || PackManager.PACKS[choice]) {
        let packId = null;

        // Gestion par numéro (1, 2, 3, 4)
        if (!isNaN(choice)) {
          const num = parseInt(choice) - 1;
          const packs = PackManager.getPacks();
          if (num >= 0 && num < packs.length) {
            packId = packs[num].id;
          }
        }
        // Gestion par nom
        else if (PackManager.PACKS[choice]) {
          packId = choice;
        }

        if (packId) {
          const pack = PackManager.applyPack(packId, senderJid);
          if (pack) {
            global.packSelections[senderJid] = false;

            // 1️⃣ Envoyer la documentation du pack
            const doc = PackManager.getPackDocumentation(packId);
            await sock.sendMessage(senderJid, { text: doc });

            // 2️⃣ Envoyer la demande d'activation par l'admin
            await new Promise(resolve => setTimeout(resolve, 1000)); // Délai pour lisibilité
            
            await sock.sendMessage(senderJid, {
              text: `
╔═══════════════════════════════════╗
║     ⚙️ ACTIVATION REQUISE ⚙️       ║
╚═══════════════════════════════════╝

👋 *Bienvenue dans TetsuBot!*

✅ Pack ${pack.emoji} *${pack.name}* **sélectionné avec succès!**

🔐 *PROCHAINE ÉTAPE - ACTIVATION:*

Seul l'**Admin** du groupe peut envoyer:

\`!activatebot\`

Cela activera les fonctions du bot dans ce groupe.

💡 *Note:* Certaines commandes (!documentation, !help) fonctionnent même sans activation.`
            });
            
            return;
          }
        }
      }
    }

    // 💬 Envoyer la documentation (PAGE 1 SEULEMENT) automatiquement en DM (tout message, commande ou non)
    if (!isGroup) {
      const docCommand = commands.get('documentation');
      if (docCommand) {
        const userLatest = await User.findOne({ jid: participantJid });
        // Envoyer SEULEMENT la page 1 de la doc en DM (args = ['1'] ou [])
        await docCommand.execute(sock, message, ['1'], userLatest, isGroup, null);
        return;
      }
    }

    // Check if it's a command
    if (!messageContent.startsWith(config.PREFIX)) {
      // 🏆 Vérifier si on est en setup de tournoi (accepter les réponses directes sans prefix)
      if (global.tournamentSetup && global.tournamentSetup.has(senderJid)) {
        const tournoisquizCommand = commands.get('tournoisquiz');
        if (tournoisquizCommand && tournoisquizCommand.handleTournamentSetup) {
          const responseArgs = messageContent.trim().split(/\s+/);
          const handled = await tournoisquizCommand.handleTournamentSetup(sock, message, responseArgs, senderJid, participantJid);
          if (handled) return;
        }
      }
      return;
    }

    // Parse command
    const args = messageContent.slice(config.PREFIX.length).trim().split(/\s+/);
    let commandName = args.shift().toLowerCase();
    
    // Normaliser les accents dans le nom de la commande
    commandName = commandName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Get command
    const command = commands.get(commandName);
    if (!command) {
      return;
    }

    // 🏆 Vérifier si un tournoi est en cours dans ce groupe
    if (global.tournaments && global.tournaments.has(senderJid)) {
      const tournament = global.tournaments.get(senderJid);
      if (tournament.isActive && commandName !== 'reponse') {
        // Seule la commande 'reponse' est autorisée pendant un tournoi
        await sock.sendMessage(senderJid, {
          text: '🏆 ⛔ Un tournoi est en cours! Seule la commande \`!reponse\` est autorisée.'
        });
        return;
      }
    }

    // User already retrieved and message count updated above
    const userLatest = await User.findOne({ jid: participantJid });
    if (!userLatest) {
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la récupération du profil. Essayez à nouveau.'
      });
      return;
    }

    // 🚫 Check if user is spam banned
    if (userLatest.spamBannedUntil && new Date() < new Date(userLatest.spamBannedUntil)) {
      // Autoriser que le profil pendant le ban
      if (commandName !== 'profil' && commandName !== 'profile') {
        const remaining = Math.ceil((new Date(userLatest.spamBannedUntil) - new Date()) / 1000 / 60);
        await sock.sendMessage(senderJid, {
          text: `⛔ *SPAM DÉTECTÉ!*\n\nVous êtes banni pour ${remaining} minute(s).\n\nSeule la commande \`!profil\` est accessible.`
        });
        return;
      }
    } else if (userLatest.spamBannedUntil) {
      // Débloquer l'utilisateur après le ban
      userLatest.spamBannedUntil = null;
      await userLatest.save();
    }

    // 🔍 Détection de spam (utilisation simultanée/rapide d'une même commande)
    const now = Date.now();
    const lastCmdTime = userLatest.lastCommandTime ? new Date(userLatest.lastCommandTime).getTime() : 0;
    const timeSinceLastCmd = now - lastCmdTime;

    if (timeSinceLastCmd < 500 && timeSinceLastCmd > 0) { // Moins de 500ms = spam
      console.log(`[SPAM DETECTED] ${participantJid} attempted command spam`);
      
      // Appliquer le ban de 30 minutes
      const banUntil = new Date(now + 30 * 60 * 1000); // 30 minutes
      userLatest.spamBannedUntil = banUntil;
      await userLatest.save();

      await sock.sendMessage(senderJid, {
        text: `⛔ *SPAM DÉTECTÉ!*\n\n🚷 Vous avez été banni pour 30 minutes en raison d'une utilisation rapide/simultanée de commande.\n\n📛 Seule la commande \`!profil\` est accessible pendant ce délai.\n\n💡 N'oubliez pas: les commandes ont un cooldown pour de bonnes raisons!`
      });
      return;
    }

    // Mettre à jour le timestamp de la dernière commande
    userLatest.lastCommandTime = new Date();
    await userLatest.save();

    // Vérifier si c'est une continuation du setup du tournoi
    if (commandName === 'tournoisquiz' && global.tournamentSetup && global.tournamentSetup.has(senderJid)) {
      const tournoisquizCommand = commands.get('tournoisquiz');
      if (tournoisquizCommand && tournoisquizCommand.handleTournamentSetup) {
        const handled = await tournoisquizCommand.handleTournamentSetup(sock, message, args, senderJid, participantJid);
        if (handled) return;
      }
    }

    // Check cooldown
    if (CooldownManager.isOnCooldown(participantJid, commandName)) {
      const remaining = CooldownManager.getRemainingTime(participantJid, commandName);
      await sock.sendMessage(senderJid, {
        text: `⏱️ Attendez ${remaining}s avant d'utiliser cette commande à nouveau.`
      });
      return;
    }

    // Set cooldown
    CooldownManager.set(participantJid, commandName, command.cooldown * 1000 || 1000);

    // Execute command
    await command.execute(sock, message, args, userLatest, isGroup, groupData);

  } catch (error) {
    console.error(`${config.COLORS.RED}❌ Handler Error: ${error.message}${config.COLORS.RESET}`);
    try {
      const senderJid = message.key.remoteJid;
      await sock.sendMessage(senderJid, {
        text: '❌ Une erreur s\'est produite lors de l\'exécution de la commande.'
      });
    } catch (e) {
      console.error('Error sending error message:', e.message);
    }
  }
}

module.exports = {
  loadCommands,
  handleMessage,
  getOrCreateUser,
  addXP,
  getCommand: (name) => commands.get(name.toLowerCase()),
  getAllCommands: () => Array.from(commands.values())
};
