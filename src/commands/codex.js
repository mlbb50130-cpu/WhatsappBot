const MessageFormatter = require('../utils/messageFormatter');
const { sendAiError, sendAiResponse } = require('../utils/sendAiResponse');
const { readTextAttachment } = require('../utils/aiTextAttachment');
const CodexService = require('../services/codexService');

module.exports = {
  name: 'codex',
  aliases: ['gpt', 'demande-codex'],
  description: 'Demande a Codex et analyse les documents texte/code joints',
  category: 'BOT',
  usage: '!codex <question> [document joint]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const jid = message.key.remoteJid;
    const askerJid = message.key.participant || jid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(jid, payload));
    const question = args.join(' ').trim();
    let attachment = null;

    try {
      attachment = await readTextAttachment(message);
    } catch (error) {
      await sendAiError({
        sock,
        jid,
        askerJid,
        provider: 'Codex',
        error,
      });
      return;
    }

    if (!question && !attachment) {
      await send({ text: MessageFormatter.warning('Utilise: !codex <question> ou joins un fichier texte/code.') });
      return;
    }

    const effectiveQuestion = question || 'Analyse et explique le fichier joint.';

    await send({
      text: MessageFormatter.info(
        attachment
          ? `Codex lit ${attachment.fileName} et prepare la reponse...`
          : 'Codex reflechit a ta question... cela peut prendre un moment. Je te ping des que c est pret.',
      ),
    });
    await sock.sendPresenceUpdate('composing', jid).catch(() => null);

    try {
      const result = await CodexService.ask(effectiveQuestion, { attachment });
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);

      await sendAiResponse({
        sock,
        jid,
        askerJid,
        provider: 'Codex',
        result,
      });
    } catch (error) {
      await sock.sendPresenceUpdate('paused', jid).catch(() => null);
      await sendAiError({
        sock,
        jid,
        askerJid,
        provider: 'Codex',
        error,
      });
    }
  },
};
