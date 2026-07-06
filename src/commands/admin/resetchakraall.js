const User = require('../../models/User');
const MessageFormatter = require('../../utils/messageFormatter');

function maxChakraFor(level) {
  return 100 + (Math.max(1, level || 1) - 1) * 10;
}

module.exports = {
  name: 'resetchakraall',
  aliases: ['chakrareset', 'resetchakra'],
  description: 'Reinitialise le chakra de TOUS les joueurs au maximum (ADMIN)',
  category: 'admin',
  usage: '!resetchakraall',
  adminOnly: true,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const send = async (payload) => (reply ? reply(payload) : sock.sendMessage(senderJid, payload));

    try {
      const now = new Date();
      // On lit juste _id + level, puis bulkWrite avec des $set classiques
      // (pas de pipeline d'agregation -> compatible toutes versions).
      const users = await User.find({}, '_id level').lean();
      let modified = 0;

      const BATCH = 500;
      for (let i = 0; i < users.length; i += BATCH) {
        const ops = users.slice(i, i + BATCH).map((u) => {
          const max = maxChakraFor(u.level);
          return {
            updateOne: {
              filter: { _id: u._id },
              update: { $set: { chakra: max, maxChakra: max, lastChakraReset: now } },
            },
          };
        });
        if (ops.length) {
          const res = await User.bulkWrite(ops, { ordered: false });
          modified += res.modifiedCount || 0;
        }
      }

      await send({
        text: MessageFormatter.success(`🔵 Chakra reinitialise au maximum pour ${modified} joueur(s).`),
      });
    } catch (error) {
      await send({ text: MessageFormatter.publicError('Reinitialisation du chakra impossible', error) });
    }
  },
};
