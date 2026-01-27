const MessageFormatter = require('../utils/messageFormatter');
const EquipmentPassiveXP = require('../utils/equipmentPassiveXP');

module.exports = {
  name: 'equipement',
  description: 'Voir ton équipement actuel',
  category: 'INVENTAIRE',
  usage: '!equipement',
  adminOnly: false,
  groupOnly: false,
  cooldown: 2,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    try {
      // Initialiser equipped s'il n'existe pas
      if (!user.equipped) {
        user.equipped = { 
          head: { itemId: null, name: null },
          body: { itemId: null, name: null },
          hands: { itemId: null, name: null },
          feet: { itemId: null, name: null }
        };
        await user.save();
      }

      const slots = {
        head: '👑',
        body: '🧥',
        hands: '🤚',
        feet: '👞'
      };

      // Afficher les équipements
      const getEquipmentText = (slot) => {
        const equipped = user.equipped[slot];
        if (!equipped || !equipped.name) {
          return `❌ Vide`;
        }
        return equipped.name;
      };

      // Calculer les XP passifs des équipements
      const { items: equippedItems, totalXP } = EquipmentPassiveXP.getEquipmentXPDetails(user.equipped);

      let equipmentMessage = `
╔════════════════════════════════════╗
║        ⚔️ 𝔗𝔒𝔑 É𝔔𝔘𝔌𝔓𝔈𝔐𝔈𝔑𝔗 ⚔️        ║
╚════════════════════════════════════╝

👤 *${user.username || 'Joueur'}*

${slots.head} *Tête:* ${getEquipmentText('head')}
${slots.body} *Corps:* ${getEquipmentText('body')}
${slots.hands} *Mains:* ${getEquipmentText('hands')}
${slots.feet} *Pieds:* ${getEquipmentText('feet')}

═════════════════════════════════════`;

      // Ajouter les XP passifs si équipement
      if (totalXP > 0) {
        equipmentMessage += `

📊 *XP PASSIFS PAR HEURE:*
`;
        equippedItems.forEach(item => {
          const rarityEmojis = {
            common: '⚪',
            rare: '🔵',
            epic: '🟣',
            legendary: '🟡'
          };
          equipmentMessage += `${rarityEmojis[item.rarity]} ${item.name}: +${item.xpPerHour} XP/h\n`;
        });
        equipmentMessage += `
🎁 *TOTAL: +${totalXP} XP/h*`;
      }

      equipmentMessage += `

═════════════════════════════════════

*Pour équiper un objet:*
\`!equip <id> <slot>\`

*Exemple:* \`!equip 0 head\`

Utilise \`!inventaire\` pour voir tes items!
═════════════════════════════════════`;

      await sock.sendMessage(senderJid, { text: equipmentMessage });
    } catch (error) {
      console.error('Error in equipement command:', error.message);
      await sock.sendMessage(senderJid, { text: '❌ Erreur lors de la récupération de l\'équipement!' });
    }
  }
};
