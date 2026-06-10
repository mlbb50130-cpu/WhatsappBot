const PackManager = require('./src/utils/PackManager');


// Accès aux commandes
const PACK_COMMANDS = {
  otaku: [
    'profil', 'level', 'xp', 'rank', 'stats', 'badges',
    'duel', 'powerlevel', 'chakra',
    'quete', 'quotidien', 'hebdo', 'quetelundi',
    'quiz', 'quizanime', 'pfc', 'roulette', 'reponse',
    'loot', 'inventaire', 'equip', 'equipement', 'collection',
    'waifu', 'husbando', 'neko', 'animegif', 'ship',
    'bleach', 'naruto', 'gojo', 'deku', 'madara', 'sukuna', 'vegito', 'miku', 'zerotwo',
    'gokuui', 'jinwoo', 'livai', 'makima', 'mikunakano', 'rengokudemon', 'tengen', 'tsunade', 'yami', 'yoruichi',
    'nino',
    'blagueotaku', 'roast', 'chance', 'sticker', 's', 'stick',
    'anime', 'manga', 'mangadex', 'personnage', 'voiranime',
    'topanime', 'topmanga', 'classement',
    'theme', 'activatebot', 'admins', 'deactivatebot', 'allowhentai', 'authhentai', 'hentaiallow',
    'ping', 'info', 'regles', 'help', 'documentation', 'menu', 'whoami'
  ],
  gamin: [
    'mlbb', 'ml', 'legends', 'moba', 'mlbb-profile', 'mlbbprofile',
    'hero', 'heroe', 'champion', 'personnage',
    'build', 'builds', 'items', 'set',
    'counter', 'counters', 'beat', 'antiheroe',
    'combo', 'combos', 'cc', 'rotation',
    'meta', 'metagame', 'tier', 'tierlist',
    'lane', 'lanes', 'guide', 'position', 'role',
    'tip', 'tips', 'conseil', 'conseils',
    'team', 'equipe', 'squad', 'crew',
    'join', 'j',
    'leave', 'l',
    'mlbbmenu', 'mlbbhelp', 'mlbbcommandes', 'mlbboptions',
    'heroes', 'heroslist', 'listheroe', 'herolist', 'heros',
    'selectpack', 'setmodule', 'pack', 'packselect', 'choosepack',
    'activatebot', 'admins', 'admin',
    'ping', 'info', 'regles', 'help', 'documentation', 'menu'
  ]
};

// Afficher pack OTAKU

const otakuGroups = {
  '📊 Profil & Niveau': ['profil', 'level', 'xp', 'rank', 'stats', 'badges'],
  '⚔️  Duels & Combats': ['duel', 'powerlevel', 'chakra'],
  '📜 Quêtes & RPG': ['quete', 'quotidien', 'hebdo', 'quetelundi'],
  '🎲 Quiz & Jeux': ['quiz', 'quizanime', 'pfc', 'roulette', 'reponse'],
  '💰 Loot & Inventaire': ['loot', 'inventaire', 'equip', 'equipement', 'collection'],
  '📸 Images Anime': ['waifu', 'husbando', 'neko', 'animegif', 'ship'],
  '🎭 Personnages Anime': ['bleach', 'naruto', 'gojo', 'deku', 'madara', 'sukuna', 'vegito', 'miku', 'zerotwo', 'gokuui', 'jinwoo', 'livai', 'makima', 'mikunakano', 'rengokudemon', 'tengen', 'tsunade', 'yami', 'yoruichi', 'nino'],
  '😂 Fun': ['blagueotaku', 'roast', 'chance', 'sticker', 's', 'stick'],
  '📺 Anime & Manga': ['anime', 'manga', 'mangadex', 'personnage', 'voiranime'],
  '🏆 Classements': ['topanime', 'topmanga', 'classement'],
  '⚙️  Admin & Système': ['theme', 'activatebot', 'admins', 'deactivatebot', 'allowhentai', 'authhentai', 'hentaiallow'],
  '🤖 Bot': ['ping', 'info', 'regles', 'help', 'documentation', 'menu', 'whoami']
};

Object.entries(otakuGroups).forEach(([group, cmds]) => {
});


const gaminGroups = {
  '👤 Profil MLBB': ['mlbb', 'ml', 'legends', 'moba', 'mlbb-profile', 'mlbbprofile'],
  '🦸 Héros & Infos': ['hero', 'heroe', 'champion', 'personnage'],
  '🛠️  Builds': ['build', 'builds', 'items', 'set'],
  '⚡ Counters': ['counter', 'counters', 'beat', 'antiheroe'],
  '💥 Combos': ['combo', 'combos', 'cc', 'rotation'],
  '🎯 Meta & Tier': ['meta', 'metagame', 'tier', 'tierlist'],
  '🗺️  Lanes & Guides': ['lane', 'lanes', 'guide', 'position', 'role'],
  '💡 Tips': ['tip', 'tips', 'conseil', 'conseils'],
  '👥 Équipes': ['team', 'equipe', 'squad', 'crew', 'join', 'j', 'leave', 'l'],
  '📋 Menus': ['mlbbmenu', 'mlbbhelp', 'mlbbcommandes', 'mlbboptions', 'heroes', 'heroslist', 'listheroe', 'herolist', 'heros'],
  '⚙️  Admin': ['selectpack', 'setmodule', 'pack', 'packselect', 'choosepack', 'activatebot', 'admins', 'admin'],
  '🤖 Bot': ['ping', 'info', 'regles', 'help', 'documentation', 'menu']
};

Object.entries(gaminGroups).forEach(([group, cmds]) => {
});
