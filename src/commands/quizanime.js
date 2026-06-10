const MessageFormatter = require('../utils/messageFormatter');

module.exports = {
  name: 'quizanime',
  description: 'Quiz spécial anime',
  category: 'QUIZ',
  usage: '!quizanime',
  adminOnly: false,
  groupOnly: false,
  cooldown: 10,

  async execute(sock, message, args, user, isGroup, groupData, reply) {
    const senderJid = message.key.remoteJid;
    const participantJid = message.key.participant || senderJid;

    try {
      const quizzes = [
        // NARUTO (8)
        { question: 'Quel est le nom du protagoniste principal de Naruto?', options: ['Naruto Uzumaki', 'Sasuke Uchiha', 'Kakashi Hatake'], correct: 0 },
        { question: 'Qui est le maitre du Sharingan?', options: ['Itachi Uchiha', 'Obito Uchiha', 'Madara Uchiha'], correct: 2 },
        { question: 'Quel est le surnom de Kakashi?', options: ['L\'Éclair Blanc', 'Le Ninja Copie', 'La Foudre Noire'], correct: 1 },
        { question: 'Qui est l\'Hokage au début de Naruto?', options: ['Sarutobi Hiruzen', 'Minato Namikaze', 'Tobirama Senju'], correct: 0 },
        { question: 'Quel clan possède le Byakugan?', options: ['Clan Hyuga', 'Clan Uchiha', 'Clan Senju'], correct: 0 },
        { question: 'Quel est le rêve ultime de Naruto?', options: ['Devenir Hokage', 'Sauver Sasuke', 'Détruire Akatsuki'], correct: 0 },
        { question: 'Qui est Pain/Nagato?', options: ['Chef d\'Akatsuki', 'Frère de Naruto', 'Ennemi final'], correct: 0 },
        { question: 'Quel est le jinchuriki de Naruto?', options: ['Renard à 9 queues', 'Bijuu 8 queues', 'Kyubi'], correct: 0 },

        // ONE PIECE (10)
        { question: 'Quel est le rêve de Luffy?', options: ['Trouver All Blue', 'Devenir le Roi des Pirates', 'Explorer le monde'], correct: 1 },
        { question: 'Quel est le rêve de Nami?', options: ['Devenir pirate', 'Créer une carte du monde', 'Trouver One Piece'], correct: 1 },
        { question: 'Combien d\'équipiers Luffy a-t-il au début?', options: ['3', '4', '5'], correct: 0 },
        { question: 'Quel est le fruit du démon de Luffy?', options: ['Fruit Caoutchouc', 'Fruit Feu', 'Fruit Ciel'], correct: 0 },
        { question: 'Qui est le navigateur du Thousand Sunny?', options: ['Usopp', 'Nami', 'Robin'], correct: 1 },
        { question: 'Quel est le premier objectif de l\'équipage?', options: ['Trouver One Piece', 'Traverser Grand Line', 'Devenir puissant'], correct: 1 },
        { question: 'Qui est Zoro?', options: ['Cuisinier', 'Chasseur de primes', 'Archéologue'], correct: 1 },
        { question: 'Quel est le monde dans One Piece?', options: ['Seas', 'Blue Sea', 'Grand Line'], correct: 2 },
        { question: 'Quel est le titre d\'Usopp?', options: ['Roi des Pirates', 'Dieu des Snipers', 'Poète des Mers'], correct: 1 },
        { question: 'Qui est l\'empereur pirate?', options: ['Empereurs', 'Roi des Pirates', 'Yonko'], correct: 2 },
        { question: 'Quel est le bateau original?', options: ['Going Merry', 'Thousand Sunny', 'Caravel'], correct: 0 },

        // BLEACH (8)
        { question: 'Quel est le pouvoir de Ichigo?', options: ['Bankai', 'Hollowfication', 'Substitut Shinigami'], correct: 2 },
        { question: 'Qui est le Capitan de la 10ème division?', options: ['Kyoraku Shunsui', 'Toshiro Hitsugaya', 'Jushiro Ukitake'], correct: 1 },
        { question: 'Quel est le nom du monde des esprits?', options: ['Soul Society', 'Hueco Mundo', 'Karakura Town'], correct: 0 },
        { question: 'Quel est le pouvoir de Aizen?', options: ['Kyoka Suigetsu', 'Senbonzakura', 'Sougeki Tessenkou'], correct: 0 },
        { question: 'Combien de divisions existe-t-il?', options: ['10', '12', '13'], correct: 2 },
        { question: 'Qui est le capitaine de la 4ème division?', options: ['Shinobu', 'Isane Kotetsu', 'Retsu Unohana'], correct: 2 },
        { question: 'Quel est le vrai nom du Zanpakuto?', options: ['Épée de l\'âme', 'Lame manifestée', 'Épée shinigami'], correct: 0 },
        { question: 'Qui est Byakuya Kuchiki?', options: ['Capitaine', 'Vice-capitaine', 'Ashisogi Jizou'], correct: 0 },

        // DEMON SLAYER (7)
        { question: 'Quel est le pouvoir principal de Tanjiro?', options: ['Respiration du Vent', 'Respiration de l\'Eau', 'Respiration du Feu'], correct: 1 },
        { question: 'Quel est le but de Tanjiro?', options: ['Devenir Hashira', 'Trouver un remède pour Nezuko', 'Tuer Muzan'], correct: 1 },
        { question: 'Qui est le premier Hashira rencontré?', options: ['Giyu Tomioka', 'Shinobu Kocho', 'Kyojuro Rengoku'], correct: 0 },
        { question: 'Quel est le rang de Tanjiro au début?', options: ['Hashira', 'Kinoe', 'Tsuguko'], correct: 1 },
        { question: 'Qui est Muzan?', options: ['Seigneur des Démons', 'Démon Fort', 'Ennemi Principal'], correct: 0 },
        { question: 'Qui est la sœur de Tanjiro?', options: ['Yuki', 'Nezuko', 'Tamayo'], correct: 1 },
        { question: 'Qui est Giyu Tomioka?', options: ['Hashira Eau', 'Hashira Vent', 'Hashira Feu'], correct: 0 },

        // ATTACK ON TITAN (6)
        { question: 'En quelle année a commencé Attack on Titan?', options: ['2011', '2013', '2015'], correct: 1 },
        { question: 'Quel est le pouvoir d\'Eren?', options: ['Titan Colossal', 'Titan Assaillant', 'Titan Fondateur'], correct: 1 },
        { question: 'Qui est le commandant de la Légion?', options: ['Erwin Smith', 'Nile Dawk', 'Shadis'], correct: 0 },
        { question: 'Quel est le but de la Légion?', options: ['Sauver le monde', 'Détruire les Titans', 'Atteindre murs extérieurs'], correct: 2 },
        { question: 'Qui est Annie Leonhart?', options: ['Guerrier', 'Soldat', 'Explorateur'], correct: 0 },
        { question: 'Quel est le nom du mur externe?', options: ['Mur Wall', 'Mur Maria', 'Mur Rose'], correct: 1 },

        // JUJUTSU KAISEN (7)
        { question: 'Quel est le pouvoir de Yuji?', options: ['Domaine Expansif', 'Possédé par Sukuna', 'Énergie Maudite'], correct: 1 },
        { question: 'Qui est le sensei de Yuji?', options: ['Gojo Satoru', 'Nanami Kento', 'Maki Zenin'], correct: 0 },
        { question: 'Quel est le rang de Yuji?', options: ['Semi-Grade 1', 'Grade 4', 'Non Classé'], correct: 2 },
        { question: 'Qui est Sukuna?', options: ['Roi des Maudits', 'Démon Fort', 'Curse King'], correct: 0 },
        { question: 'Quel est le rôle de Gojo?', options: ['Directeur', 'Professeur', 'Jujutsu Sorcerer'], correct: 1 },
        { question: 'Qui est Megumi?', options: ['Ami de Yuji', 'Classmate', 'Jujutsu User'], correct: 0 },
        { question: 'Quel est le domaine de Gojo?', options: ['Infini', 'Temps Arrêté', 'Espace Vide'], correct: 0 },

        // DEATH NOTE (6)
        { question: 'Quel objet utilise Light?', options: ['Notebook', 'Cahier', 'Death Note'], correct: 2 },
        { question: 'Qui est le rival de Light?', options: ['L', 'Near', 'Mello'], correct: 0 },
        { question: 'Quel est le vrai nom de L?', options: ['Lawliet', 'Ryuzaki', 'Roger Ruvie'], correct: 0 },
        { question: 'Quel est le pouvoir du Death Note?', options: ['Tuer', 'Contrôler', 'Transformer'], correct: 0 },
        { question: 'Qui est Shinigami?', options: ['Dieu de la Mort', 'Fantôme', 'Esprit'], correct: 0 },
        { question: 'Quel est le nom du Shinigami?', options: ['Ryuk', 'Rem', 'Ren'], correct: 0 },

        // MY HERO ACADEMIA (8)
        { question: 'Quel est le pouvoir de Deku?', options: ['Force', 'Vole', 'One For All'], correct: 2 },
        { question: 'Quel est le nom de l\'école?', options: ['UA Academy', 'Yuei High', 'Hero Academy'], correct: 0 },
        { question: 'Qui est le meilleur ami de Deku?', options: ['Todoroki', 'Bakugo', 'Iida'], correct: 1 },
        { question: 'Quel est le pouvoir d\'All Might?', options: ['Super Force', 'All Might Power', 'Symbiote'], correct: 1 },
        { question: 'Qui est Todoroki?', options: ['Fire-Ice', 'Dual Power', 'Heterochromia'], correct: 0 },
        { question: 'Quel est le niveau de Deku?', options: ['Hero', 'Student', 'Weak'], correct: 1 },
        { question: 'Qui est Eraserhead?', options: ['Enseignant', 'Villain', 'Principal'], correct: 0 },
        { question: 'Quel est l\'objectif de Deku?', options: ['Devenir Héros', 'Sauver le monde', 'Vaincre Shigaraki'], correct: 0 },

        // SWORD ART ONLINE (5)
        { question: 'Quel est le jeu dans SAO?', options: ['Sword Art Online', 'Aincrad', 'Virtual Reality'], correct: 0 },
        { question: 'Quel est le pouvoir de Kirito?', options: ['Dual Wield', 'Black Sword', 'Speed Boost'], correct: 0 },
        { question: 'Qui est Asuna?', options: ['Fille principale', 'Compagne', 'Héroïne'], correct: 2 },
        { question: 'Quel est le niveau max?', options: ['100', '90', '150'], correct: 0 },
        { question: 'Qui est l\'antagoniste?', options: ['Kayaba Akihiko', 'Sugou Nobuyuki', 'Admin'], correct: 0 },

        // DRAGON BALL (7)
        { question: 'Qui est le personnage principal?', options: ['Vegeta', 'Goku', 'Gohan'], correct: 1 },
        { question: 'Quel est la transformation?', options: ['Ultra Instinct', 'Super Saiyan', 'Fusion'], correct: 1 },
        { question: 'Qui est Vegeta?', options: ['Prince Saiyan', 'Ennemi', 'Allié'], correct: 0 },
        { question: 'Quel est le but de Dragon Ball?', options: ['Trouver Boules', 'Combattre', 'Voyage'], correct: 0 },
        { question: 'Qui est Frieza?', options: ['Tyran', 'Villain', 'Ennemi Principal'], correct: 2 },
        { question: 'Quel est le niveau Super Saiyan 3?', options: ['Fort', 'Plus Fort', 'Très Fort'], correct: 1 },
        { question: 'Qui est le maître de Goku?', options: ['Maître Roshi', 'Kamisama', 'Enma'], correct: 0 },

        // HUNTER x HUNTER (6)
        { question: 'Quel est le but de Gon?', options: ['Trouver Père', 'Devenir Hunter', 'Aventure'], correct: 0 },
        { question: 'Qui est Killua?', options: ['Ami', 'Meilleur ami', 'Compagnon'], correct: 1 },
        { question: 'Quel est le pouvoir spécial?', options: ['Nen', 'Aura', 'Energy'], correct: 0 },
        { question: 'Qui est Leorio?', options: ['Docteur', 'Futur Docteur', 'Médecin'], correct: 1 },
        { question: 'Quel est le groupe?', options: ['Hunters', 'Phantom Troupe', 'Chimera Ants'], correct: 1 },
        { question: 'Qui est Hisoka?', options: ['Magicien', 'Cartes', 'Jester'], correct: 0 },

        // TOKYO GHOUL (5)
        { question: 'Qui est Kaneki?', options: ['Humain', 'Demi-Ghoul', 'Ghoul'], correct: 1 },
        { question: 'Quel est le but de Kaneki?', options: ['Survivre', 'Protéger Touka', 'Détruire CCG'], correct: 0 },
        { question: 'Qui est Touka?', options: ['Ghoul', 'Ami', 'Love Interest'], correct: 0 },
        { question: 'Quel est le groupe?', options: ['Anteiku', 'Aogiri', 'V'], correct: 0 },
        { question: 'Qui est Rize?', options: ['Fille Importante', 'Love Interest', 'Clé'], correct: 2 },

        // STEINS;GATE (4)
        { question: 'Quel est l\'objet utilisé?', options: ['Banane', 'Microonde', 'Machine à Remonter le Temps'], correct: 1 },
        { question: 'Qui est Okabe?', options: ['Scientifique Fou', 'Chercheur', 'Inventeur'], correct: 0 },
        { question: 'Qui est Kurisu?', options: ['Fille', 'Chercheuse', 'Amie'], correct: 1 },
        { question: 'Quel est le but?', options: ['Sauver Mayuri', 'Changer Passé', 'Voyage'], correct: 0 },

        // COWBOY BEBOP (4)
        { question: 'Quel est le vaisseau?', options: ['Bebop', 'Swordfish', 'Red Tail'], correct: 0 },
        { question: 'Qui est Spike?', options: ['Pilote', 'Chef', 'Cowboy'], correct: 2 },
        { question: 'Qui est Jet?', options: ['Co-pilote', 'Musique', 'Personnage'], correct: 0 },
        { question: 'Quel est le genre?', options: ['Sci-Fi', 'Western', 'Neo-Noir'], correct: 2 },

        // CODE GEASS (4)
        { question: 'Quel est le pouvoir?', options: ['Geass', 'Mind Control', 'Code'], correct: 0 },
        { question: 'Qui est Lelouch?', options: ['Protagoniste', 'Exilé', 'Prince'], correct: 2 },
        { question: 'Quel est le but?', options: ['Détruire Empire', 'Changer Monde', 'Vengeance'], correct: 1 },
        { question: 'Qui est CC?', options: ['Mystère', 'Fille', 'Compagne'], correct: 0 },

        // FULLMETAL ALCHEMIST (5)
        { question: 'Quel est le but des Elric?', options: ['Pierre Philosophale', 'Revenir Humains', 'Alchimie'], correct: 1 },
        { question: 'Qui est Alphonse?', options: ['Frère', 'Armure', 'Âme'], correct: 2 },
        { question: 'Qui est Roy?', options: ['Colonel', 'Militaire', 'Alchimiste'], correct: 0 },
        { question: 'Quel est le tabou?', options: ['Alchimie Humaine', 'Transmutation', 'Magie'], correct: 0 },
        { question: 'Qui est Mustang?', options: ['Flame Alchemist', 'Militaire', 'Officer'], correct: 0 },

        // NEON GENESIS EVANGELION (4)
        { question: 'Quel est le robot?', options: ['Eva', 'Gundam', 'Mecha'], correct: 0 },
        { question: 'Qui est Shinji?', options: ['Pilote', 'Enfant', 'Protagonist'], correct: 2 },
        { question: 'Quel est l\'ennemi?', options: ['Angels', 'Monsters', 'Aliens'], correct: 0 },
        { question: 'Qui est Misato?', options: ['Commandante', 'Militaire', 'Officer'], correct: 0 }
      ];

      const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];

      let quizMessage = MessageFormatter.elegantBox('📝 𝔔𝔘𝔌𝔝 𝔄𝔑𝔌𝔐𝔈 📝', [
        { label: '❓ Question', value: randomQuiz.question },
        { label: '🎯 Options', value: randomQuiz.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n') }
      ]);

      const quiz = quizMessage;

      // Store quiz in sessions (compatible with reponse command)
      if (!global.quizSessions) global.quizSessions = new Map();
      
      global.quizSessions.set(participantJid, {
        quiz: {
          options: randomQuiz.options,
          correct: randomQuiz.correct,
          reward: 15
        },
        answered: false,
        timestamp: Date.now()
      });

      if (reply) {
        await reply(MessageFormatter.createMessageWithImage(quiz));
      } else {
        await sock.sendMessage(senderJid, MessageFormatter.createMessageWithImage(quiz));
      }
    } catch (error) {
      if (reply) {
        await reply({ text: MessageFormatter.error('Erreur!') });
      } else {
        await sock.sendMessage(senderJid, { text: MessageFormatter.error('Erreur!') });
      }
    }
  }
};
