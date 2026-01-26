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
      if (!user.equipped) {
        user.equipped = { head: null, body: null, hands: null, feet: null };
        await user.save();
      }

      const slots = {
        head: '👑',
        body: '🧥',
        hands: '🤚',
        feet: '👞'
      };

      const equipmentMessage = `
╔════════════════════════════════════╗
║        ⚔️ TON ÉQUIPEMENT ⚔️        ║
╚════════════════════════════════════╝

👤 *${user.username || 'Joueur'}*

${slots.head} *Tête:* ${user.equipped.head?.name || '❌ Vide'}
${slots.body} *Corps:* ${user.equipped.body?.name || '❌ Vide'}
${slots.hands} *Mains:* ${user.equipped.hands?.name || '❌ Vide'}
${slots.feet} *Pieds:* ${user.equipped.feet?.name || '❌ Vide'}

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
