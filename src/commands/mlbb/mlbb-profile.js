// COMMANDE: !mlbb set et !mlbb me - Gestion profil
const MLBBProfile = require('../../models/MLBBProfile');
const mlbbData = require('../../data/mlbbDatabase');

module.exports = {
  name: 'mlbb-profile',
  aliases: ['mlbbprofile'],
  category: 'Gaming',
  description: 'Gestion du profil MLBB',
  
  async execute(sock, message, args, user, subcommand) {
    const from = message.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const senderJid = message.key.participant || from;
    const senderName = message.pushName || 'Joueur';

    if (!isGroup) {
      return sock.sendMessage(from, {
        text: '❌ Cette commande fonctionne uniquement en groupe!'
      });
    }

    // !mlbb set <rang> <role>
    if (subcommand === 'set') {
      if (args.length < 2) {
        return sock.sendMessage(from, {
          text: `❌ Usage: !mlbb set <rang> <role>\n\nRangs: ${mlbbData.ranks.join(', ')}\nRôles: ${mlbbData.roles.join(', ')}`
        });
      }

      const rang = args[0].toLowerCase();
      const role = args[1].toLowerCase();

      // Vérifier rang valide
      if (!mlbbData.ranks.some(r => r.toLowerCase() === rang)) {
        return sock.sendMessage(from, {
          text: `❌ Rang invalide!\n\nRangs: ${mlbbData.ranks.join(', ')}`
        });
      }

      // Vérifier rôle valide
      if (!mlbbData.roles.some(r => r.toLowerCase() === role)) {
        return sock.sendMessage(from, {
          text: `❌ Rôle invalide!\n\nRôles: ${mlbbData.roles.join(', ')}`
        });
      }

      try {
        const profile = await MLBBProfile.setProfile(
          senderJid,
          senderName,
          rang.charAt(0).toUpperCase() + rang.slice(1),
          role.charAt(0).toUpperCase() + role.slice(1)
        );

        return sock.sendMessage(from, {
          text: `✅ Profil mis à jour!\n\n👤 *Joueur:* ${senderName}\n🎖️ *Rang:* ${profile.rank}\n🎯 *Rôle:* ${profile.role}\n⏰ *Date:* ${new Date(profile.updatedAt).toLocaleDateString('fr-FR')}`
        });
      } catch (error) {
        return sock.sendMessage(from, {
          text: '❌ Erreur lors de la sauvegarde du profil'
        });
      }
    }

    // !mlbb me - Afficher profil
    if (subcommand === 'me') {
      try {
        const profile = await MLBBProfile.getProfile(senderJid);

        if (!profile) {
          return sock.sendMessage(from, {
            text: '❌ Tu n\'as pas encore de profil MLBB!\n\nEnregistre-toi avec: !mlbb set <rang> <role>'
          });
        }

        const statsText = `
╔════════════════════════════════════╗
║        🎮 𝔗𝔒𝔑 𝔓𝔕𝔒𝔉𝔌𝔏 𝔐𝔏𝔅𝔅 🎮        ║
╚════════════════════════════════════╝

👤 *Joueur:* ${profile.username}
🎖️ *Rang:* ${profile.rank}
🎯 *Rôle Principal:* ${profile.role}
📅 *Inscrit:* ${new Date(profile.createdAt).toLocaleDateString('fr-FR')}
🔄 *Maj:* ${new Date(profile.updatedAt).toLocaleDateString('fr-FR')}

📊 *Recommandations:*
• Builds populaires: !build ${profile.role.toLowerCase()}
• Guides role: !lane ${profile.role.toLowerCase()}
• Astuce quotidienne: !tip
`;

        return sock.sendMessage(from, { text: statsText });
      } catch (error) {
        return sock.sendMessage(from, {
          text: '❌ Erreur lors de la lecture du profil'
        });
      }
    }

    // !mlbb reset - Supprimer profil
    if (subcommand === 'reset') {
      try {
        const success = await MLBBProfile.deleteProfile(senderJid);
        if (success) {
          return sock.sendMessage(from, {
            text: '✅ Profil MLBB supprimé!'
          });
        }
      } catch (error) {
      }
    }
  }
};
