const axios = require('axios');
const config = require('../config');
const MessageFormatter = require('../utils/messageFormatter');
const { getContextInfo, getInvokedCommand } = require('../utils/mediaMessages');

const REACTIONS = {
  bite: 'mord',
  blush: 'rougit devant',
  bonk: 'bonk',
  bully: 'embete',
  cringe: 'cringe devant',
  cry: 'pleure devant',
  cuddle: 'fait un calin a',
  dance: 'danse avec',
  glomp: 'saute sur',
  handhold: 'tient la main de',
  happy: 'est heureux avec',
  highfive: 'tape dans la main de',
  hug: 'fait un calin a',
  kick: 'donne un coup de pied a',
  kill: 'attaque',
  kiss: 'embrasse',
  lick: 'leche',
  nom: 'mange avec',
  pat: 'tapote',
  poke: 'poke',
  slap: 'gifle',
  smile: 'sourit a',
  smug: 'frime devant',
  wave: 'fait signe a',
  wink: 'fait un clin d oeil a',
  yeet: 'envoie voler',
};

function sender(message) {
  return message.key.participant || message.key.remoteJid;
}

function targetFromMessage(message) {
  const context = getContextInfo(message);
  const mentioned = Array.isArray(context.mentionedJid) ? context.mentionedJid : [];
  return mentioned[0] || context.participant || sender(message);
}

module.exports = {
  name: 'reaction',
  aliases: ['react', 'r', ...Object.keys(REACTIONS).filter((name) => name !== 'kick')],
  description: 'Reactions anime Atlas',
  category: 'FUN',
  usage: '!hug @user | !reaction hug @user',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args) {
    const jid = message.key.remoteJid;
    const command = getInvokedCommand(message, config.PREFIX);
    const reaction = REACTIONS[command] ? command : String(args[0] || '').toLowerCase();

    if (!REACTIONS[reaction]) {
      return sock.sendMessage(jid, {
        text: MessageFormatter.panel({
          title: 'Reactions',
          body: Object.keys(REACTIONS).map((name) => `${config.PREFIX}${name}`).slice(0, 26),
        }),
      }, { quoted: message });
    }

    try {
      const actor = sender(message);
      const target = targetFromMessage(message);
      const { data } = await axios.get(`https://api.waifu.pics/sfw/${reaction}`, { timeout: 15000 });
      if (!data?.url) throw new Error('API reaction indisponible');

      const actorTag = `@${actor.split('@')[0]}`;
      const targetTag = target === actor ? 'lui-meme' : `@${target.split('@')[0]}`;
      const caption = `*${actorTag} ${REACTIONS[reaction]} ${targetTag}*`;

      try {
        return await sock.sendMessage(jid, {
          video: { url: data.url },
          gifPlayback: true,
          caption,
          mentions: [actor, target],
        }, { quoted: message });
      } catch {
        return sock.sendMessage(jid, {
          image: { url: data.url },
          caption,
          mentions: [actor, target],
        }, { quoted: message });
      }
    } catch (error) {
      console.error('[REACTION] Error:', error.response?.data || error.message);
      return sock.sendMessage(jid, {
        text: MessageFormatter.error(`Reaction impossible: ${error.message}`),
      }, { quoted: message });
    }
  },
};
