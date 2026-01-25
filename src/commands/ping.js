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

    const content = `${status} *LATENCE*: \`${latency}ms\`
✅ *STATUS*: En ligne
📦 *VERSION*: 1.0.0
⏳ *UPTIME*: ${this.getUptime()}`;

    const text = MessageFormatter.box('🤖 BOT STATUS 🤖', content);

    await sock.sendMessage(senderJid, {
      text
    });
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
