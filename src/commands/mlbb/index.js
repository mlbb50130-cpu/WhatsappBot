// WRAPPER pour !mlbb avec sous-commandes
// Ce fichier gère le routage des sous-commandes
const MLBBProfile = require('../../models/MLBBProfile');
const mlbbData = require('../../data/mlbbDatabase');
const CooldownManager = require('../../utils/cooldown');

const cooldown = new CooldownManager(3000);

module.exports = {
  name: 'mlbb',
  aliases: ['ml', 'legends', 'moba'],
  category: 'Gaming',
  description: 'Système complet Mobile Legends Bang Bang',
  usage: '!mlbb <subcommande>',
  groupOnly: true,
  cooldown: 3,
  
  async execute(sock, message, args, user, isGroup, groupData) {
    const from = message.key.remoteJid;
    const senderJid = message.key.participant || from;
    const senderName = message.pushName || 'Joueur';

    const subcommand = args[0]?.toLowerCase();

    // ==================== !mlbb set ====================
    if (subcommand === 'set') {
      if (args.length < 3) {
        return sock.sendMessage(from, {
          text: `❌ Usage: !mlbb set <rang> <rôle>\n\n*Rangs:* ${mlbbData.ranks.join(', ')}\n*Rôles:* ${mlbbData.roles.join(', ')}`
        });
      }

      const rang = args[1].toLowerCase();
      const role = args[2].toLowerCase();

      // Vérifier rang valide
      if (!mlbbData.ranks.some(r => r.toLowerCase() === rang)) {
        return sock.sendMessage(from, {
          text: `❌ Rang invalide!\n\n*Rangs:* ${mlbbData.ranks.join(', ')}`
        });
      }

      // Vérifier rôle valide
      if (!mlbbData.roles.some(r => r.toLowerCase() === role)) {
        return sock.sendMessage(from, {
          text: `❌ Rôle invalide!\n\n*Rôles:* ${mlbbData.roles.join(', ')}`
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
        console.error('Profile set error:', error);
        return sock.sendMessage(from, {
          text: '❌ Erreur lors de la sauvegarde du profil'
        });
      }
    }

    // ==================== !mlbb me ====================
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
║        🎮 TON PROFIL MLBB 🎮        ║
╚════════════════════════════════════╝

👤 *Joueur:* ${profile.username}
🎖️ *Rang:* ${profile.rank}
🎯 *Rôle Principal:* ${profile.role}
📅 *Inscrit:* ${new Date(profile.createdAt).toLocaleDateString('fr-FR')}
🔄 *Maj:* ${new Date(profile.updatedAt).toLocaleDateString('fr-FR')}

📊 *Recommandations:*
• Builds populaires: !build assassin_burst
• Guides role: !lane ${profile.role.toLowerCase()}
• Astuce quotidienne: !tip
`;

        return sock.sendMessage(from, { text: statsText });
      } catch (error) {
        console.error('Profile get error:', error);
        return sock.sendMessage(from, {
          text: '❌ Erreur lors de la lecture du profil'
        });
      }
    }

    // ==================== !mlbb reset ====================
    if (subcommand === 'reset') {
      try {
        const success = await MLBBProfile.deleteProfile(senderJid);
        if (success) {
          return sock.sendMessage(from, {
            text: '✅ Profil MLBB supprimé!'
          });
        }
      } catch (error) {
        console.error('Profile delete error:', error);
        return sock.sendMessage(from, {
          text: '❌ Erreur lors de la suppression'
        });
      }
    }

    // ==================== Menu d'aide par défaut ====================
    const helpText = `
╔════════════════════════════════════╗
║     🎮 MOBILE LEGENDS BANG BANG 🎮  ║
╚════════════════════════════════════╝

*📖 COMMANDES DISPONIBLES:*

┌─ PROFIL
├ !mlbb set <rang> <rôle> - Enregistrer profil
├ !mlbb me - Voir ton profil MLBB
└ !mlbb reset - Supprimer profil

┌─ HÉROS & GUIDES
├ !hero <nom> - Infos détaillées héro
├ !build <type> - Build recommandée
├ !counter <héro> - Counters efficaces
└ !combo <héro> - Combos de dégâts

┌─ META & STRATÉGIE
├ !meta - Meta actuelle
├ !lane <role> - Guide lane/position
└ !tip - Conseil aléatoire

┌─ ÉQUIPES
├ !team create <nom> - Créer équipe
├ !team join <nom> - Rejoindre équipe
├ !team leave - Quitter équipe
├ !team list - Lister équipes
└ !team disband - Dissoudre équipe

*📊 RANGS DISPONIBLES:*
${mlbbData.ranks.join(' → ')}

*🎯 RÔLES:*
${mlbbData.roles.join(' • ')}

*🚀 ASTUCE:*
Enregistre ton profil: !mlbb set <rang> <role>
`;

    return sock.sendMessage(from, { text: helpText });
  }
};
