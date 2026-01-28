/**
 * 👮 Permission Manager for Admin Actions
 * Gère les permissions et les restrictions pour les commandes admin
 */

const AdminActionsManager = require('./adminActions');
const adminConfig = require('../config/adminConfig');

class PermissionManagerV2 {
  /**
   * Vérifier si un utilisateur peut utiliser une commande admin
   */
  static async canUseAdminCommand(sock, groupJid, userJid, commandName, isBotAdmin = true) {
    try {
      // Vérifier que le bot est admin
      if (!isBotAdmin) {
        return {
          allowed: false,
          reason: 'BOT_NOT_ADMIN',
          message: adminConfig.MESSAGES.BOT_NOT_ADMIN
        };
      }

      // Vérifier que l'utilisateur est admin
      const userAdmin = await AdminActionsManager.isUserAdmin(sock, groupJid, userJid);
      
      if (!userAdmin.isAdmin) {
        return {
          allowed: false,
          reason: 'NOT_ADMIN',
          message: adminConfig.MESSAGES.NOT_ADMIN
        };
      }

      // Vérifications spécifiques par commande
      if (adminConfig.PERMISSIONS.OWNER_ONLY.includes(commandName)) {
        const groupInfo = await AdminActionsManager.getGroupInfo(sock, groupJid);
        
        if (groupInfo.success && groupInfo.data.owner !== userJid) {
          return {
            allowed: false,
            reason: 'NOT_OWNER',
            message: '🚫 Seul le propriétaire du groupe peut utiliser cette commande.'
          };
        }
      }

      return {
        allowed: true,
        reason: 'SUCCESS'
      };
    } catch (error) {
      console.error('Error checking permission:', error.message);
      return {
        allowed: false,
        reason: 'ERROR',
        message: '❌ Erreur lors de la vérification des permissions'
      };
    }
  }

  /**
   * Vérifier si un utilisateur peut être ciblé pour une action
   */
  static async canTargetUser(sock, groupJid, adminJid, targetJid) {
    try {
      // Ne pas pouvoir se cibler soi-même
      if (adminJid === targetJid) {
        return {
          allowed: false,
          reason: 'SELF_TARGET',
          message: adminConfig.MESSAGES.CANNOT_SELF_ACTION
        };
      }

      // Protéger le propriétaire
      if (adminConfig.SECURITY.PROTECT_OWNER) {
        const groupInfo = await AdminActionsManager.getGroupInfo(sock, groupJid);
        
        if (groupInfo.success && groupInfo.data.owner === targetJid) {
          return {
            allowed: false,
            reason: 'OWNER_PROTECTED',
            message: '🚫 Tu ne peux pas effectuer cette action sur le propriétaire du groupe!'
          };
        }
      }

      // Protéger les autres admins
      if (adminConfig.SECURITY.PROTECT_ADMINS) {
        const targetAdmin = await AdminActionsManager.isUserAdmin(sock, groupJid, targetJid);
        const adminAdmin = await AdminActionsManager.isUserAdmin(sock, groupJid, adminJid);
        
        if (targetAdmin.isAdmin && !adminAdmin.participant?.admin?.includes('superadmin')) {
          return {
            allowed: false,
            reason: 'ADMIN_PROTECTED',
            message: '🚫 Tu ne peux pas effectuer cette action sur un autre administrateur!'
          };
        }
      }

      return {
        allowed: true,
        reason: 'SUCCESS'
      };
    } catch (error) {
      console.error('Error checking target permission:', error.message);
      return {
        allowed: false,
        reason: 'ERROR',
        message: '❌ Erreur lors de la vérification'
      };
    }
  }

  /**
   * Vérifier toutes les permissions pour une action complète
   */
  static async checkFullPermissions(sock, groupJid, userJid, targetJid, commandName) {
    try {
      const isBotAdmin = await AdminActionsManager.isBotAdmin(sock, groupJid);

      // 1. Vérifier que le bot est admin
      if (!isBotAdmin) {
        return {
          allowed: false,
          check: 'BOT_ADMIN',
          message: adminConfig.MESSAGES.BOT_NOT_ADMIN
        };
      }

      // 2. Vérifier les permissions de l'utilisateur
      const userPermission = await this.canUseAdminCommand(sock, groupJid, userJid, commandName, isBotAdmin);
      if (!userPermission.allowed) {
        return userPermission;
      }

      // 3. Vérifier si la cible peut être ciblée
      if (targetJid) {
        const targetPermission = await this.canTargetUser(sock, groupJid, userJid, targetJid);
        if (!targetPermission.allowed) {
          return targetPermission;
        }
      }

      return {
        allowed: true,
        check: 'ALL_CLEAR'
      };
    } catch (error) {
      console.error('Error in full permission check:', error.message);
      return {
        allowed: false,
        check: 'ERROR',
        message: '❌ Erreur lors de la vérification des permissions'
      };
    }
  }

  /**
   * Obtenir les commandes disponibles pour un utilisateur
   */
  static async getAvailableCommands(sock, groupJid, userJid) {
    try {
      const isAdmin = await AdminActionsManager.isUserAdmin(sock, groupJid, userJid);
      const isBotAdmin = await AdminActionsManager.isBotAdmin(sock, groupJid);
      const groupInfo = await AdminActionsManager.getGroupInfo(sock, groupJid);

      const available = {
        general: ['help', 'ping', 'profil', 'info'],
        games: ['pfc', 'duel', 'quiz', 'roulette'],
      };

      if (isAdmin.isAdmin && isBotAdmin) {
        available.admin = adminConfig.PERMISSIONS.ADMIN_ONLY;
        
        if (groupInfo.success && groupInfo.data.owner === userJid) {
          available.owner = adminConfig.PERMISSIONS.OWNER_ONLY;
        }
      }

      return available;
    } catch (error) {
      console.error('Error getting available commands:', error.message);
      return {
        general: ['help', 'ping', 'profil', 'info'],
        games: ['pfc', 'duel', 'quiz', 'roulette']
      };
    }
  }

  /**
   * Log une action admin
   */
  static async logAdminAction(groupJid, adminJid, action, target = null, reason = null) {
    if (!adminConfig.LOGGING.LOG_ALL_ACTIONS) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      groupJid,
      adminJid,
      action,
      target: target || 'N/A',
      reason: reason || 'N/A'
    };


    // Vous pouvez aussi sauvegarder dans MongoDB si nécessaire
  }
}

module.exports = PermissionManagerV2;
