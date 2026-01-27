const RandomUtils = require('../utils/random');
const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'work',
  description: 'Travailler pour gagner du gold (réinitialisation: 1h)',
  category: 'GOLD',
  usage: '!work',
  adminOnly: false,
  groupOnly: true,
  cooldown: 3600, // 1h

  jobs: [
    { name: 'Cultivateur de Chakra', goldMin: 100, goldMax: 200, emoji: '🌾' },
    { name: 'Marchand d\'Épées', goldMin: 150, goldMax: 250, emoji: '🏪' },
    { name: 'Chasseur de Monstres', goldMin: 200, goldMax: 300, emoji: '⚔️' },
    { name: 'Apothicaire', goldMin: 120, goldMax: 220, emoji: '🧪' },
    { name: 'Mineur de Cristaux', goldMin: 180, goldMax: 280, emoji: '⛏️' },
    { name: 'Forgeron', goldMin: 160, goldMax: 260, emoji: '🔨' },
    { name: 'Alchimiste', goldMin: 140, goldMax: 240, emoji: '🧫' },
    { name: 'Escorte VIP', goldMin: 190, goldMax: 290, emoji: '🎩' }
  ],

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;

    // Select random job
    const job = this.jobs[Math.floor(Math.random() * this.jobs.length)];
    const goldEarned = RandomUtils.range(job.goldMin, job.goldMax);

    // Add gold
    user.gold = Math.max(0, (user.gold || 0) + goldEarned);
    await user.save();

    const content = MessageFormatter.elegantBox('💼 𝔗𝔯𝔞𝔳𝔞𝔦𝔩 💼', [
      { label: `${job.emoji} Métier`, value: job.name },
      { label: '💰 Gold Gagné', value: `+${goldEarned}` },
      { label: '👛 Gold Total', value: `${user.gold}` },
      { label: '⏰ Prochain Work', value: 'dans 1h' }
    ]);

    await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(content));
  }
};
