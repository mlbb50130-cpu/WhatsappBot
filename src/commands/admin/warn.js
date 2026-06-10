const AdminActionsManager = require('../../utils/adminActions');
const User = require('../../models/User');
const MessageFormatter = require('../../utils/messageFormatter');

module.exports = {
  name: 'warn',
  aliases: ['avertir'],
  description: 'Avertir un utilisateur - 3 avertissements = ban automatique',
  category: 'admin',
  usage: '!warn @user [raison]',
  adminOnly: true,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant;

    const isUserAdmin = await AdminActionsManager.isUserAdmin(sock, senderJid, participantJid);
    if (!isUserAdmin.isAdmin) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.error('Seuls les administrateurs peuvent utiliser cette commande.'),
      });
      return;
    }

    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentions.length === 0) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.warning('Utilise: !warn @user [raison]'),
      });
      return;
    }

    const userToWarn = mentions[0];
    const reason = args.slice(1).join(' ') || 'Comportement inapproprie';

    if (userToWarn === participantJid) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.warning('Tu ne peux pas t avertir toi-meme.'),
      });
      return;
    }

    try {
      const isBotAdmin = await AdminActionsManager.isBotAdmin(sock, senderJid);
      if (!isBotAdmin) {
        await sock.sendMessage(senderJid, {
          text: MessageFormatter.error('Le bot doit etre administrateur du groupe.'),
        });
        return;
      }

      let warnedUser = await User.findOne({ jid: userToWarn });
      if (!warnedUser) {
        warnedUser = new User({
          jid: userToWarn,
          username: 'Unknown',
          warnings: 0,
          isBanned: false,
        });
      }

      warnedUser.warnings = (warnedUser.warnings || 0) + 1;

      if (warnedUser.warnings >= 3) {
        warnedUser.isBanned = true;
        await warnedUser.save();
        await AdminActionsManager.kickUser(sock, senderJid, userToWarn, `Banni apres ${warnedUser.warnings} avertissements`);

        await sock.sendMessage(senderJid, {
          text: MessageFormatter.panel({
            title: 'Utilisateur banni',
            body: [
              `Utilisateur: @${userToWarn.split('@')[0]}`,
              `Raison: ${reason}`,
              `Avertissements: ${warnedUser.warnings}/3`,
              `Moderateur: ${message.pushName || 'Admin'}`,
            ],
          }),
          mentions: [userToWarn],
        });
        return;
      }

      await warnedUser.save();
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.panel({
          title: 'Avertissement enregistre',
          body: [
            `Utilisateur: @${userToWarn.split('@')[0]}`,
            `Raison: ${reason}`,
            `Avertissements: ${warnedUser.warnings}/3`,
            `Restants avant ban: ${3 - warnedUser.warnings}`,
            `Moderateur: ${message.pushName || 'Admin'}`,
          ],
        }),
        mentions: [userToWarn],
      });
    } catch (error) {
      await sock.sendMessage(senderJid, {
        text: MessageFormatter.publicError('Avertissement impossible', error),
      });
    }
  },
};
