const Group = require('../models/Group');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'allowhentai',
  aliases: ['hentaiallow', 'authhentai'],
  description: 'Autoriser/interdire les commandes hentai dans le groupe',
  category: 'admin',
  usage: '!allowhentai on/off',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const jid = message.key.remoteJid;

    try {
      // La vérification admin est déjà faite par le handler
      // Donc on peut procéder directement

      if (!args.length) {
        const text = '📝 **Usage:** !allowhentai on/off\n\n' +
                '!allowhentai on → Autoriser hentai/hentaivd\n' +
                '!allowhentai off → Interdire hentai/hentaivd';
        if (reply) {
          return await reply({ text });
        } else {
          return sock.sendMessage(jid, { text });
        }
      }

      const action = args[0].toLowerCase();

      if (action !== 'on' && action !== 'off') {
        const text = '❌ Argument invalide! Utilise: !allowhentai on/off';
        if (reply) {
          return await reply({ text });
        } else {
          return sock.sendMessage(jid, { text });
        }
      }

      const isAllowed = action === 'on';
      await Group.findOneAndUpdate(
        { groupJid: jid },
        { $set: { 'permissions.allowHentai': isAllowed } },
        { upsert: true }
      );

      const message_text = isAllowed 
        ? `✅ Les commandes !hentai et !hentaivd sont maintenant **autorisées** dans ce groupe!`
        : `❌ Les commandes !hentai et !hentaivd sont maintenant **interdites** dans ce groupe!`;

      if (reply) {
        return await reply({ text: message_text });
      } else {
        return sock.sendMessage(jid, { text: message_text });
      }

    } catch (error) {
      const text = '❌ Erreur lors de la mise à jour des paramètres.';
      if (reply) {
        await reply({ text });
      } else {
        await sock.sendMessage(jid, { text });
      }
    }
  }
};
