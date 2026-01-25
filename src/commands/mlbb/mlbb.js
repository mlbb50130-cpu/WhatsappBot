// COMMANDE: !mlbb - Guide complet MLBB
const mlbbData = require('../../data/mlbbDatabase');
const CooldownManager = require('../../utils/cooldown');

const cooldown = new CooldownManager(5000); // 5s cooldown

module.exports = {
  name: 'mlbb',
  aliases: ['ml', 'legends'],
  category: 'Gaming',
  description: 'Guide complet Mobile Legends Bang Bang',
  usage: '!mlbb <subcommande>',
  
  async execute(sock, message, args, user) {
    const from = message.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const senderJid = message.key.participant || from;

    // Vérifier groupe
    if (!isGroup) {
      return sock.sendMessage(from, {
        text: '❌ Cette commande fonctionne uniquement en groupe!'
      });
    }

    // Cooldown
    if (cooldown.isOnCooldown(senderJid)) {
      return sock.sendMessage(from, {
        text: `⏱️ Patiente ${cooldown.getTimeLeft(senderJid) / 1000}s avant de réutiliser cette commande`
      });
    }

    const subcommand = args[0]?.toLowerCase();

    const helpText = `
╔════════════════════════════════════╗
║     🎮 MOBILE LEGENDS BANG BANG 🎮  ║
╚════════════════════════════════════╝

*📖 COMMANDES DISPONIBLES:*

┌─ PROFIL
├ !mlbb set <rang> <rôle> - Enregistrer ton profil
├ !mlbb me - Voir ton profil MLBB
└ !mlbb reset - Supprimer ton profil

┌─ HÉROS & GUIDES
├ !hero <nom> - Infos détaillées héro
├ !build <type> - Build recommandée
├ !counter <héro> - Counters efficaces
└ !combo <héro> - Combos de dégâts

┌─ META & STRATÉGIE
├ !meta - Meta actuelle
├ !lane <role> - Guide lane/position
└ !tip - Conseil de jeu aléatoire

┌─ ÉQUIPES
├ !team create <nom> - Créer une équipe
├ !team join <nom> - Rejoindre équipe
├ !team leave - Quitter équipe
├ !team list - Lister équipes
└ !team disband - Dissoudre équipe

*📊 RANGS DISPONIBLES:*
${mlbbData.ranks.join(' → ')}

*🎯 RÔLES:*
${mlbbData.roles.join(' • ')}

*🚀 ASTUCE:*
Enregistre ton profil pour des stats personnalisées!
`;

    cooldown.setCooldown(senderJid);
    return sock.sendMessage(from, { text: helpText });
  }
};
