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
    const latency = Date.now() - startTime;
    const status = latency < 100 ? '🟢' : latency < 500 ? '🟡' : '🔴';

    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);

    const text = `${status} Ping: ${latency}ms | ⏳ Uptime: ${days}d ${hours}h`;
    await sock.sendMessage(senderJid, { text });
  }
};
