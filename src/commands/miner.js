const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');
const Luck = require('../utils/luck');

const MINE_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

module.exports = {
  name: 'miner',
  aliases: ['mine'],
  description: 'Miner des cristaux pour gagner du gold (toutes les 30 min)',
  category: 'GOLD',
  usage: '!miner',
  adminOnly: false,
  groupOnly: true,
  cooldown: 5,

  veins: [
    { name: 'Filon de Cuivre', emoji: '🪨', min: 120, max: 220 },
    { name: 'Veine de Fer', emoji: '⛏️', min: 150, max: 260 },
    { name: 'Cristaux de Chakra', emoji: '🔷', min: 180, max: 320 },
    { name: 'Gisement d\'Or', emoji: '🪙', min: 220, max: 400 },
  ],

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    const now = Date.now();
    const last = user.lastMine ? new Date(user.lastMine).getTime() : 0;
    const elapsed = now - last;
    if (last && elapsed < MINE_INTERVAL_MS) {
      const minLeft = Math.ceil((MINE_INTERVAL_MS - elapsed) / 60000);
      await send({ text: MessageFormatter.info(`⛏️ Ta pioche se recharge. Reviens dans ${minLeft} min.`) });
      return;
    }

    const vein = this.veins[Math.floor(Math.random() * this.veins.length)];
    let gold = RandomUtils.range(vein.min, vein.max);

    // Bonus si un buff de chance est actif
    const buffActive = Luck.isBuffActive(user);
    if (buffActive) gold = Math.round(gold * (1 + Luck.luckFactor(user) * 0.3));

    user.gold = (user.gold || 0) + gold;
    user.lastMine = new Date();
    await user.save();

    const content = MessageFormatter.elegantBox('⛏️ 𝔐𝔌𝔑𝔄𝔊𝔈 ⛏️', [
      { label: `${vein.emoji} Filon`, value: vein.name },
      { label: '💰 Gold', value: `+${gold}${buffActive ? ' (buff chance)' : ''}` },
      { label: '👛 Solde', value: `${user.gold} gold` },
      { label: '⏰ Prochain', value: 'dans 30 min' },
    ]);

    await send(MessageFormatter.createMessageWithImage(content));
  },
};
