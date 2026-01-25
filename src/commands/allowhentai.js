const Group = require('../models/Group');
const { isGroupAdmin } = require('../utils/adminUtils');

module.exports = {
  name: 'allowhentai',
  description: 'Autoriser/interdire les commandes hentai dans le groupe',
  category: 'ADMIN',
  usage: '!allowhentai on/off',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const senderNumber = message.key.participant || message.key.remoteJid;

    try {
      // Only allow group admins to use this command
      const isAdmin = await isGroupAdmin(sock, senderJid, senderNumber);
      if (!isAdmin) {
        await sock.sendMessage(senderJid, {
          text: '❌ Seul les admins du groupe peuvent utiliser cette commande!'
        });
        return;
      }

      if (!args[0]) {
        await sock.sendMessage(senderJid, {
          text: '📝 Usage: !allowhentai on/off\n\n!allowhentai on → Autoriser hentai/hentaivd\n!allowhentai off → Interdire hentai/hentaivd'
        });
        return;
      }

      const action = args[0].toLowerCase();
      
      if (action !== 'on' && action !== 'off') {
        await sock.sendMessage(senderJid, {
          text: '❌ Argument invalide! Utilise: !allowhentai on/off'
        });
        return;
      }

      // Get or create group
      let group = await Group.findOne({ groupJid: senderJid });
      if (!group) {
        group = new Group({
          groupJid: senderJid,
          groupName: groupData?.groupName || 'Unknown'
        });
      }

      // Initialize hentai settings if not exists
      if (!group.settings) {
        group.settings = {};
      }

      const isAllowed = action === 'on';
      group.settings.hentaiAllowed = isAllowed;
      await group.save();

      const statusText = isAllowed ? '✅ Autorisé' : '❌ Interdit';
      const message_text = isAllowed 
        ? `✅ Les commandes !hentai et !hentaivd sont maintenant **autorisées** dans ce groupe!`
        : `❌ Les commandes !hentai et !hentaivd sont maintenant **interdites** dans ce groupe!`;

      await sock.sendMessage(senderJid, {
        text: message_text
      });

    } catch (error) {
      console.error(`[ALLOWHENTAI] Error: ${error.message}`);
      await sock.sendMessage(senderJid, {
        text: '❌ Erreur lors de la mise à jour des paramètres.'
      });
    }
  }
};
