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

    // ==================== Menu complet MLBB par défaut ====================
    const menu = `
╔═══════════════════════════════════════════════╗
║          🎮 MENU COMPLET MLBB 🎮             ║
╚═══════════════════════════════════════════════╝

🎯 *CATÉGORIE: HÉROS & INFOS*

1️⃣ *!hero <nom>*
   Affiche les infos complètes d'un héros
   Ex: !hero ling
   📊 Stats, rôle, lane, compétences, counters

2️⃣ *!build <nom>*
   Affiche les 3 builds optimisées pour un héros
   Ex: !build brody
   🛠️ Build damage, balanced, support

3️⃣ *!counter <nom>*
   Affiche qui countre ce héros et qui ce héros countre
   Ex: !counter ling
   ✅ Effectif contre / ⚠️ Faible contre

4️⃣ *!combo <nom>*
   Affiche les combos optimaux du héros
   Ex: !combo alice
   ⚡ Séquence de compétences + dégâts

5️⃣ *!meta*
   État actuel du meta - Tier list S/A/B
   🔴 S-tier (OP) / 🟡 A-tier / 🟢 B-tier
   Patch actuel et notes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 *CATÉGORIE: GUIDES*

6️⃣ *!lane <nom>*
   Guide complet d'une lane (top, mid, bottom, jungle)
   Ex: !lane jungle
   📚 Description, rôles, héros populaires

7️⃣ *!tip*
   Conseil MLBB aléatoire
   💡 Astuces stratégiques, positionnement, CS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 *CATÉGORIE: PROFIL & ÉQUIPES*

8️⃣ *!mlbb set <rang> <role>*
   Enregistre ton profil MLBB
   Ex: !mlbb set legend jungler
   🎮 Rank, role, héros favoris

9️⃣ *!mlbb me*
   Affiche ton profil MLBB
   👤 Ton rang, rôle, statistiques

🔟 *!team <nom>*
   Créer ou voir une équipe
   Ex: !team MonEquipe
   👥 Gestion de membres, créateur

1️⃣1️⃣ *!join <team>*
   Rejoindre une équipe
   Ex: !join MonEquipe

1️⃣2️⃣ *!leave <team>*
   Quitter une équipe
   Ex: !leave MonEquipe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️ *CATÉGORIE: ADMIN*

1️⃣3️⃣ *!setmodule on mlbb*
   Activer le module MLBB (Admin seulement)

1️⃣4️⃣ *!setmodule off mlbb*
   Désactiver le module MLBB (Admin seulement)

1️⃣5️⃣ *!setmodule status*
   Voir l'état de tous les modules

1️⃣6️⃣ *!selectpack*
   Changer de pack (Admin seulement)
   📺 OTAKU / 🎮 GAMIN / 🌟 COMPLET

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *HÉROS POPULAIRES:*
ling, brody, alice, valir, natalia, hanabi,
moskov, lolita, esmeralda, fanny, hayabusa,
helcurt, alucard, roger, chou, silvanna, ...

🎯 *LANES:*
top, mid, bottom, jungle

📊 *STATISTIQUES:*
HP, ATK, DEF, ASP

💡 *TIPS:*
• Utilise !hero pour connaître les stats
• Utilise !counter avant de jouer
• Consulte !meta pour le patch actuel
• Demande des combos avec !combo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 *COMMANDES RAPIDES:*
!mlbbmenu - Ce menu
!hero <nom> - Info héros
!build <nom> - Builds
!counter <nom> - Counters
!combo <nom> - Combos
!meta - Tier list
!lane <nom> - Guide lane
!tip - Conseil aléatoire

📱 *Besoin d'aide?*
Tape la commande pour obtenir plus de détails!
Ex: !hero pour voir les héros disponibles`;

    return sock.sendMessage(from, { text: menu });
  }
};
