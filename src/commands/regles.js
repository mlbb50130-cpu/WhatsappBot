const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'regles',
  description: 'Affiche les règles du groupe',
  category: 'BOT',
  usage: '!regles',
  adminOnly: false,
  groupOnly: true,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      const rules = `
╔════════════════════════════════════╗
║       📋 𝔕È𝔊𝔏𝔈𝔖 𝔇𝔘 𝔊𝔕𝔒𝔘𝔓𝔈 📋      ║
╚════════════════════════════════════╝

1️⃣ *RESPECT*
   ✅ Sois respectueux envers tous les membres
   ❌ Pas d'insultes, de discrimination ou de harcèlement

2️⃣ *SPAM*
   ✅ Envoie des messages normaux
   ❌ Pas de spam, flood ou messages inutiles

3️⃣ *CONTENU ADULTE*
   ✅ Partage du contenu approprié
   ❌ Pas d'images ou vidéos explicites

4️⃣ *PUBLICITÉ*
   ✅ Partage avec modération si c'est pertinent
   ❌ Pas de pub excessive ou de scams

5️⃣ *UTILISATION DU BOT*
   ✅ Utilise les commandes dans le groupe
   ❌ Pas d'abus du bot ou de spam de commandes

6️⃣ *LANGAGE*
   ✅ Français ou anglais principalement
   ❌ Limiter les langes étrangers excessifs

═════════════════════════════════════

⚠️ *SANCTIONS*
   1ère infraction: Avertissement
   2ème: Mute temporaire
   3ème: Kick du groupe

═════════════════════════════════════
👑 Amusez-vous et respectez les règles!`;

      if (reply) {
        await reply({ text: rules });
      } else {
        await sock.sendMessage(senderJid, { text: rules });
      }
    } catch (error) {
      if (reply) {
        await reply({ text: '❌ Erreur!' });
      } else {
        await sock.sendMessage(senderJid, { text: '❌ Erreur!' });
      }
    }
  }
};
