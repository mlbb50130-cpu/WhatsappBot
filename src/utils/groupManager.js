// 👥 Gestionnaire des Groupes WhatsApp
const Group = require('../models/Group');

class GroupManager {
  /**
   * Crée ou récupère les paramètres d'un groupe
   */
  static async getOrCreateGroup(groupJid, groupName, groupOwner) {
    try {
      let group = await Group.findOne({ groupJid });

      if (!group) {
        group = new Group({
          groupJid,
          groupName,
          groupOwner,
          features: {
            xpSystem: true,
            levelSystem: true,
            quizSystem: true,
            duelSystem: true,
            lootSystem: true,
            leaderboard: true,
            antiSpam: true,
            antiLink: false,
            autoWelcome: true
          }
        });
        await group.save();
        console.log(`✅ Groupe créé: ${groupName}`);
      }

      return group;
    } catch (error) {
      console.error(`❌ Erreur getOrCreateGroup: ${error.message}`);
      return null;
    }
  }

  /**
   * Vérifie si une feature est activée dans le groupe
   */
  static async isFeatureEnabled(groupJid, featureName) {
    try {
      const group = await Group.findOne({ groupJid });
      if (!group) return true; // Default: enabled

      return group.features[featureName] ?? true;
    } catch (error) {
      console.error(`❌ Erreur isFeatureEnabled: ${error.message}`);
      return true;
    }
  }

  /**
   * Bascule une feature
   */
  static async toggleFeature(groupJid, featureName) {
    try {
      const group = await Group.findOne({ groupJid });
      if (!group) return false;

      group.features[featureName] = !group.features[featureName];
      await group.save();

      const state = group.features[featureName] ? 'activée' : 'désactivée';
      return { success: true, message: `Feature ${state}` };
    } catch (error) {
      console.error(`❌ Erreur toggleFeature: ${error.message}`);
      return { success: false, message: 'Erreur' };
    }
  }

  /**
   * Ajoute un modérateur
   */
  static async addModerator(groupJid, userJid) {
    try {
      const group = await Group.findOne({ groupJid });
      if (!group) return false;

      if (!group.moderators.includes(userJid)) {
        group.moderators.push(userJid);
        await group.save();
      }

      return true;
    } catch (error) {
      console.error(`❌ Erreur addModerator: ${error.message}`);
      return false;
    }
  }

  /**
   * Supprime un modérateur
   */
  static async removeModerator(groupJid, userJid) {
    try {
      const group = await Group.findOne({ groupJid });
      if (!group) return false;

      group.moderators = group.moderators.filter(mod => mod !== userJid);
      await group.save();

      return true;
    } catch (error) {
      console.error(`❌ Erreur removeModerator: ${error.message}`);
      return false;
    }
  }

  /**
   * Bannit un membre
   */
  static async banMember(groupJid, userJid, reason, duration = null) {
    try {
      const group = await Group.findOne({ groupJid });
      if (!group) return false;

      const bannedUntil = duration ? new Date(Date.now() + duration) : null;

      group.bannedMembers.push({
        jid: userJid,
        reason,
        bannedAt: new Date(),
        bannedUntil
      });

      await group.save();
      return true;
    } catch (error) {
      console.error(`❌ Erreur banMember: ${error.message}`);
      return false;
    }
  }

  /**
   * Débannit un membre
   */
  static async unbanMember(groupJid, userJid) {
    try {
      const group = await Group.findOne({ groupJid });
      if (!group) return false;

      group.bannedMembers = group.bannedMembers.filter(ban => ban.jid !== userJid);
      await group.save();

      return true;
    } catch (error) {
      console.error(`❌ Erreur unbanMember: ${error.message}`);
      return false;
    }
  }

  /**
   * Vérifie si un utilisateur est banni
   */
  static async isBanned(groupJid, userJid) {
    try {
      const group = await Group.findOne({ groupJid });
      if (!group) return false;

      const ban = group.bannedMembers.find(b => b.jid === userJid);
      if (!ban) return false;

      // Vérifier si le ban a expiré
      if (ban.bannedUntil && new Date() > ban.bannedUntil) {
        await this.unbanMember(groupJid, userJid);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`❌ Erreur isBanned: ${error.message}`);
      return false;
    }
  }

  /**
   * Enregistre une commande utilisée
   */
  static async logCommand(groupJid) {
    try {
      await Group.updateOne(
        { groupJid },
        { $inc: { 'stats.totalCommands': 1 } }
      );
    } catch (error) {
      console.error(`❌ Erreur logCommand: ${error.message}`);
    }
  }

  /**
   * Met à jour les stats du groupe
   */
  static async updateStats(groupJid, totalUsers = null, totalMessages = null) {
    try {
      const update = {};

      if (totalMessages !== null) {
        update['stats.totalMessages'] = totalMessages;
      }

      if (totalUsers !== null) {
        update['stats.totalUsers'] = totalUsers;
      }

      await Group.updateOne(
        { groupJid },
        { $set: update }
      );
    } catch (error) {
      console.error(`❌ Erreur updateStats: ${error.message}`);
    }
  }

  /**
   * Obtient la configuration complète du groupe
   */
  static async getSettings(groupJid) {
    try {
      const group = await Group.findOne({ groupJid });
      if (!group) return null;

      return {
        features: group.features,
        settings: group.settings,
        permissions: group.permissions,
        moderators: group.moderators,
        stats: group.stats
      };
    } catch (error) {
      console.error(`❌ Erreur getSettings: ${error.message}`);
      return null;
    }
  }

  /**
   * Change le prefix du groupe
   */
  static async setPrefix(groupJid, newPrefix) {
    try {
      await Group.updateOne(
        { groupJid },
        { $set: { prefix: newPrefix } }
      );
      return true;
    } catch (error) {
      console.error(`❌ Erreur setPrefix: ${error.message}`);
      return false;
    }
  }

  /**
   * Obtient le prefix du groupe
   */
  static async getPrefix(groupJid) {
    try {
      const group = await Group.findOne({ groupJid }, { prefix: 1 });
      return group?.prefix || '!';
    } catch (error) {
      console.error(`❌ Erreur getPrefix: ${error.message}`);
      return '!';
    }
  }

  /**
   * Récupère tous les groupes
   */
  static async getAllGroups() {
    try {
      return await Group.find();
    } catch (error) {
      console.error(`❌ Erreur getAllGroups: ${error.message}`);
      return [];
    }
  }

  /**
   * Compte les groupes actifs
   */
  static async countGroups() {
    try {
      return await Group.countDocuments();
    } catch (error) {
      console.error(`❌ Erreur countGroups: ${error.message}`);
      return 0;
    }
  }
}

module.exports = GroupManager;
