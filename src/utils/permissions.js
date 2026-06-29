const config = require('../config');
const {
  cleanJid,
  findParticipant,
  jidDigits,
  jidMatches,
  participantJids,
  uniqueJids,
} = require('./jid');

class PermissionManager {
  static isAdmin(jid) {
    const candidates = uniqueJids(jid);
    if (candidates.length === 0) return false;

    const owners = [...(config.ADMIN_JIDS || [])];
    // Le proprietaire de l'instance (numero de deploiement / compte du bot) est
    // toujours reconnu comme admin/owner, pour ne jamais etre refuse sur
    // activatebot et les autres commandes adminOnly.
    if (config.PHONE_NUMBER) owners.push(config.PHONE_NUMBER);

    return owners.some((adminJid) => jidMatches(adminJid, candidates));
  }

  static isGroupAdmin(groupJid, userJid, participants) {
    if (!participants) return false;

    const participant = findParticipant(participants, userJid);
    return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
  }

  static isGroupOwner(groupJid, userJid, participants) {
    if (!participants) return false;

    const participant = findParticipant(participants, userJid);
    return participant && participant.admin === 'superadmin';
  }

  static canUseCommand(jid, commandConfig, isGroup, groupJid, userJid, participants) {
    // Check if user is bot admin
    const isBotAdmin = this.isAdmin(jid || userJid);
    
    // Check if user is group admin
    const isGroupAdmin = this.isGroupAdmin(groupJid, userJid, participants);
    const isGroupOwner = this.isGroupOwner(groupJid, userJid, participants);

    // If command requires admin - accept both bot admin and group admin
    if (commandConfig.adminOnly) {
      return isBotAdmin || isGroupAdmin || isGroupOwner;
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

PermissionManager.cleanJid = cleanJid;
PermissionManager.jidDigits = jidDigits;
PermissionManager.jidMatches = jidMatches;
PermissionManager.participantJids = participantJids;
PermissionManager.uniqueJids = uniqueJids;

module.exports = PermissionManager;
