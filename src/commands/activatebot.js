const MessageFormatter = require('../utils/messageFormatter');

const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'activatebot',
  description: 'Activer le bot dans ce groupe (Owner seulement)',
  category: 'BOT',
  usage: '!activatebot',
  groupOnly: true,
  cooldown: 0,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const BotOwners = ['74690085318855', '22954959093']; // Les deux numéros autorisés
    
    // Vérifier si c'est le bot owner
    const senderNumber = message.key.participant || message.key.remoteJid;
    const senderNumberOnly = senderNumber.split('@')[0];

    console.log(`[ACTIVATEBOT] Tentative: ${senderNumberOnly}, BotOwners: ${BotOwners}, Match: ${BotOwners.includes(senderNumberOnly)}`);

    if (!BotOwners.includes(senderNumberOnly)) {
      await sock.sendMessage(senderJid, {
        text: '🚫 *Accès refusé!*\n\n⛔ Seul le propriétaire du bot (@74690085318855) peut activer le bot dans les groupes.\n\nVous ne pouvez pas utiliser cette commande.'
      });
      console.log(`[ACTIVATION DENIED] ${senderNumberOnly} tried to activate bot in ${senderJid}`);
      return;
    }

    try {
      const Group = require('../models/Group');
      
      let group = await Group.findOne({ groupJid: senderJid });

      if (!group) {
        // Créer le groupe s'il n'existe pas
        group = new Group({
          groupJid: senderJid,
          groupName: groupData?.subject || 'Groupe',
          isActive: true,
          activatedBy: senderNumberOnly,
          activatedAt: new Date()
        });
      } else {
        // Activer le groupe existant
        group.isActive = true;
        group.activatedBy = senderNumberOnly;
        group.activatedAt = new Date();
      }

      await group.save();

      const activateItems = [
        { label: '🎆 Groupe', value: groupData?.subject || senderJid },
        { label: '✅ Statut', value: 'Bot activé' },
        { label: '👤 Activé par', value: senderNumberOnly }
      ];

      const activateMsg = MessageFormatter.elegantBox('🤖 BOT ACTIVÉ 🤖', activateItems);

      await sock.sendMessage(senderJid, {
        text: '✅ *Bot activé avec succès!*\n\n🎉 Le bot a été activé dans ce groupe par le propriétaire.\n\n📋 Vous pouvez maintenant:\n• Gagner de l\'XP en utilisant les commandes\n• Accéder aux quêtes et défis\n• Participer aux duels\n• Consulter le classement\n• Et bien plus!\n\n🚀 Tapez `!menu` pour voir toutes les commandes disponibles.'
      });

      console.log(`[BOT ACTIVATED] Group: ${groupData?.subject || senderJid} by ${senderNumberOnly}`);

    } catch (error) {
      console.error('Error activating bot:', error.message);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de l\'activation du bot!'
      });
    }
  }
};
