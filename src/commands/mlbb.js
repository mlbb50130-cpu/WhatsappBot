// ⚠️ DEPRECATED: Ce fichier est un alias pour la commande MLBB
// Les vraies commandes MLBB sont dans le dossier ./mlbb/
// Ce fichier charge simplement la commande depuis le dossier mlbb/

module.exports = require('./mlbb/index.js');
!mlbb set <rang> <role> - Enregistrer ton profil
!mlbb me - Voir ton profil
!hero <nom> - Infos d'un héros
!build <hero> - Builds recommandés
!counter <hero> - Les counters d'un héros
!meta - État du meta actuellement
!lane <role> - Infos sur un rôle
!team <nom> - Créer une équipe
!join <team> - Rejoindre une équipe
!leave <team> - Quitter une équipe`
        });
      }

      const subcommand = args[0].toLowerCase();

      switch (subcommand) {
        case 'set':
          return await handleSet(sock, jid, sender, args);
        case 'me':
          return await handleMe(sock, jid, sender);
        default:
          return sock.sendMessage(jid, {
            text: '❌ Sous-commande inconnue. Tape !mlbb pour voir les commandes'
          });
      }
    } catch (error) {
      console.error('Erreur mlbb:', error);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Erreur: ' + error.message });
    }
  }
};

async function handleSet(sock, jid, sender, args) {
  if (args.length < 3) {
    return sock.sendMessage(jid, {
      text: '❌ Utilise: !mlbb set <rang> <role>\nEx: !mlbb set Legend Jungler'
    });
  }

  const rank = args[1];
  const role = args.slice(2).join(' ');

  const profile = MLBBProfile.setProfile(sender, rank, role);

  return sock.sendMessage(jid, {
    text: `✅ Profil mis à jour!
    
🎮 *Rang:* ${profile.rank}
🔥 *Rôle:* ${profile.role}`
  });
}

async function handleMe(sock, jid, sender) {
  const profile = MLBBProfile.getProfile(sender);

  if (!profile) {
    return sock.sendMessage(jid, {
      text: '❌ Tu n\'as pas de profil MLBB. Tape !mlbb set <rang> <role>'
    });
  }

  let heroList = profile.heroes.length > 0 
    ? `🎯 Héros: ${profile.heroes.join(', ')}`
    : '🎯 Pas de héros enregistrés';

  return sock.sendMessage(jid, {
    text: `👤 *Ton Profil MLBB*

🎮 *Rang:* ${profile.rank}
🔥 *Rôle:* ${profile.role}
${heroList}`
  });
}
