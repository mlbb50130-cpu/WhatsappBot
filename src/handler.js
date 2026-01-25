const fs = require('fs');
const path = require('path');
const config = require('./config');
const User = require('./models/User');
const CooldownManager = require('./utils/cooldown');
const XPSystem = require('./utils/xpSystem');
const PermissionManager = require('./utils/permissions');
const QuestSystem = require('./utils/questSystem');
const ModuleManager = require('./utils/ModuleManager');

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
      
      return {
        user: await user.save(),
        leveledUp: true,
        oldLevel,
        newLevel: levelInfo.level,
        rankInfo
      };
    }

    return {
      user: await user.save(),
      leveledUp: false
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

    // Ignore bot's own messages
    if (message.key.fromMe) return;

    console.log(`[HANDLER] Message: "${messageContent}"`);
    console.log(`[HANDLER] From: ${participantJid}`);
    console.log(`[HANDLER] Group/Chat JID: ${senderJid}`);
    console.log(`[HANDLER] Is Group: ${isGroup}`);
    console.log(`---`);

    // TOUJOURS enregistrer les messages (même les non-commandes)
    const user = await getOrCreateUser(participantJid, username);
    if (user) {
      user.stats.messages++;
      
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
    }

    // Check if it's a command
    if (!messageContent.startsWith(config.PREFIX)) {
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

    // Check if group is active (SEULEMENT EN GROUPE - finissant par @g.us)
    // MAIS permettre activatebot, documentation, et help même si pas activé
    const allowedWithoutActivation = ['activatebot', 'documentation', 'help', 'assets', 'whoami'];
    
    if (!allowedWithoutActivation.includes(commandName) && messageContent.startsWith(config.PREFIX) && senderJid.endsWith('@g.us')) {
      try {
        const Group = require('./models/Group');
        const group = await Group.findOne({ groupJid: senderJid });
        
        // Si le groupe n'est pas activé, rejeter
        if (!group || !group.isActive) {
          const ownerJid = '22954959093@s.whatsapp.net';
          await sock.sendMessage(senderJid, {
            text: '🚫 *Le bot n\'est pas activé dans ce groupe.*\n\n📚 Lisez la documentation avec: `!documentation`\n\n📞 Contactez le propriétaire:\n@22954959093\n\nIl peut activer le bot avec: `!activatebot`',
            mentions: [ownerJid]
          });
          return;
        }
      } catch (error) {
        console.log('Warning: Could not check group activation:', error.message);
        // Continue anyway
      }
    }

    // Vérifier si le module de la commande est activé en groupe
    const allowedWithoutModule = ['setmodule', 'modules', 'help', 'menu', 'activatebot', 'documentation', 'assets', 'whoami'];
    if (isGroup && senderJid.endsWith('@g.us') && !allowedWithoutModule.includes(commandName)) {
      if (!ModuleManager.isCommandAllowed(senderJid, commandName)) {
        await sock.sendMessage(senderJid, {
          text: `❌ Cette commande n'est pas activée dans ce groupe.\n\n!setmodule status - Voir les modules\n!setmodule on <module> - Activer un module`
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

    // Check cooldown
    if (CooldownManager.isOnCooldown(participantJid, commandName)) {
      const remaining = CooldownManager.getRemainingTime(participantJid, commandName);
      await sock.sendMessage(senderJid, {
        text: `⏱️ Attendez ${remaining}s avant d'utiliser cette commande à nouveau.`
      });
      return;
    }

    // Check permissions
    const canUse = PermissionManager.canUseCommand(
      participantJid,
      command,
      isGroup,
      senderJid,
      participantJid,
      groupData?.participants
    );

    if (!canUse) {
      await sock.sendMessage(senderJid, {
        text: '🚫 Vous n\'avez pas la permission d\'utiliser cette commande.'
      });
      return;
    }

    // Check group only
    if (command.groupOnly && !isGroup) {
      await sock.sendMessage(senderJid, {
        text: '🚫 Cette commande ne peut être utilisée que dans un groupe.'
      });
      return;
    }

    // Set cooldown
    CooldownManager.set(participantJid, commandName, command.cooldown * 1000 || 3000);

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
