const config = require('../config');

class PermissionManager {
  static isAdmin(jid) {
    return config.ADMIN_JIDS.includes(jid);
  }

  static isGroupAdmin(groupJid, userJid, participants) {
    if (!participants) return false;

    const participant = participants.find(p => p.id === userJid);
    return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
  }

  static isGroupOwner(groupJid, userJid, participants) {
    if (!participants) return false;

    const participant = participants.find(p => p.id === userJid);
    return participant && participant.admin === 'superadmin';
  }

  static canUseCommand(jid, commandConfig, isGroup, groupJid, userJid, participants) {
    // Check if user is bot admin
    const isBotAdmin = this.isAdmin(jid || userJid);

    // If command requires admin
    if (commandConfig.adminOnly) {
      return isBotAdmin;
    }

    // If command requires group
    if (commandConfig.groupOnly) {
      return isGroup;
    }

    return true;
  }

  static hasPermission(jid, permission, isGroup, groupJid, userJid, participants) {
    // Bot admins have all permissions
    if (this.isAdmin(jid || userJid)) {
      return true;
    }

    if (!isGroup) {
      return false; // No group permissions in DM
    }

    switch (permission) {
      case 'moderator':
        return this.isGroupAdmin(groupJid, userJid, participants) || this.isGroupOwner(groupJid, userJid, participants);
      case 'owner':
        return this.isGroupOwner(groupJid, userJid, participants);
      default:
        return false;
    }
  }
}

module.exports = PermissionManager;
