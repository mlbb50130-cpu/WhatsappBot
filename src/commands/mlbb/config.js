// Configuration MLBB - Personnalisable
// Ce fichier permet de configurer les paramètres du système MLBB

module.exports = {
  // ==================== COOLDOWNS (en ms) ====================
  cooldowns: {
    mlbb: 3000,      // !mlbb set/me
    hero: 3000,      // !hero <nom>
    build: 3000,     // !build <type>
    counter: 3000,   // !counter <héro>
    combo: 3000,     // !combo <héro>
    meta: 5000,      // !meta
    lane: 3000,      // !lane <role>
    tip: 3000,       // !tip
    team: 2000       // !team <subcommand>
  },

  // ==================== MESSAGES ====================
  messages: {
    groupOnly: '❌ Cette commande fonctionne uniquement en groupe!',
    noProfile: '❌ Tu n\'as pas encore de profil MLBB!\n\nEnregistre-toi avec: !mlbb set <rang> <role>',
    invalidRank: '❌ Rang invalide!',
    invalidRole: '❌ Rôle invalide!',
    profileUpdated: '✅ Profil mis à jour!',
    profileDeleted: '✅ Profil MLBB supprimé!',
    teamCreated: '✅ Équipe créée!',
    teamJoined: '✅ Tu as rejoint l\'équipe!',
    teamLeft: '✅ Tu as quitté l\'équipe!',
    teamDisbanded: '✅ Équipe dissoute!'
  },

  // ==================== ÉMOJIS ====================
  emojis: {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    fire: '🔥',
    game: '🎮',
    trophy: '🏆',
    user: '👤',
    rank: '🎖️',
    role: '🎯',
    team: '👥',
    tip: '💡',
    chart: '📊',
    book: '📖',
    clock: '⏰'
  },

  // ==================== LIMITES ====================
  limits: {
    maxTeamNameLength: 50,
    maxTeamMembers: 20,  // 0 = pas de limite
    minTeamMembers: 1    // Minimum pour une équipe
  },

  // ==================== PERMISSIONS ====================
  permissions: {
    allowTeamCreation: true,    // Les joueurs peuvent créer des équipes
    requireProfileForTeam: false, // Profil obligatoire pour équipe
    allowMultipleTeams: false,   // Un joueur = une équipe max
    captainCanDissband: true     // Capitaine peut dissoudre
  },

  // ==================== STOCKAGE ====================
  storage: {
    profilesFile: 'src/data/mlbb/profiles.json',
    teamsFile: 'src/data/mlbb/teams.json',
    createDirIfNotExists: true
  },

  // ==================== FORMAT DE RÉPONSE ====================
  format: {
    showEmojiOnSuccess: true,
    showEmojiOnError: true,
    useBlockQuotes: true,
    useMonospace: true,
    lineLength: 80  // Caractères par ligne (approx)
  },

  // ==================== STATISTIQUES ====================
  stats: {
    trackProfileViews: true,
    trackTeamCreations: true,
    trackComboCalls: true
  }
};
