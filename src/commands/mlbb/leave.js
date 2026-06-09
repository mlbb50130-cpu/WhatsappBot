const MLBBProfile = require('../../models/MLBBProfile');
const config = require('../../config');
const Access = require('../../services/botAccessService');
const MessageFormatter = require('../../utils/messageFormatter');

function getText(message) {
  return message.message?.conversation || message.message?.extendedTextMessage?.text || '';
}

function invokedCommand(message) {
  const text = getText(message).trim();
  if (!text.startsWith(config.PREFIX)) return '';
  return text.slice(config.PREFIX.length).trim().split(/\s+/)[0].toLowerCase();
}

module.exports = {
  name: 'leave',
  aliases: ['l'],
  category: 'gaming',
  description: 'Quitter une equipe MLBB ou faire sortir le bot du groupe',
  usage: '!leave <team> | !leave',
  cooldown: 2,

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || jid;
    const isGroup = jid.endsWith('@g.us');

    try {
      if (!isGroup) {
        return sock.sendMessage(jid, {
          text: MessageFormatter.warning('Cette commande fonctionne seulement en groupe.'),
        }, { quoted: msg });
      }

      if (!args.length) {
        if (invokedCommand(msg) !== 'leave') {
          return sock.sendMessage(jid, {
            text: MessageFormatter.warning(`Utilise: ${config.PREFIX}leave <nom_team>`),
          }, { quoted: msg });
        }

        if (!(await Access.isModerator(sender))) {
          return sock.sendMessage(jid, {
            text: MessageFormatter.error('Commande reservee au proprietaire ou aux moderateurs du bot.'),
          }, { quoted: msg });
        }

        if (typeof sock.groupLeave !== 'function') {
          return sock.sendMessage(jid, {
            text: MessageFormatter.error('La fonction groupLeave nest pas disponible sur cette session.'),
          }, { quoted: msg });
        }

        await sock.sendMessage(jid, {
          text: MessageFormatter.warning('Je quitte ce groupe sur demande.'),
        }, { quoted: msg });
        await sock.groupLeave(jid);
        return;
      }

      const teamName = args.join(' ');
      const teams = MLBBProfile.getGroupTeams(jid);
      const team = teams[teamName];

      if (!team) {
        return sock.sendMessage(jid, {
          text: MessageFormatter.warning(`Equipe "${teamName}" introuvable.`),
        }, { quoted: msg });
      }

      if (!team.members.includes(sender)) {
        return sock.sendMessage(jid, {
          text: MessageFormatter.warning(`Tu n'es pas dans l'equipe "${teamName}".`),
        }, { quoted: msg });
      }

      MLBBProfile.leaveTeam(jid, teamName, sender);

      return sock.sendMessage(jid, {
        text: MessageFormatter.success(`Tu as quitte l'equipe "${teamName}".`),
      }, { quoted: msg });
    } catch (error) {
      console.error('Erreur leave:', error);
      return sock.sendMessage(jid, {
        text: MessageFormatter.error(`Erreur leave: ${error.message}`),
      }, { quoted: msg });
    }
  },
};
