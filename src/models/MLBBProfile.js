const fs = require('fs');
const path = require('path');

class MLBBProfile {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/mlbb');
    this.profilesPath = path.join(this.dataDir, 'profiles.json');
    this.teamsPath = path.join(this.dataDir, 'teams.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Initialize files if they don't exist
    if (!fs.existsSync(this.profilesPath)) {
      fs.writeFileSync(this.profilesPath, JSON.stringify({}, null, 2));
    }
    if (!fs.existsSync(this.teamsPath)) {
      fs.writeFileSync(this.teamsPath, JSON.stringify({}, null, 2));
    }
  }

  // PROFIL JOUEUR
  async getProfile(jid) {
    try {
      const data = JSON.parse(fs.readFileSync(this.profilesPath, 'utf8'));
      return data[jid] || null;
    } catch (error) {
      console.error('Error reading profile:', error);
      return null;
    }
  }

  async setProfile(jid, username, rank, role) {
    try {
      const data = JSON.parse(fs.readFileSync(this.profilesPath, 'utf8'));
      data[jid] = {
        username,
        rank,
        role,
        createdAt: new Date(data[jid]?.createdAt || Date.now()),
        updatedAt: new Date(),
      };
      fs.writeFileSync(this.profilesPath, JSON.stringify(data, null, 2));
      return data[jid];
    } catch (error) {
      console.error('Error setting profile:', error);
      throw error;
    }
  }

  async deleteProfile(jid) {
    try {
      const data = JSON.parse(fs.readFileSync(this.profilesPath, 'utf8'));
      delete data[jid];
      fs.writeFileSync(this.profilesPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }

  // ÉQUIPES
  async createTeam(teamName, creatorJid, creatorName) {
    try {
      const data = JSON.parse(fs.readFileSync(this.teamsPath, 'utf8'));
      const teamId = `team_${Date.now()}`;
      
      data[teamId] = {
        id: teamId,
        name: teamName,
        creator: creatorJid,
        creatorName: creatorName,
        members: [{ jid: creatorJid, name: creatorName, role: 'Captain' }],
        createdAt: new Date(),
      };
      
      fs.writeFileSync(this.teamsPath, JSON.stringify(data, null, 2));
      return data[teamId];
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  async addToTeam(teamId, jid, name) {
    try {
      const data = JSON.parse(fs.readFileSync(this.teamsPath, 'utf8'));
      
      if (!data[teamId]) return null;
      
      const exists = data[teamId].members.some(m => m.jid === jid);
      if (exists) return null; // Already in team
      
      data[teamId].members.push({ jid, name, role: 'Member' });
      fs.writeFileSync(this.teamsPath, JSON.stringify(data, null, 2));
      
      return data[teamId];
    } catch (error) {
      console.error('Error adding to team:', error);
      throw error;
    }
  }

  async removeFromTeam(teamId, jid) {
    try {
      const data = JSON.parse(fs.readFileSync(this.teamsPath, 'utf8'));
      
      if (!data[teamId]) return null;
      
      data[teamId].members = data[teamId].members.filter(m => m.jid !== jid);
      fs.writeFileSync(this.teamsPath, JSON.stringify(data, null, 2));
      
      return data[teamId];
    } catch (error) {
      console.error('Error removing from team:', error);
      throw error;
    }
  }

  async getTeam(teamId) {
    try {
      const data = JSON.parse(fs.readFileSync(this.teamsPath, 'utf8'));
      return data[teamId] || null;
    } catch (error) {
      console.error('Error getting team:', error);
      return null;
    }
  }

  async getAllTeams() {
    try {
      const data = JSON.parse(fs.readFileSync(this.teamsPath, 'utf8'));
      return Object.values(data);
    } catch (error) {
      console.error('Error getting teams:', error);
      return [];
    }
  }

  async deleteTeam(teamId) {
    try {
      const data = JSON.parse(fs.readFileSync(this.teamsPath, 'utf8'));
      delete data[teamId];
      fs.writeFileSync(this.teamsPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error deleting team:', error);
      return false;
    }
  }
}

module.exports = new MLBBProfile();
