/**
 * 📝 Guide d'utilisation de la fonction REPLY
 * 
 * La fonction reply permet au bot de répondre en citant le message de l'utilisateur
 * (reply/quote) automatiquement.
 * 
 * UTILISATION:
 * ===========
 * 
 * Exemple 1 - Répondre avec un texte simple:
 * -----------
 * await reply("✅ Commande exécutée!");
 * 
 * Exemple 2 - Répondre avec une image:
 * -----------
 * await reply({
 *   image: imageBuffer,
 *   caption: "Voici ton image!"
 * });
 * 
 * Exemple 3 - Répondre avec des options personnalisées:
 * -----------
 * await reply("Réponse personnalisée", {
 *   mentions: [mentionedJid]
 * });
 * 
 * EXEMPLE COMPLET DE COMMANDE:
 * ============================
 * 
 * module.exports = {
 *   name: 'test',
 *   description: 'Commande de test',
 *   usage: '!test',
 * 
 *   async execute(sock, message, args, user, isGroup, groupData, reply) {
 *     const senderJid = message.key.remoteJid;
 * 
 *     try {
 *       // Utiliser reply pour répondre en citant le message original
 *       await reply("Ceci est une réponse avec citation! ✅");
 * 
 *       // Répondre avec un texte formaté
 *       const responseText = "Voici ma réponse citée!";
 *       await reply(responseText);
 * 
 *       // Répondre avec une image
 *       const imageBuffer = fs.readFileSync('path/to/image.jpg');
 *       await reply({
 *         image: imageBuffer,
 *         caption: "Image avec citation!"
 *       });
 * 
 *     } catch (error) {
 *       console.error('Error:', error.message);
 *       await reply("❌ Une erreur s'est produite!");
 *     }
 *   }
 * };
 * 
 * AVANTAGES:
 * ==========
 * ✅ Le message du bot est automatiquement lié au message de l'utilisateur
 * ✅ Utilisation simple et intuitive
 * ✅ Support complet des options (mentions, etc.)
 * ✅ Gestion d'erreurs intégrée
 * 
 * PARAMETRES:
 * ===========
 * 1. content (string | object) - Le contenu à envoyer
 *    - string: texte simple
 *    - object: { image, caption } ou autre format de message
 * 
 * 2. options (object, optionnel) - Options additionnelles
 *    - mentions: tableau des JID à mentionner
 *    - etc.
 * 
 * NOTES:
 * ======
 * - La fonction retourne null en cas d'erreur
 * - Toutes les erreurs sont loggées automatiquement
 * - Le message est toujours cité (quoted) automatiquement
 * - Compatible avec tous les types de messages
 */

module.exports = {
  name: 'exampleReply',
  description: 'Exemple de commande utilisant reply',
  usage: '!examplereply',

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    try {
      // Exemple 1: Texte simple
      await reply("✅ Voici une réponse citée!");

      // Exemple 2: Texte avec emoji
      await reply("🎉 La fonction reply marche!");

      // Exemple 3: Texte formaté
      const formatted = `
╔════════════════════════════╗
║     Exemple de REPLY       ║
╚════════════════════════════╝

✅ Les messages du bot citent votre message!
✅ C'est très pratique pour les discussions!
✅ Utilisez reply() dans toutes vos commandes!
`;
      await reply(formatted);

    } catch (error) {
      console.error('Error in exampleReply:', error);
      await reply("❌ Une erreur s'est produite!");
    }
  }
};
