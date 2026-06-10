const MLBBProfile = require('../../models/MLBBProfile');
const MessageFormatter = require('../../utils/messageFormatter');

module.exports = {
  name: 'join',
  aliases: ['j'],
  category: 'gaming',
  description: 'Rejoindre une equipe MLBB',
  cooldown: 2,

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      const sender = msg.key.participant || jid;
      const isGroup = jid.endsWith('@g.us');

      if (!isGroup) {
        return sock.sendMessage(jid, {
          text: MessageFormatter.warning('Cette commande fonctionne seulement en groupe.'),
        });
      }

      if (!args.length) {
        return sock.sendMessage(jid, {
          text: MessageFormatter.warning('Utilise: !join <nom_team>'),
        });
      }

      const teamName = args.join(' ');
      const teams = MLBBProfile.getGroupTeams(jid);
      const team = teams[teamName];

      if (!team) {
        return sock.sendMessage(jid, {
          text: MessageFormatter.warning(`Equipe "${teamName}" introuvable.`),
        });
      }

      if (team.members.some((member) => member === sender)) {
        return sock.sendMessage(jid, {
          text: MessageFormatter.warning(`Tu es deja dans l equipe "${teamName}".`),
        });
      }

      MLBBProfile.joinTeam(jid, teamName, sender);

      return sock.sendMessage(jid, {
        text: MessageFormatter.success(`Bienvenue dans l equipe "${teamName}". Membres: ${team.members.length + 1}`),
      });
    } catch (error) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.publicError('Join impossible', error),
      });
    }
  },
};
