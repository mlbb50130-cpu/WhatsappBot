// 🔄 MISE À JOUR DU HANDLER POUR GROUPES - À APPLIQUER

/**
 * Ajouter ces imports au début du fichier src/handler.js:
 * 
 * const GroupManager = require('./utils/groupManager');
 */

/**
 * Ajouter cette fonction avant "handleMessage":
 */

// Gestion de l'accueil dans le groupe
async function handleGroupUpdate(sock, message, isGroup, groupJid) {
  if (!isGroup) return;

  try {
    const groupData = await sock.groupMetadata(groupJid);
    const GroupManager = require('./utils/groupManager');
    
    // Récupérer ou créer le groupe dans la DB
    const group = await GroupManager.getOrCreateGroup(
      groupJid,
      groupData.subject,
      groupData.owner
    );

    // Vérifier si autoWelcome est activé
    if (group.features.autoWelcome && message.key.participant === groupData.owner) {
      console.log(`📢 Groupe créé/mis à jour: ${groupData.subject}`);
    }

    return group;
  } catch (error) {
    console.error(`Erreur dans handleGroupUpdate: ${error.message}`);
    return null;
  }
}

/**
 * REMPLACER la fonction handleMessage complète par celle-ci:
 */

async function handleMessage(sock, message, isGroup, groupData) {
  try {
    const messageContent = message.body || '';
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;
    const username = message.pushName || 'Anonymous';

    // 🚫 Ignorer les messages du bot
    if (message.key.fromMe) return;

    // 📊 Vérifier les bans si groupe
    if (isGroup && groupData) {
      const GroupManager = require('./utils/groupManager');
      const isBanned = await GroupManager.isBanned(senderJid, participantJid);
      
      if (isBanned) {
        console.log(`🚫 Utilisateur banni ignoré: ${participantJid}`);
        return;
      }

      // Récupérer les paramètres du groupe
      const group = await GroupManager.getOrCreateGroup(
        senderJid,
        groupData.subject,
        groupData.owner
      );

      if (!group) return;

      // 📈 Ajouter XP si feature activée
      if (group.features.xpSystem && !messageContent.startsWith(group.prefix)) {
        if (!(await GroupManager.isFeatureEnabled(senderJid, 'xpSystem'))) {
          return;
        }
        await addXP(participantJid, group.settings.xpPerMessage);
        return;
      }

      // 🛡️ Anti-link check
      if (group.features.antiLink && group.permissions.blockInviteLinks) {
        if (messageContent.includes('http') || messageContent.includes('www')) {
          try {
            await sock.sendMessage(senderJid, {
              text: '🔗 Les liens ne sont pas autorisés dans ce groupe!'
            });
            // Optionnel: supprimer le message
            // await sock.sendMessage(senderJid, { delete: message.key });
          } catch (e) {
            console.log('Impossible de supprimer le message');
          }
          return;
        }
      }

      // ⏱️ Anti-spam check
      if (group.features.antiSpam) {
        const AntiSpamManager = require('./utils/antiSpam');
        if (AntiSpamManager.isSpam(participantJid)) {
          try {
            await sock.sendMessage(senderJid, {
              text: '⚠️ Vous envoyez trop de messages! Calmez-vous.'
            });
          } catch (e) {
            console.log('Erreur anti-spam');
          }
          return;
        }
      }
    } else if (!isGroup) {
      // Mode DM: ajouter XP seulement si message normal
      if (!messageContent.startsWith(config.PREFIX)) {
        await addXP(participantJid);
        return;
      }
    }

    // 🎯 Vérifier si le message commence par le prefix
    const prefix = isGroup ? 
      await (require('./utils/groupManager')).getPrefix(senderJid) || config.PREFIX :
      config.PREFIX;

    if (!messageContent.startsWith(prefix)) {
      return;
    }

    // 🔍 Parser la commande
    const args = messageContent.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // 📋 Récupérer la commande
    const command = commands.get(commandName);
    if (!command) {
      return;
    }

    // 👤 Récupérer ou créer l'utilisateur
    const user = await getOrCreateUser(participantJid, username);
    if (!user) {
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la récupération du profil. Essayez à nouveau.'
      });
      return;
    }

    // ⏱️ Vérifier le cooldown
    if (CooldownManager.isOnCooldown(participantJid, commandName)) {
      const remaining = CooldownManager.getRemainingTime(participantJid, commandName);
      await sock.sendMessage(senderJid, {
        text: `⏱️ Attendez ${remaining}s avant d'utiliser cette commande à nouveau.`
      });
      return;
    }

    // 🔐 Vérifier les permissions
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

    // 🏘️ Vérifier groupe seulement
    if (command.groupOnly && !isGroup) {
      await sock.sendMessage(senderJid, {
        text: '🚫 Cette commande ne peut être utilisée que dans un groupe.'
      });
      return;
    }

    // ⏳ Appliquer le cooldown
    CooldownManager.set(
      participantJid,
      commandName,
      command.cooldown * 1000 || config.COMMAND_COOLDOWN
    );

    // 🎬 Logger la commande
    if (isGroup) {
      const GroupManager = require('./utils/groupManager');
      await GroupManager.logCommand(senderJid);
    }

    // ▶️ Exécuter la commande
    await command.execute(sock, message, args, user, isGroup, groupData);

  } catch (error) {
    console.error(`${config.COLORS.RED}❌ Handler Error: ${error.message}${config.COLORS.RESET}`);
    try {
      const senderJid = message.key.remoteJid;
      await sock.sendMessage(senderJid, {
        text: '❌ Une erreur s\'est produite lors de l\'exécution de la commande.'
      });
    } catch (e) {
      console.error('Erreur lors de l\'envoi du message d\'erreur:', e.message);
    }
  }
}

/**
 * EXPORTER LA NOUVELLE FONCTION:
 * 
 * module.exports = {
 *   loadCommands,
 *   handleMessage,
 *   handleGroupUpdate,
 *   getOrCreateUser,
 *   addXP,
 *   getCommand: (name) => commands.get(name.toLowerCase()),
 *   getAllCommands: () => Array.from(commands.values())
 * };
 */
