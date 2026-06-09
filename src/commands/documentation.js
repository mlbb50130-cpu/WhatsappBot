const MessageFormatter = require('../utils/messageFormatter');

const PAGES = {
  1: {
    title: 'Documentation - Profil',
    subtitle: 'Page 1/5',
    sections: [
      {
        title: 'Profil et progression',
        items: [
          '`!profil` - Profil complet du joueur.',
          '`!level` - Niveau actuel et progression.',
          '`!xp` - XP total et XP restant.',
          '`!rank` - Rang et position.',
          '`!stats` - Statistiques détaillées.',
          '`!badges` - Badges débloqués.',
        ],
      },
      {
        title: 'À retenir',
        items: [
          'L’XP augmente avec l’activité, les quiz, les duels et certaines récompenses.',
          'Le niveau met à jour le rang et peut améliorer les ressources du joueur.',
        ],
      },
    ],
    next: 'Tape `!documentation 2` pour les combats, jeux et gold.',
  },
  2: {
    title: 'Documentation - Combats',
    subtitle: 'Page 2/5',
    sections: [
      {
        title: 'Duels et ressources',
        items: [
          '`!duel @user` - Lance un duel contre un joueur.',
          '`!duel @user 5` - Lance plusieurs duels.',
          '`!chakra` - Affiche le chakra disponible.',
          '`!powerlevel` - Affiche le niveau de puissance.',
        ],
      },
      {
        title: 'Jeux et économie',
        items: [
          '`!pfc pierre|feuille|ciseaux` - Pierre-Feuille-Ciseaux.',
          '`!roulette` - Jeu de hasard avec coût en gold.',
          '`!chance` - Chance du jour.',
          '`!work` - Gagne du gold avec un cooldown.',
          '`!daily` - Bonus quotidien.',
          '`!gold` - Solde actuel.',
        ],
      },
    ],
    next: 'Tape `!documentation 3` pour les quiz, quêtes et loots.',
  },
  3: {
    title: 'Documentation - Quêtes',
    subtitle: 'Page 3/5',
    sections: [
      {
        title: 'Quiz',
        items: [
          '`!quiz` - Question otaku aléatoire.',
          '`!quizanime` - Quiz anime.',
          '`!reponse A` - Répond à une question active.',
          'Les réponses directes `a`, `b`, `c`, `d` sont aussi acceptées quand un quiz est en cours.',
        ],
      },
      {
        title: 'Quêtes et récompenses',
        items: [
          '`!quete` - Liste des quêtes actives.',
          '`!nouvellequete` - Génère une nouvelle quête.',
          '`!valider` - Récupère les récompenses d’une quête terminée.',
          '`!loot` - Ouvre un coffre avec récompenses.',
          '`!quotidien` et `!hebdo` - Récompenses régulières.',
        ],
      },
    ],
    next: 'Tape `!documentation 4` pour les images, anime et manga.',
  },
  4: {
    title: 'Documentation - Anime',
    subtitle: 'Page 4/5',
    sections: [
      {
        title: 'Images et personnages',
        items: [
          '`!waifu`, `!husbando`, `!neko`, `!animegif` - Images et médias anime.',
          '`!naruto`, `!gojo`, `!madara`, `!sukuna`, `!miku`, `!zerotwo` et autres - Images par personnage.',
          '`!assets` - Liste des catégories disponibles.',
        ],
      },
      {
        title: 'Recherche anime/manga',
        items: [
          '`!anime <nom>` - Infos sur un anime.',
          '`!manga <nom>` - Infos sur un manga.',
          '`!personnage <nom>` - Infos personnage.',
          '`!topanime` et `!topmanga` - Classements.',
          '`!voiranime` - Indications pour regarder des animes.',
        ],
      },
    ],
    next: 'Tape `!documentation 5` pour l’administration et les règles.',
  },
  5: {
    title: 'Documentation - Admin',
    subtitle: 'Page 5/5',
    sections: [
      {
        title: 'Administration',
        items: [
          '`!activatebot` - Active le bot dans un groupe.',
          '`!desactivatebot` - Désactive le bot dans un groupe.',
          '`!selectpack` - Sélectionne le pack du groupe.',
          '`!setmodule` - Active ou désactive des modules.',
          '`!theme <nom>` - Change le thème visuel.',
          '`!warn`, `!kick`, `!mute`, `!lock`, `!clear` - Modération.',
        ],
      },
      {
        title: 'Sécurité et limites',
        items: [
          'Les commandes ont des cooldowns pour limiter le spam.',
          'Une utilisation trop rapide peut déclencher une restriction temporaire.',
          'Certaines commandes NSFW nécessitent une activation explicite.',
          'Utilise `!help <commande>` pour vérifier l’usage précis.',
        ],
      },
    ],
    next: 'Fin de la documentation. Retour au menu: `!menu`.',
  },
};

function buildDocumentationPage(page) {
  const content = [
    MessageFormatter.header(page.title, page.subtitle),
  ];

  page.sections.forEach((section) => {
    content.push('');
    content.push(MessageFormatter.elegantSection(section.title, section.items));
  });

  content.push('');
  content.push(`_${page.next}_`);

  return content.join('\n');
}

module.exports = {
  name: 'documentation',
  description: 'Documentation complète du bot',
  category: 'BOT',
  usage: '!documentation [page]',
  adminOnly: false,
  groupOnly: false,
  cooldown: 5,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;

    try {
      const pageNum = parseInt(args[0], 10) || 1;
      const page = PAGES[pageNum];
      const responseText = page
        ? buildDocumentationPage(page)
        : MessageFormatter.warning('Page introuvable. Utilise `!documentation 1` à `!documentation 5`.');

      if (reply) {
        await reply({ text: responseText });
      } else {
        await sock.sendMessage(senderJid, { text: responseText });
      }
    } catch (error) {
      console.error('Error in documentation command:', error.message);
      const text = MessageFormatter.error('Impossible d’afficher la documentation pour le moment.');

      if (reply) {
        await reply({ text });
      } else {
        await sock.sendMessage(senderJid, { text });
      }
    }
  },
};
