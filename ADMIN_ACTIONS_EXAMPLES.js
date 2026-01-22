/**
 * 💡 Examples - Admin Actions Usage
 * Exemples d'utilisation des actions admin
 */

// ============================================
// 1️⃣ EXEMPLE: Modération Simple
// ============================================

/**
 * Scénario: Un utilisateur spam le groupe
 * 
 * Admin: !warn @Jean Spam
 * Bot:   ⚠️ AVERTISSEMENT ENREGISTRÉ
 *        👤 @Jean
 *        📝 Raison: Spam
 *        📊 Avertissements: 1/3
 * 
 * [Un peu plus tard...]
 * 
 * Admin: !warn @Jean Spam répété
 * Bot:   ⚠️ AVERTISSEMENT ENREGISTRÉ
 *        👤 @Jean
 *        📊 Avertissements: 2/3
 * 
 * Admin: !warn @Jean Spam excessif
 * Bot:   ⛔ UTILISATEUR BANNI
 *        👤 @Jean
 *        🚫 Avertissements: 3/3
 *        [Utilisateur expulsé]
 */

// ============================================
// 2️⃣ EXEMPLE: Expulsion Immédiate
// ============================================

/**
 * Scénario: Un utilisateur envoie des contenus inappropriés
 * 
 * Admin: !kick @Marie Contenu inapproprié
 * Bot:   ✅ UTILISATEUR EXPULSÉ
 *        👤 @Marie
 *        📝 Raison: Contenu inapproprié
 *        👮 Modérateur: Admin
 */

// ============================================
// 3️⃣ EXEMPLE: Gestion des Admins
// ============================================

/**
 * Scénario: Promouvoir un modérateur et rétrograder un ancien
 * 
 * Admin: !promote @Jean
 * Bot:   ✅ PROMOTION EFFECTUÉE
 *        👤 @Jean
 *        👑 Est maintenant administrateur!
 * 
 * Admin: !demote @Marie
 * Bot:   ✅ RÉTROGRADATION EFFECTUÉE
 *        👤 @Marie
 *        😔 N'est plus administrateur!
 * 
 * Admin: !admins
 * Bot:   👑 ADMINISTRATEURS (3)
 *        1. 👑 [Propriétaire]
 *        2. 🔱 Jean
 *        3. 🔱 Paul
 */

// ============================================
// 4️⃣ EXEMPLE: Contrôle du Groupe
// ============================================

/**
 * Scénario: Annonce importante - Faire taire le groupe
 * 
 * Admin: !mute
 * Bot:   🔇 Groupe rendu muet - Seuls les admins peuvent écrire
 *        👤 Seuls les admins peuvent écrire
 *        👮 Modérateur: Admin
 * 
 * [Les admins font l'annonce...]
 * 
 * Admin: !unmute
 * Bot:   🔊 Groupe dérendu muet - Tous les membres peuvent écrire
 *        👥 Tous les membres peuvent écrire!
 *        👮 Modérateur: Admin
 */

// ============================================
// 5️⃣ EXEMPLE: Protection du Groupe
// ============================================

/**
 * Scénario: Verrouiller les paramètres du groupe
 * 
 * Admin: !lock
 * Bot:   🔐 Groupe verrouillé - Seuls les admins peuvent modifier les paramètres
 *        🔐 Les paramètres du groupe sont protégés!
 * 
 * [Les membres ne peuvent pas changer le nom/description...]
 * 
 * Admin: !unlock
 * Bot:   🔓 Groupe déverrouillé - Tous les membres peuvent modifier les paramètres
 *        🔓 Les paramètres du groupe sont accessibles!
 */

// ============================================
// 6️⃣ EXEMPLE: Consultation des Informations
// ============================================

/**
 * Scénario: Vérifier l'état du groupe
 * 
 * Admin: !groupinfo
 * Bot:   ╔═══════════════════════════════════╗
 *        ║    📊 INFORMATIONS DU GROUPE      ║
 *        ╚═══════════════════════════════════╝
 *
 *        👥 Nom: Anime Squad
 *
 *        📈 Statistiques:
 *          • Membres total: 42
 *          • Administrateurs: 3
 *          • Membres réguliers: 39
 *
 *        ⚙️ Paramètres:
 *          • Message: 💬 Tous peuvent écrire
 *          • Verrouillage: 🔓 Déverrouillé
 *
 *        📅 Créé le: 15/01/2026
 *
 *        👨‍💼 Propriétaire: 213456789@s.whatsapp.net
 *
 *        📝 Description:
 *        Groupe d'amis passionnés par l'anime!
 */

// ============================================
// 7️⃣ UTILISATION CÔTÉ CODE
// ============================================

// Exemple d'utilisation directe du AdminActionsManager

const AdminActionsManager = require('./src/utils/adminActions');

// Vérifier si le bot est admin
async function checkBotStatus(sock, groupJid) {
  const isBotAdmin = await AdminActionsManager.isBotAdmin(sock, groupJid);
  console.log('Bot is admin?', isBotAdmin);
}

// Kick un utilisateur
async function kickUserExample(sock, groupJid, userJid) {
  const result = await AdminActionsManager.kickUser(
    sock,
    groupJid,
    userJid,
    'Raison de l\'expulsion'
  );

  if (result.success) {
    console.log('User kicked successfully!');
  } else {
    console.log('Error:', result.error);
  }
}

// Promouvoir un utilisateur
async function promoteUserExample(sock, groupJid, userJid) {
  const result = await AdminActionsManager.promoteUser(sock, groupJid, userJid);

  if (result.success) {
    console.log('User promoted to admin!');
  } else {
    console.log('Error:', result.error);
  }
}

// Mute le groupe
async function muteGroupExample(sock, groupJid) {
  const result = await AdminActionsManager.muteGroup(sock, groupJid);

  if (result.success) {
    await sock.sendMessage(groupJid, {
      text: result.message
    });
  }
}

// Obtenir les informations du groupe
async function getGroupInfoExample(sock, groupJid) {
  const result = await AdminActionsManager.getGroupInfo(sock, groupJid);

  if (result.success) {
    console.log('Group Info:', result.data);
  } else {
    console.log('Error:', result.error);
  }
}

// Obtenir les admins du groupe
async function getGroupAdminsExample(sock, groupJid) {
  const result = await AdminActionsManager.getGroupAdmins(sock, groupJid);

  if (result.success) {
    console.log(`Total admins: ${result.count}`);
    result.admins.forEach(admin => {
      console.log(`- ${admin.id} (${admin.admin})`);
    });
  }
}

// ============================================
// 8️⃣ GESTION DES ERREURS
// ============================================

/**
 * Erreur 1: Bot n'est pas admin
 * ❌ Le bot n'est pas administrateur du groupe
 * Solution: Faites le bot admin dans les paramètres du groupe
 */

/**
 * Erreur 2: Utilisateur non trouvé
 * ❌ Utilisateur introuvable
 * Solution: Utilisez une @mention valide de l'utilisateur
 */

/**
 * Erreur 3: Permission refusée
 * ❌ Seuls les administrateurs peuvent utiliser cette commande
 * Solution: Vous devez être admin du groupe
 */

/**
 * Erreur 4: Impossible de cibler soi-même
 * ❌ Tu ne peux pas effectuer cette action sur toi-même!
 * Solution: Cibler un autre utilisateur
 */

// ============================================
// 9️⃣ WORKFLOW COMPLET DE MODÉRATION
// ============================================

/**
 * 1. Utilisateur enfreint la règle
 * 2. Admin lance: !warn @utilisateur [raison]
 * 3. Bot enregistre l'avertissement en BD
 * 4. Si 3 avertissements:
 *    - Bot marque comme banni en BD
 *    - Bot expulse du groupe
 * 5. Utilisateur ne peut plus rejoindre si bot le bloque
 */

// ============================================
// 🔟 BONNES PRATIQUES
// ============================================

/**
 * 1. Toujours vérifier que le bot est admin
 *    if (!await AdminActionsManager.isBotAdmin(sock, groupJid)) { ... }
 *
 * 2. Vérifier que l'utilisateur est admin avant certaines actions
 *    const isAdmin = await AdminActionsManager.isUserAdmin(sock, groupJid, userJid)
 *
 * 3. Ajouter des raisons aux actions pour l'audit
 *    await AdminActionsManager.kickUser(sock, groupJid, userJid, 'Raison claire')
 *
 * 4. Toujours envoyer une notification après l'action
 *    await sock.sendMessage(groupJid, { text: '✅ Action effectuée' })
 *
 * 5. Logger toutes les actions admin pour le debug
 *    console.log(`Admin action: ${action} on ${userJid}`)
 */

// ============================================
// Export pour documentation
// ============================================

module.exports = {
  examples: {
    checkBotStatus,
    kickUserExample,
    promoteUserExample,
    muteGroupExample,
    getGroupInfoExample,
    getGroupAdminsExample
  }
};
