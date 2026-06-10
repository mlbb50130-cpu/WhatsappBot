/**
 * Système de réactions automatiques aux commandes
 * Ajoute des réactions emoji correspondantes aux messages des utilisateurs
 */

const commandReactions = {
  // Quiz & Knowledge
  'quiz': '📝',
  'reponse': '✅',
  'quizanime': '📚',
  'tournoisquiz': '🏆',
  
  // Quests
  'quete': '📋',
  'quotidien': '🎁',
  'hebdo': '📅',
  'valider': '✔️',
  'nouvellequete': '✨',
  
  // Combat & Duels
  'duel': '⚔️',
  'chakra': '💫',
  'pfc': '✊',
  'roulette': '🎰',
  
  // Economy
  'work': '💼',
  'daily': '💰',
  'gold': '💵',
  'loot': '🎁',
  'surprise': '🎲',
  'anniversaire': '🎂',
  
  // Profil & Progression
  'profil': '👤',
  'level': '📈',
  'xp': '⭐',
  'rank': '🏅',
  'powerlevel': '⚡',
  'stats': '📊',
  'badges': '🏆',
  
  // Assets & Images
  'naruto': '🌀',
  'madara': '🔴',
  'gokuui': '⚡',
  'deku': '⚡',
  'gojo': '👁️',
  'sukuna': '👹',
  'jinwoo': '⚔️',
  'zerotwo': '🎌',
  'livai': '❄️',
  'tengen': '⚔️',
  'rengokudemon': '🔥',
  'tsunade': '🏥',
  'miku': '🎤',
  'mikunakano': '🎌',
  'nino': '🎌',
  'makima': '🔴',
  'yoruichi': '🌙',
  'boahancook': '🐍',
  'waifu': '🎌',
  'husbando': '🎌',
  'bleach': '⚪',
  'yami': '⚫',
  'neko': '😸',
  'vegito': '🔵',
  'animegif': '🎬',
  'anime': '🎌',
  'manga': '📖',
  'topanime': '🔝',
  'topmanga': '📚',
  'personnage': '👹',
  'voiranime': '📺',
  
  // Social & Fun
  'ship': '🎯',
  'roast': '🔥',
  'blagueotaku': '😂',
  
  // Équipement & Inventaire
  'inventaire': '🎒',
  'equipement': '⚙️',
  'equip': '👕',
  
  // Classements & Info
  'classement': '🏆',
  'help': '❓',
  'menu': '📋',
  'assets': '🏛️',
  'ping': '🏓',
  'info': 'ℹ️',
  'regles': '📜',
  'documentation': '📚',
  
  // Admin
  'activatebot': '✅',
  'deactivatebot': '❌',
  'allowhentai': '🔞',
  'nsfw': '🔞',
  'hentai': '🔞',
  'hentaivd': '🔞'
};

/**
 * Ajouter une réaction au message d'un utilisateur
 * @param {object} sock - Socket WhatsApp
 * @param {object} message - Message object
 * @param {string} commandName - Nom de la commande
 */
async function addReaction(sock, message, commandName) {
  try {
    const emoji = commandReactions[commandName.toLowerCase()];
    if (!emoji) return; // Pas de réaction définie

    const key = message.key;
    if (!key) return;

    await sock.sendMessage(message.key.remoteJid, {
      react: {
        text: emoji,
        key: key
      }
    });
  } catch (error) {
    // Silencieusement échouer - les réactions ne sont pas critiques
  }
}

module.exports = {
  addReaction,
  commandReactions
};
