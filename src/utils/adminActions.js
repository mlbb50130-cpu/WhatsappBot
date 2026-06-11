/**
 * 🛡️ Admin Actions Utility for Baileys WhatsApp Bot
 * Handles all admin operations with proper error handling
 */

const config = require('../config');
const { getGroupMetadataWithCache, invalidateGroupCache } = require('./metadataCache');
const { findParticipant, jidMatches, uniqueJids } = require('./jid');

class AdminActionsManager {
  /**
   * Get bot JID correctly from sock.user.id
   */
  static getBotJid(sock) {
    try {
      let botJid = sock.user.id;
      // If it contains a colon, extract just the number part
      if (botJid.includes(':')) {
        botJid = botJid.split(':')[0] + '@s.whatsapp.net';
      }
      // Make sure it ends with @s.whatsapp.net
      if (!botJid.includes('@')) {
        botJid = botJid + '@s.whatsapp.net';
      }
      return botJid;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if bot is admin in the group
   */
  static async isBotAdmin(sock, groupJid) {
    try {
      const groupMetadata = await getGroupMetadataWithCache(sock, groupJid);
      if (!groupMetadata) {
        return false;
      }
      
      const botJid = uniqueJids(this.getBotJid(sock), sock?.user?.lid, sock?.user?.jid);
      
      if (botJid.length === 0) {
        return false;
      }
      
      const botParticipant = findParticipant(groupMetadata.participants, botJid);
      return botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
    } catch (error) {
      return false;
    }
  }

  /**
   * Kick user from group
   */
  static async kickUser(sock, groupJid, userJid, reason = 'Aucune raison spécifiée') {
    try {
      const isBotAdmin = await this.isBotAdmin(sock, groupJid);
      
      if (!isBotAdmin) {
        return {
          success: false,
          error: 'Le bot n\'est pas administrateur du groupe',
          code: 'BOT_NOT_ADMIN'
        };
      }

      // Check if target is the bot itself
      const botJid = this.getBotJid(sock);
      if (jidMatches(userJid, botJid)) {
        return {
          success: false,
          error: 'Le bot ne peut pas s\'expulser lui-même',
          code: 'CANNOT_KICK_SELF'
        };
      }

      await sock.groupParticipantsUpdate(groupJid, [userJid], 'remove');
      
      return {
        success: true,
        message: `✅ Utilisateur expulsé avec succès`,
        userJid,
        reason
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'KICK_ERROR'
      };
    }
  }

  /**
   * Promote user to admin
   */
  static async promoteUser(sock, groupJid, userJid) {
    try {
      const isBotAdmin = await this.isBotAdmin(sock, groupJid);
      
      if (!isBotAdmin) {
        return {
          success: false,
          error: 'Le bot n\'est pas administrateur du groupe',
          code: 'BOT_NOT_ADMIN'
        };
      }

      const botJid = this.getBotJid(sock);
      if (jidMatches(userJid, botJid)) {
        return {
          success: false,
          error: 'Le bot ne peut pas se promouvoir lui-même',
          code: 'CANNOT_PROMOTE_SELF'
        };
      }

      await sock.groupParticipantsUpdate(groupJid, [userJid], 'promote');
      
      return {
        success: true,
        message: '✅ Utilisateur promu administrateur',
        userJid
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'PROMOTE_ERROR'
      };
    }
  }

  /**
   * Demote user from admin
   */
  static async demoteUser(sock, groupJid, userJid) {
    try {
      const isBotAdmin = await this.isBotAdmin(sock, groupJid);
      
      if (!isBotAdmin) {
        return {
          success: false,
          error: 'Le bot n\'est pas administrateur du groupe',
          code: 'BOT_NOT_ADMIN'
        };
      }

      const botJid = this.getBotJid(sock);
      if (jidMatches(userJid, botJid)) {
        return {
          success: false,
          error: 'Le bot ne peut pas se rétrograder lui-même',
          code: 'CANNOT_DEMOTE_SELF'
        };
      }

      await sock.groupParticipantsUpdate(groupJid, [userJid], 'demote');
      
      return {
        success: true,
        message: '✅ Utilisateur rétrogradé',
        userJid
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'DEMOTE_ERROR'
      };
    }
  }

  /**
   * Change group subject (name)
   */
  static async changeGroupSubject(sock, groupJid, newSubject) {
    try {
      const isBotAdmin = await this.isBotAdmin(sock, groupJid);
      
      if (!isBotAdmin) {
        return {
          success: false,
          error: 'Le bot n\'est pas administrateur du groupe',
          code: 'BOT_NOT_ADMIN'
        };
      }

      if (newSubject.length > 25) {
        return {
          success: false,
          error: 'Le nom du groupe ne peut pas dépasser 25 caractères',
          code: 'SUBJECT_TOO_LONG'
        };
      }

      await sock.groupUpdateSubject(groupJid, newSubject);
      
      return {
        success: true,
        message: `✅ Nom du groupe changé en "${newSubject}"`,
        newSubject
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'SUBJECT_CHANGE_ERROR'
      };
    }
  }

  /**
   * Change group description
   */
  static async changeGroupDescription(sock, groupJid, newDescription) {
    try {
      const isBotAdmin = await this.isBotAdmin(sock, groupJid);
      
      if (!isBotAdmin) {
        return {
          success: false,
          error: 'Le bot n\'est pas administrateur du groupe',
          code: 'BOT_NOT_ADMIN'
        };
      }

      if (newDescription.length > 1024) {
        return {
          success: false,
          error: 'La description ne peut pas dépasser 1024 caractères',
          code: 'DESCRIPTION_TOO_LONG'
        };
      }

      await sock.groupUpdateDescription(groupJid, newDescription);
      
      return {
        success: true,
        message: '✅ Description du groupe mise à jour',
        newDescription
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'DESCRIPTION_CHANGE_ERROR'
      };
    }
  }

  /**
   * Change group settings (messaging policy)
   */
  static async changeGroupSettings(sock, groupJid, setting, value) {
    try {
      const isBotAdmin = await this.isBotAdmin(sock, groupJid);
      
      if (!isBotAdmin) {
        return {
          success: false,
          error: 'Le bot n\'est pas administrateur du groupe',
          code: 'BOT_NOT_ADMIN'
        };
      }

      const validSettings = ['announcement', 'not_announcement', 'locked', 'unlocked'];
      
      if (!validSettings.includes(setting)) {
        return {
          success: false,
          error: `Paramètre invalide. Options: ${validSettings.join(', ')}`,
          code: 'INVALID_SETTING'
        };
      }

      await sock.groupSettingUpdate(groupJid, setting);
      
      const settingName = {
        'announcement': '📢 Seuls les admins peuvent envoyer des messages',
        'not_announcement': '💬 Tous les membres peuvent envoyer des messages',
        'locked': '🔒 Le groupe est verrouillé',
        'unlocked': '🔓 Le groupe est déverrouillé'
      }[setting];

      return {
        success: true,
        message: `✅ Paramètre appliqué: ${settingName}`,
        setting,
        value
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'SETTINGS_CHANGE_ERROR'
      };
    }
  }

  /**
   * Mute group (only admins can send messages)
   */
  static async muteGroup(sock, groupJid, duration = null) {
    try {
      const result = await this.changeGroupSettings(sock, groupJid, 'announcement', true);
      
      if (result.success) {
        result.message = '🔇 Groupe rendu muet - Seuls les admins peuvent écrire';
        result.duration = duration;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'MUTE_ERROR'
      };
    }
  }

  /**
   * Unmute group (all members can send messages)
   */
  static async unmuteGroup(sock, groupJid) {
    try {
      const result = await this.changeGroupSettings(sock, groupJid, 'not_announcement', true);
      
      if (result.success) {
        result.message = '🔊 Groupe dérendu muet - Tous les membres peuvent écrire';
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'UNMUTE_ERROR'
      };
    }
  }

  /**
   * Lock group (only admins can change settings)
   */
  static async lockGroup(sock, groupJid) {
    try {
      const result = await this.changeGroupSettings(sock, groupJid, 'locked', true);
      
      if (result.success) {
        result.message = '🔐 Groupe verrouillé - Seuls les admins peuvent modifier les paramètres';
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'LOCK_ERROR'
      };
    }
  }

  /**
   * Unlock group (all members can change settings)
   */
  static async unlockGroup(sock, groupJid) {
    try {
      const result = await this.changeGroupSettings(sock, groupJid, 'unlocked', true);
      
      if (result.success) {
        result.message = '🔓 Groupe déverrouillé - Tous les membres peuvent modifier les paramètres';
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'UNLOCK_ERROR'
      };
    }
  }

  /**
   * Get group info
   */
  static async getGroupInfo(sock, groupJid) {
    try {
      const groupMetadata = await getGroupMetadataWithCache(sock, groupJid);
      if (!groupMetadata) {
        return {
          success: false,
          error: 'Could not fetch group metadata',
          code: 'METADATA_ERROR'
        };
      }
      
      return {
        success: true,
        data: {
          id: groupMetadata.id,
          subject: groupMetadata.subject,
          desc: groupMetadata.desc,
          participants: groupMetadata.participants.length,
          owner: groupMetadata.owner,
          creation: new Date(groupMetadata.creation * 1000),
          announce: groupMetadata.announce,
          restrict: groupMetadata.restrict,
          admins: groupMetadata.participants.filter(p => p.admin).length,
          members: groupMetadata.participants
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'GET_INFO_ERROR'
      };
    }
  }

  /**
   * Send group notification (warning message)
   */
  static async sendGroupNotification(sock, groupJid, notification) {
    try {
      await sock.sendMessage(groupJid, {
        text: notification
      });

      return {
        success: true,
        message: 'Notification envoyée'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'NOTIFICATION_ERROR'
      };
    }
  }

  /**
   * Check if user is admin
   */
  static async isUserAdmin(sock, groupJid, userJid) {
    try {
      const groupMetadata = await getGroupMetadataWithCache(sock, groupJid);
      if (!groupMetadata) {
        return {
          success: false,
          error: 'Could not fetch group metadata'
        };
      }
      
      const participant = findParticipant(groupMetadata.participants, userJid);
      
      return {
        success: true,
        isAdmin: participant && (participant.admin === 'admin' || participant.admin === 'superadmin'),
        participant
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'CHECK_ADMIN_ERROR',
        isAdmin: false
      };
    }
  }

  /**
   * Get all group admins
   */
  static async getGroupAdmins(sock, groupJid) {
    try {
      const groupMetadata = await getGroupMetadataWithCache(sock, groupJid);
      if (!groupMetadata) {
        return {
          success: false,
          error: 'Could not fetch group metadata',
          code: 'METADATA_ERROR'
        };
      }
      
      const admins = groupMetadata.participants.filter(p => p.admin);
      
      return {
        success: true,
        admins: admins.map(a => ({
          id: a.id,
          admin: a.admin,
          isSuperAdmin: a.admin === 'superadmin'
        })),
        count: admins.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'GET_ADMINS_ERROR'
      };
    }
  }
}

module.exports = AdminActionsManager;
