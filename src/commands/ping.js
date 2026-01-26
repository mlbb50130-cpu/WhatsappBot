const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'ping',
  description: 'Vérifier la latence du bot',
  category: 'BOT',
  usage: '!ping',
  adminOnly: false,
  groupOnly: false,
  cooldown: 1,

  async execute(sock, message, args, user, isGroup, groupData) {
    const senderJid = message.key.remoteJid;
    const startTime = Date.now();

    await sock.sendMessage(senderJid, {
      text: '⏱️ Calcul de la latence...'
    });

    const latency = Date.now() - startTime;
    const status = latency < 100 ? '🟢' : latency < 500 ? '🟡' : '🔴';

    const pingItems = [
      { label: `${status} Latence`, value: `${latency}ms` },
      { label: '✅ Status', value: 'En ligne' },
      { label: '📦 Version', value: '1.0.0' },
      { label: '⏳ Uptime', value: this.getUptime() }
    ];

    const text = MessageFormatter.elegantBox('🤖 BOT STATUS 🤖', pingItems);

    await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(text));
  },

  getUptime() {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return `${days}j ${hours}h ${minutes}m ${seconds}s`;
  }
};
