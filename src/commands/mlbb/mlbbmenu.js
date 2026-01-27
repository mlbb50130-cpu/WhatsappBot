// COMMANDE: !mlbbmenu - Menu complet des commandes MLBB
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'mlbbmenu',
  aliases: ['mlbbhelp', 'mlbbcommandes', 'mlbboptions'],
  category: 'gaming',
  description: 'Menu complet des commandes MLBB',
  usage: '!mlbbmenu',
  groupOnly: true,
  cooldown: 3,

  async execute(sock, message, args) {
    const from = message.key.remoteJid;

    const menu = `
╔═══════════════════════════════════════════════╗
║          🎮 𝔐𝔈𝔑𝔘 𝔆𝔒𝔐𝔓𝔏𝔈𝔗 𝔐𝔏𝔅𝔅 🎮             ║
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
