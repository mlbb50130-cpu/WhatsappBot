const MLBBProfile = require('../../models/MLBBProfile');

module.exports = {
  name: 'team',
  aliases: ['t'],
  category: 'gaming',
  description: 'Gestion des équipes MLBB',
  cooldown: 3,

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
        const teams = MLBBProfile.getGroupTeams(jid);
        const teamList = Object.entries(teams).length > 0
          ? Object.entries(teams)
              .map(([name, team]) => `• ${name} (${team.members.length} membres)`)
              .join('\n')
          : 'Aucune équipe';

        return sock.sendMessage(jid, {
          text: `👥 *Équipes du groupe*\n\n${teamList}\n\n!team <nom> - Créer une équipe`
        });
      }

      const teamName = args.join(' ');
      const team = MLBBProfile.createTeam(jid, teamName, sender);

      return sock.sendMessage(jid, {
        text: `✅ Équipe "${teamName}" créée!\n\n!join ${teamName} - Rejoindre l'équipe`
      });

    } catch (error) {
      console.error('Erreur team:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};
