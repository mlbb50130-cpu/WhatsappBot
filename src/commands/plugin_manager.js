const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config');
const MessageFormatter = require('../utils/messageFormatter');
const Access = require('../services/botAccessService');

const CUSTOM_DIR = path.join(__dirname, 'custom');

function commandName(message) {
  const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
  const trimmed = text.trim();
  const withoutPrefix = trimmed.startsWith(config.PREFIX)
    ? trimmed.slice(config.PREFIX.length)
    : trimmed.replace(/^!/, '');
  return withoutPrefix.split(/\s+/)[0].toLowerCase();
}

function safeName(urlValue) {
  const name = path.basename(new URL(urlValue).pathname) || `plugin-${Date.now()}.js`;
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, '').replace(/^\.+/, '') || `plugin-${Date.now()}.js`;
  return safe.endsWith('.js') ? safe : `${safe}.js`;
}

function listCustomPlugins() {
  if (!fs.existsSync(CUSTOM_DIR)) return [];
  return fs.readdirSync(CUSTOM_DIR).filter((file) => file.endsWith('.js')).sort();
}

module.exports = {
  name: 'plugins',
  aliases: ['pluginlist', 'install', 'uninstall'],
  description: 'Installer/lister des plugins CommonJS Kassim-bot',
  category: 'BOT',
  usage: '!plugins | !install <raw js url> | !uninstall <file>',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const actor = message.key.participant || jid;
    const command = commandName(message);

    if (command === 'pluginlist' || command === 'plugins') {
      const plugins = listCustomPlugins();
      return sock.sendMessage(jid, {
        text: MessageFormatter.panel({
          title: 'Plugins',
          body: plugins.length ? plugins : ['Aucun plugin custom installe.'],
          footer: `Seuls les plugins CommonJS ${config.BOT_NAME} sont charges ici.`,
        }),
      }, { quoted: message });
    }

    if (!(await Access.isModerator(actor))) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.error('Commande reservee au proprietaire ou aux moderateurs du bot.'),
      }, { quoted: message });
    }

    if (command === 'install') {
      const rawUrl = args.join(' ').trim();
      if (!rawUrl) {
        return sock.sendMessage(jid, { text: MessageFormatter.warning('Utilise: !install <raw js url>') }, { quoted: message });
      }

      const parsed = new URL(rawUrl);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error('URL invalide');
      let url = parsed.toString();
      if (parsed.hostname === 'gist.github.com') {
        parsed.hostname = 'gist.githubusercontent.com';
        url = `${parsed.toString().replace(/\/$/, '')}/raw`;
      }

      const response = await axios.get(url, {
        timeout: 20000,
        responseType: 'text',
        transformResponse: [(data) => data],
      });
      const body = response.data || '';
      if (!body.includes('module.exports')) {
        return sock.sendMessage(jid, {
          text: MessageFormatter.error('Plugin refuse: il doit etre CommonJS et contenir module.exports. Les plugins ESM Atlas doivent etre portes manuellement.'),
        }, { quoted: message });
      }

      await fs.promises.mkdir(CUSTOM_DIR, { recursive: true });
      const fileName = safeName(url);
      const filePath = path.join(CUSTOM_DIR, fileName);
      await fs.promises.writeFile(filePath, body, 'utf8');
      delete require.cache[require.resolve(filePath)];

      return sock.sendMessage(jid, {
        text: MessageFormatter.success(`Plugin installe: ${fileName}. Redemarre le bot si la commande ne charge pas tout de suite.`),
      }, { quoted: message });
    }

    if (command === 'uninstall') {
      const fileName = String(args[0] || '').replace(/[^a-zA-Z0-9._-]/g, '');
      if (!fileName) {
        return sock.sendMessage(jid, { text: MessageFormatter.warning('Utilise: !uninstall <file.js>') }, { quoted: message });
      }

      const filePath = path.join(CUSTOM_DIR, fileName);
      if (!filePath.startsWith(CUSTOM_DIR) || !fs.existsSync(filePath)) {
        return sock.sendMessage(jid, { text: MessageFormatter.warning('Plugin introuvable.') }, { quoted: message });
      }

      await fs.promises.unlink(filePath);
      return sock.sendMessage(jid, {
        text: MessageFormatter.success(`Plugin supprime: ${fileName}.`),
      }, { quoted: message });
    }
  },
};
