// Template pour créer une nouvelle commande
// Copie ce fichier et adapte-le à ta commande

module.exports = {
  // Nom de la commande (sans préfixe)
  name: 'commande',

  // Description courte
  description: 'Description de la commande',

  // Catégorie pour le menu help
  category: 'CATEGORIE',

  // Usage exemple
  usage: '!commande [args]',

  // Réservé aux admins du bot?
  adminOnly: false,

  // Peut être utilisé seulement en groupe?
  groupOnly: false,

  // Cooldown en secondes
  cooldown: 5,

  /**
   * Fonction principale
   * @param {Object} sock - Socket Baileys
   * @param {Object} message - Message WhatsApp
   * @param {Array} args - Arguments de la commande
   * @param {Object} user - Utilisateur MongoDB
   * @param {Boolean} isGroup - Est-ce un groupe?
   * @param {Object} groupData - Données du groupe (null si DM)
   */
  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    // Ton code ici
    // ...

    // Exemple pour envoyer un message
    await sock.sendMessage(senderJid, {
      text: '✅ Commande exécutée!'
    });

    // IMPORTANT: Sauvegarde les modifications de l'utilisateur
    // await user.save();
  }
};

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EXEMPLE DE COMMANDE COMPLÈTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RandomUtils = require('../utils/random');

module.exports = {
  name: 'exemple',
  description: 'Une commande exemple',
  category: 'EXEMPLE',
  usage: '!exemple @user',
  adminOnly: false,
  groupOnly: true,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    // Récupérer les mentions
    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (mentions.length === 0) {
      await sock.sendMessage(senderJid, {
        text: '❌ Utilisation: \`!exemple @user\`'
      });
      return;
    }

    const targetJid = mentions[0];

    // Récupérer l'utilisateur cible
    const User = require('../models/User');
    const targetUser = await User.findOne({ jid: targetJid });

    if (!targetUser) {
      await sock.sendMessage(senderJid, {
        text: '❌ Utilisateur non trouvé.'
      });
      return;
    }

    // Modifier l'utilisateur
    targetUser.xp += 50;
    await targetUser.save();

    // Répondre
    const text = \`
╔════════════════════════════════════════╗
║       ✅ COMMANDE EXÉCUTÉE ✅        ║
╚════════════════════════════════════════╝

Tu as gagné 50 XP!

════════════════════════════════════════
\`;

    await sock.sendMessage(senderJid, { text });
  }
};

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  OBJECTS DISPONIBLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MESSAGE:
  - message.key.remoteJid      → Chat ID (groupe ou DM)
  - message.key.participant    → JID du participant
  - message.body               → Texte du message
  - message.message            → Objet du message
  - message.key.fromMe         → Vrai si du bot
  - message.pushName           → Nom du sender
  - message.timestamp          → Timestamp Unix

GROUP DATA:
  - groupData.id               → ID du groupe
  - groupData.subject          → Nom du groupe
  - groupData.participants     → Array de participants
  - groupData.restrict         → Messages restreints?
  - groupData.announce         → Mode annonce?

USER MODEL:
  - user.jid                   → JID unique
  - user.username              → Nom utilisateur
  - user.xp                    → XP actuel
  - user.level                 → Niveau
  - user.rank                  → Rang
  - user.stats                 → Stats (wins, losses, etc)
  - user.inventory             → Array items
  - user.save()                → Sauvegarder

SOCK (Baileys):
  - sock.sendMessage()         → Envoyer un message
  - sock.groupParticipantsUpdate() → Kick/add/remove
  - sock.groupMetadata()       → Info du groupe
  - sock.sendTyping()          → Afficher "Typing..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  UTILS DISPONIBLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Random
const RandomUtils = require('../utils/random');
RandomUtils.range(min, max)           → Nombre aléatoire
RandomUtils.choice(array)             → Élément aléatoire
RandomUtils.chance(percentage)        → % de chance
RandomUtils.weighted(items)           → Random pondéré
RandomUtils.shuffle(array)            → Mélanger array
RandomUtils.generateId()              → UUID unique
RandomUtils.sleep(ms)                 → Attendre ms

// Cooldown
const CooldownManager = require('../utils/cooldown');
CooldownManager.set(userId, cmd, duration)
CooldownManager.get(userId, cmd)
CooldownManager.isOnCooldown(userId, cmd)

// Permissions
const PermissionManager = require('../utils/permissions');
PermissionManager.isAdmin(jid)
PermissionManager.isGroupAdmin(groupJid, userJid, participants)
PermissionManager.canUseCommand()

// Anti-Spam
const AntiSpamManager = require('../utils/antiSpam');
AntiSpamManager.recordMessage(userId, groupId)
AntiSpamManager.isSpamming(userId, groupId)

// Anti-Link
const AntiLinkManager = require('../utils/antiLink');
AntiLinkManager.hasLink(text)
AntiLinkManager.extractLinks(text)
AntiLinkManager.removeLinks(text)

// XP System
const XPSystem = require('../utils/xpSystem');
XPSystem.calculateLevelFromXp(xp)
XPSystem.getTotalXpForLevel(level)
XPSystem.getRank(level)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EXEMPLES DE MESSAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Message texte simple
await sock.sendMessage(jid, { text: '✅ Ok!' });

// Image
await sock.sendMessage(jid, {
  image: { url: 'https://...' },
  caption: '📸 Voilà!'
});

// Message avec mentions
await sock.sendMessage(jid, {
  text: '@user1 @user2 Coucou!',
  mentions: [jid1, jid2]
});

// Attendre avant répondre
await new Promise(resolve => setTimeout(resolve, 2000));
await sock.sendMessage(jid, { text: 'Réponse...' });

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
