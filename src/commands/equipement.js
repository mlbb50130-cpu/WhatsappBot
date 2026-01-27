const MessageFormatter = require('../utils/messageFormatter');

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

      const equipmentMessage = `
╔════════════════════════════════════╗
║        ⚔️ TON ÉQUIPEMENT ⚔️        ║
╚════════════════════════════════════╝

👤 *${user.username || 'Joueur'}*

${slots.head} *Tête:* ${getEquipmentText('head')}
${slots.body} *Corps:* ${getEquipmentText('body')}
${slots.hands} *Mains:* ${getEquipmentText('hands')}
${slots.feet} *Pieds:* ${getEquipmentText('feet')}

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
