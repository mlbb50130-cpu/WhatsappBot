// COMMANDE: !team - Gestion des équipes MLBB
const MLBBProfile = require('../../models/MLBBProfile');
const CooldownManager = require('../../utils/cooldown');

const cooldown = new CooldownManager(2000);

module.exports = {
  name: 'team',
  aliases: ['equipe', 'squad', 'crew'],
  category: 'Gaming',
  description: 'Gestion des équipes MLBB',
  usage: '!team <create|join|leave|list|info|disband>',
  
  async execute(sock, message, args) {
    const from = message.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const senderJid = message.key.participant || from;
    const senderName = message.pushName || 'Joueur';

    if (!isGroup) {
      return sock.sendMessage(from, {
        text: '❌ Cette commande fonctionne uniquement en groupe!'
      });
    }

    if (cooldown.isOnCooldown(senderJid)) {
      return sock.sendMessage(from, {
        text: `⏱️ Patiente ${cooldown.getTimeLeft(senderJid) / 1000}s`
      });
    }

    const subcommand = args[0]?.toLowerCase();

    // !team create <nom>
    if (subcommand === 'create') {
      if (!args[1]) {
        return sock.sendMessage(from, {
          text: '❌ Usage: !team create <nom_équipe>'
        });
      }

      const teamName = args.slice(1).join(' ');

      try {
        const team = await MLBBProfile.createTeam(teamName, senderJid, senderName);
        
        cooldown.setCooldown(senderJid);
        return sock.sendMessage(from, {
          text: `✅ Équipe créée!\n\n🏆 *${team.name}*\n👥 Membres: ${team.members.length}\n👤 Capitaine: ${team.creatorName}`
        });
      } catch (error) {
        console.error('Team creation error:', error);
        return sock.sendMessage(from, {
          text: '❌ Erreur lors de la création de l\'équipe'
        });
      }
    }

    // !team list
    if (subcommand === 'list') {
      try {
        const allTeams = await MLBBProfile.getAllTeams();

        if (allTeams.length === 0) {
          cooldown.setCooldown(senderJid);
          return sock.sendMessage(from, {
            text: '❌ Aucune équipe existante!\n\nCrée la première avec: !team create <nom>'
          });
        }

        const teamsList = allTeams.map((team, i) => 
          `${i + 1}. *${team.name}*\n   👤 Capitaine: ${team.creatorName}\n   👥 Membres: ${team.members.length}\n   📅 Créée: ${new Date(team.createdAt).toLocaleDateString('fr-FR')}`
        ).join('\n\n');

        cooldown.setCooldown(senderJid);
        return sock.sendMessage(from, {
          text: `
╔════════════════════════════════════╗
║        🏆 É𝔔𝔘𝔌𝔓𝔈𝔖 𝔇𝔌𝔖𝔓𝔒𝔑𝔌𝔅𝔏𝔈𝔖 🏆   ║
╚════════════════════════════════════╝

${teamsList}

💡 *Rejoins avec:* !team join <nom>
          `
        });
      } catch (error) {
        console.error('Teams list error:', error);
        return sock.sendMessage(from, {
          text: '❌ Erreur lors de la récupération des équipes'
        });
      }
    }

    // !team join <nom>
    if (subcommand === 'join') {
      if (!args[1]) {
        return sock.sendMessage(from, {
          text: '❌ Usage: !team join <nom_équipe>'
        });
      }

      const teamName = args.slice(1).join(' ');
      
      try {
        const allTeams = await MLBBProfile.getAllTeams();
        const team = allTeams.find(t => t.name.toLowerCase() === teamName.toLowerCase());

        if (!team) {
          cooldown.setCooldown(senderJid);
          return sock.sendMessage(from, {
            text: `❌ Équipe "${teamName}" non trouvée!`
          });
        }

        const updated = await MLBBProfile.addToTeam(team.id, senderJid, senderName);
        
        if (!updated) {
          cooldown.setCooldown(senderJid);
          return sock.sendMessage(from, {
            text: '❌ Tu es déjà dans cette équipe!'
          });
        }

        cooldown.setCooldown(senderJid);
        return sock.sendMessage(from, {
          text: `✅ Tu as rejoint ${team.name}!\n\n👥 Membres: ${updated.members.length}\n🏆 ${team.name}`
        });
      } catch (error) {
        console.error('Team join error:', error);
        return sock.sendMessage(from, {
          text: '❌ Erreur lors de la rejointe'
        });
      }
    }

    // !team leave
    if (subcommand === 'leave') {
      try {
        const allTeams = await MLBBProfile.getAllTeams();
        const userTeam = allTeams.find(t => t.members.some(m => m.jid === senderJid));

        if (!userTeam) {
          cooldown.setCooldown(senderJid);
          return sock.sendMessage(from, {
            text: '❌ Tu n\'es dans aucune équipe!'
          });
        }

        await MLBBProfile.removeFromTeam(userTeam.id, senderJid);

        cooldown.setCooldown(senderJid);
        return sock.sendMessage(from, {
          text: `✅ Tu as quitté ${userTeam.name}!`
        });
      } catch (error) {
        console.error('Team leave error:', error);
        return sock.sendMessage(from, {
          text: '❌ Erreur lors de la sortie'
        });
      }
    }

    // !team info
    if (subcommand === 'info') {
      try {
        const allTeams = await MLBBProfile.getAllTeams();
        const userTeam = allTeams.find(t => t.members.some(m => m.jid === senderJid));

        if (!userTeam) {
          cooldown.setCooldown(senderJid);
          return sock.sendMessage(from, {
            text: '❌ Tu n\'es dans aucune équipe!'
          });
        }

        const membersList = userTeam.members.map((m, i) => 
          `${i + 1}. ${m.name} [${m.role}]`
        ).join('\n');

        cooldown.setCooldown(senderJid);
        return sock.sendMessage(from, {
          text: `
╔════════════════════════════════════╗
║      🏆 ${userTeam.name.toUpperCase()} 🏆      ║
╚════════════════════════════════════╝

*📊 INFOS ÉQUIPE*
├ Capitaine: ${userTeam.creatorName}
├ Membres: ${userTeam.members.length}
└ Créée: ${new Date(userTeam.createdAt).toLocaleDateString('fr-FR')}

*👥 ROSTER*
${membersList}

💡 *COMMANDES*
!team leave - Quitter l'équipe
!team list - Lister toutes les équipes
          `
        });
      } catch (error) {
        console.error('Team info error:', error);
        return sock.sendMessage(from, {
          text: '❌ Erreur'
        });
      }
    }

    // !team disband (Captain only)
    if (subcommand === 'disband') {
      try {
        const allTeams = await MLBBProfile.getAllTeams();
        const userTeam = allTeams.find(t => t.creator === senderJid);

        if (!userTeam) {
          cooldown.setCooldown(senderJid);
          return sock.sendMessage(from, {
            text: '❌ Tu n\'es capitaine d\'aucune équipe!'
          });
        }

        await MLBBProfile.deleteTeam(userTeam.id);

        cooldown.setCooldown(senderJid);
        return sock.sendMessage(from, {
          text: `✅ Équipe ${userTeam.name} dissoute!`
        });
      } catch (error) {
        console.error('Team disband error:', error);
        return sock.sendMessage(from, {
          text: '❌ Erreur lors de la dissolution'
        });
      }
    }

    // Help
    const helpText = `
❌ Subcommande inconnue!

*USAGE:*
!team create <nom> - Créer équipe
!team join <nom> - Rejoindre équipe
!team leave - Quitter équipe
!team list - Lister équipes
!team info - Infos ta équipe
!team disband - Dissoudre ta équipe (Captain)
    `;

    cooldown.setCooldown(senderJid);
    return sock.sendMessage(from, { text: helpText });
  }
};
