const MLBBProfile = require('../../models/MLBBProfile');

module.exports = {
  name: 'join',
  aliases: ['j'],
  category: 'gaming',
  description: 'Rejoindre une équipe MLBB',
  cooldown: 2,

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || jid;
      const isGroup = jid.endsWith('@g.us');
      
      if (!isGroup) {
        return sock.sendMessage(jid, {
          text: '❌ Cette commande ne fonctionne que en groupe'
        });
      }

      if (!args.length) {
        return sock.sendMessage(jid, {
          text: '❌ Utilise: !join <nom_team>'
        });
      }

      const teamName = args.join(' ');
      const teams = MLBBProfile.getGroupTeams(jid);
      const team = teams[teamName];

      if (!team) {
        return sock.sendMessage(jid, {
          text: `❌ Équipe "${teamName}" non trouvée.`
        });
      }

      if (team.members.some(m => m === sender)) {
        return sock.sendMessage(jid, {
          text: `❌ Tu es déjà dans l'équipe "${teamName}"`
        });
      }

      MLBBProfile.joinTeam(jid, teamName, sender);

      return sock.sendMessage(jid, {
        text: `✅ Bienvenue dans l'équipe "${teamName}"!\n\n👥 Membres: ${team.members.length + 1}`
      });

    } catch (error) {
      console.error('Erreur join:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};
