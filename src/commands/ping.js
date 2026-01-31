const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'ping',
  description: 'Vérifier la latence du bot',
  category: 'BOT',
  usage: '!ping',
  adminOnly: false,
  groupOnly: false,
  cooldown: 1,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const startTime = Date.now();

    const latency = Date.now() - startTime;
    const status = latency < 100 ? '🟢' : latency < 500 ? '🟡' : '🔴';

    const pingItems = [
      { label: `${status} Latence`, value: `${latency}ms` },
      { label: 'Status', value: 'En ligne' },
      { label: 'Uptime', value: this.getUptime() }
    ];

    const text = MessageFormatter.elegantBox('𝔅𝔒𝔗 𝔖𝔗𝔄𝔗𝔘𝔖', pingItems);
    if (reply) {
        await reply(MessageFormatter.createMessageWithImage(text));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(text));
      }
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
