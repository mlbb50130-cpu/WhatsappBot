const MLBBProfile = require('../../models/MLBBProfile');

module.exports = {
  name: 'leave',
  aliases: ['l'],
  category: 'gaming',
  description: 'Quitter une équipe MLBB',
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
          text: '❌ Utilise: !leave <nom_team>'
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

      if (!team.members.includes(sender)) {
        return sock.sendMessage(jid, {
          text: `❌ Tu n'es pas dans l'équipe "${teamName}"`
        });
      }

      MLBBProfile.leaveTeam(jid, teamName, sender);

      return sock.sendMessage(jid, {
        text: `👋 Tu as quitté l'équipe "${teamName}"`
      });

    } catch (error) {
      console.error('Erreur leave:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};
