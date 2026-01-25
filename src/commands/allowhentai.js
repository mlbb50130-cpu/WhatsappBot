const Group = require('../models/Group');
const AdminActions = require('../utils/adminActions');

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
      const adminCheck = await AdminActions.isUserAdmin(sock, senderJid, senderNumber);
      if (!adminCheck.isAdmin) {
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

      // Initialize permissions if not exists
      if (!group.permissions) {
        group.permissions = {};
      }

      const isAllowed = action === 'on';
      group.permissions.allowHentai = isAllowed;
      await group.save();

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
