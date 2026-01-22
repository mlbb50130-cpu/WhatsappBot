const fs = require('fs');
const path = require('path');
const config = require('./config');
const User = require('./models/User');
const CooldownManager = require('./utils/cooldown');
const XPSystem = require('./utils/xpSystem');
const PermissionManager = require('./utils/permissions');

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
    user.stats.messages++;
    user.lastXpTime = new Date();

    // Check level up
    const levelInfo = XPSystem.calculateLevelFromXp(user.xp);
    const oldLevel = user.level;
    user.level = levelInfo.level;

    if (levelInfo.level > oldLevel) {
      const rankInfo = XPSystem.getRank(levelInfo.level);
      user.rank = rankInfo.rank;
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
    const messageContent = message.body || '';
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;
    const username = message.pushName || 'Anonymous';

    // Ignore bot's own messages
    if (message.key.fromMe) return;

    // Check if message starts with prefix
    if (!messageContent.startsWith(config.PREFIX)) {
      // Add XP for regular messages
      if (isGroup) {
        await addXP(participantJid);
      }
      return;
    }

    // Parse command
    const args = messageContent.slice(config.PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // Get command
    const command = commands.get(commandName);
    if (!command) {
      return;
    }

    // Get or create user
    const user = await getOrCreateUser(participantJid, username);
    if (!user) {
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
    await command.execute(sock, message, args, user, isGroup, groupData);

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
