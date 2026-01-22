/**
 * Configuration des Actions Admin
 * Customisez ici les messages et paramètres
 */

module.exports = {
  // ⚠️ Warnings Configuration
  WARNINGS: {
    MAX_WARNINGS: 3,
    AUTO_BAN_THRESHOLD: 3,
    RESET_AFTER_DAYS: 30, // Réinitialiser après 30 jours sans avertissement
  },

  // 🔇 Mute Configuration
  MUTE: {
    DEFAULT_DURATION: null, // null = infini, ou durée en ms
    NOTIF_ON_MUTE: true,
  },

  // 📛 Permissions
  PERMISSIONS: {
    // Actions qui nécessitent admin du groupe
    ADMIN_ONLY: ['kick', 'warn', 'promote', 'demote', 'mute', 'unmute', 'lock', 'unlock'],
    
    // Actions que seul le propriétaire peut faire
    OWNER_ONLY: ['demote', 'promote'],
    
    // Actions disponibles en DM
    DM_AVAILABLE: ['info', 'help', 'profil'],
  },

  // 📊 Messages Personnalisés
  MESSAGES: {
    BOT_NOT_ADMIN: '❌ Le bot n\'est pas administrateur du groupe.\n\nPromois-moi administrateur pour que je puisse effectuer des actions!',
    NOT_ADMIN: '🚫 Seuls les administrateurs peuvent utiliser cette commande.',
    CANNOT_SELF_ACTION: '❌ Tu ne peux pas effectuer cette action sur toi-même!',
    COMMAND_COOLDOWN: (remaining) => `⏱️ Attendez ${remaining}s avant d'utiliser cette commande à nouveau.`,
  },

  // 🎯 Logging
  LOGGING: {
    LOG_ALL_ACTIONS: true,
    LOG_WARNINGS: true,
    LOG_KICKS: true,
    LOG_BANS: true,
  },

  // 🔒 Sécurité
  SECURITY: {
    // Empêcher le bot de kick le propriétaire
    PROTECT_OWNER: true,
    // Empêcher le bot de kick un autre admin si pas super admin
    PROTECT_ADMINS: false,
    // Vérifier les permissions avant chaque action
    CHECK_PERMISSIONS: true,
  }
};
