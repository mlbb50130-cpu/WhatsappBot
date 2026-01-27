const XPSystem = require('../utils/xpSystem');
const MessageFormatter = require('../utils/messageFormatter');
const equipmentPassiveXP = require('../utils/equipmentPassiveXP');

module.exports = {
  name: 'profil',
  description: 'ℜ𝓸𝓲𝓻 𝓽𝓸𝓷 𝓹𝓻𝓸𝓯𝓲𝓵 𝓸𝓽𝓪𝓴𝓾',
  category: 'PROFIL',
  usage: '!profil',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    const levelInfo = XPSystem.calculateLevelFromXp(user.xp);
    const rankInfo = XPSystem.getRank(levelInfo.level);
    
    const progressBar = MessageFormatter.progressBar(levelInfo.currentLevelXp, levelInfo.requiredXp, 15);
    
    const badges = user.badges.length > 0 
      ? user.badges.map(b => `${b.emoji} ${b.name}`).join(', ')
      : '❌ Aucun badge';

    // Main profile info
    const profileInfo = [
      { label: '🧡 Nom', value: user.username },
      { label: '⭐ Rang', value: `${rankInfo.emoji} ${user.rank}` },
      { label: '🏷️ Titre', value: user.title || '❌ Aucun' },
      { label: '🔥 XP', value: user.xp },
      { label: '⬆️ Niveau', value: levelInfo.level }
    ];

    const statsInfo = [
      { label: '� Messages', value: user.stats.messages },
      { label: '🧠 Quiz', value: user.stats.quiz },
      { label: '⚡ Duels', value: user.stats.duels },
      { label: '🥇 Victoires', value: user.stats.wins },
      { label: '❌ Défaites', value: user.stats.losses }
    ];

    const inventoryInfo = [
      { label: '💎 Objets', value: user.inventory.length },
      { label: '✨ Emplacements', value: `${user.inventory.length}/50` }
    ];

    const createdDate = new Date(user.createdAt).toLocaleDateString('fr-FR');
    
    // Passif XP des équipements
    const equipmentXPDetails = equipmentPassiveXP.getEquipmentXPDetails(user.equipped);
    let equipmentSection = '';
    
    if (equipmentXPDetails.totalXP > 0) {
      const equipmentLines = equipmentXPDetails.items.map(item => {
        const rarityEmojis = { common: '⚪', rare: '🔵', epic: '🟣', legendary: '🟡' };
        return `${rarityEmojis[item.rarity]} ${item.name}: +${item.xpPerHour}/h`;
      });
      equipmentLines.push(`\n⚡ *Total: +${equipmentXPDetails.totalXP} XP/heure*`);
      equipmentSection = `${MessageFormatter.elegantSection('📦 PASSIF XP', equipmentLines)}`;
    }

    const profile = `${MessageFormatter.elegantBox('𝔗𝔬𝔫 𝔓𝔯𝔬𝔣𝔦𝔩', profileInfo)}
${MessageFormatter.elegantSection('STATISTIQUES', statsInfo.map(s => `${s.label}: ${s.value}`))}
${progressBar}
${equipmentSection}
${MessageFormatter.elegantSection('BADGES', [badges])}
${MessageFormatter.elegantSection('INVENTAIRE', inventoryInfo.map(i => `${i.label}: ${i.value}`))}`;

    // Envoyer le profil avec photo si disponible
    if (user.profilePicture) {
      try {
        // Télécharger et envoyer avec la photo de profil
        const https = require('https');
        const http = require('http');
        
        const protocol = user.profilePicture.startsWith('https') ? https : http;
        
        await new Promise((resolve, reject) => {
          protocol.get(user.profilePicture, (response) => {
            let imageData = Buffer.alloc(0);
            
            response.on('data', (chunk) => {
              imageData = Buffer.concat([imageData, chunk]);
            });
            
            response.on('end', async () => {
              try {
                await sock.sendMessage(senderJid, {
                  image: imageData,
                  caption: profile
                });
                resolve();
              } catch (err) {
                reject(err);
              }
            });
          }).on('error', reject);
        });
      } catch (error) {
        // Si erreur, envoyer sans photo
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(profile));
      }
    } else {
      // Pas de photo, envoyer sans
      await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(profile));
    }
  },

  getProgressBar(current, max, length = 15) {
    const percentage = Math.min(current / max, 1);
    const filled = Math.round(percentage * length);
    const empty = length - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percent = Math.round(percentage * 100);

    return `[${bar}] ${percent}%`;
  }
};
