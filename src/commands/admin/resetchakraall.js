const User = require('../../models/User');
const MessageFormatter = require('../../utils/messageFormatter');

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
      // chakra (et maxChakra) = 100 + (niveau - 1) * 10, pour chaque joueur.
      const maxExpr = {
        $add: [100, { $multiply: [{ $subtract: [{ $ifNull: ['$level', 1] }, 1] }, 10] }],
      };

      const result = await User.updateMany({}, [
        {
          $set: {
            chakra: maxExpr,
            maxChakra: maxExpr,
            lastChakraReset: '$$NOW',
          },
        },
      ]);

      const count = result.modifiedCount ?? result.nModified ?? 0;
      await send({
        text: MessageFormatter.success(`🔵 Chakra reinitialise au maximum pour ${count} joueur(s).`),
      });
    } catch (error) {
      await send({ text: MessageFormatter.publicError('Reinitialisation du chakra impossible', error) });
    }
  },
};
