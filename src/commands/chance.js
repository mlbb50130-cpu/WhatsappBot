const MessageFormatter = require('../utils/messageFormatter');
const Luck = require('../utils/luck');

module.exports = {
  name: 'chance',
  description: 'Tirer un buff de chance (30 min) qui booste loot/roulette/surprise',
  category: 'FUN',
  usage: '!chance',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    try {
      // Si un buff est deja actif, on n'en retire pas un nouveau (pas de save-scum)
      const alreadyActive = Luck.isBuffActive(user);
      if (!alreadyActive) {
        Luck.applyBuff(user);
        await user.save();
      }

      const luck = Luck.getActiveLuck(user);
      const left = Luck.minutesLeft(user);
      const winPct = Math.round(Luck.winProbability(user) * 100);

      const status = luck >= 80 ? '✨ Chance EXTREME!'
        : luck >= 60 ? '🍀 Grande chance!'
        : luck >= 40 ? '😐 Chance moyenne'
        : luck >= 20 ? '😰 Peu de chance'
        : '🔥 Tres malchanceux';

      const bar = MessageFormatter.progressBar(luck, 100, 20);

      const items = [
        { label: '🍀 Chance', value: `${luck}%` },
        { label: 'Statut', value: status },
        { label: '⏳ Duree restante', value: `${left} min` },
        { label: '🎰 Roulette', value: `${winPct}% de victoire` },
        { label: '🎁 Loot', value: luck >= 50 ? 'objets rares boostes' : 'objets rares reduits' },
        { label: '🎉 Surprise', value: `${Math.round((0.05 + luck / 100 * 0.25) * 100)}% super-surprise` },
      ];

      const header = alreadyActive
        ? 'Buff de chance deja actif (utilise tes commandes avant qu\'il expire):'
        : 'Nouveau buff de chance active pour 30 minutes!';

      const msg = `${header}\n${bar}\n${MessageFormatter.elegantBox('🍀 𝔅𝔘𝔉𝔉 𝔆𝔋𝔄𝔑𝔆𝔈 🍀', items)}\n\n💡 Lance !loot, !roulette ou !surprise pendant que le buff est actif.`;

      await send({ text: msg });
    } catch (error) {
      await send({ text: '❌ Erreur!' });
    }
  },
};
