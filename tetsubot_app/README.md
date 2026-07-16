# KASSIM-BOT — Application de liaison

Application Flutter (Android / Web / Windows) qui permet a un utilisateur de
**lier son propre WhatsApp au bot** pour obtenir **sa propre instance**
(devenir proprietaire de son bot), dans une **section separee**, **sans ecraser
les sessions existantes** (multi-instance / multi-tenant).

## Concept

- Chaque proprietaire lie son numero via le **pairing code WhatsApp**.
- Le backend cree alors une **session isolee** pour ce numero (a faire quand on
  connectera l'app au bot) ; les autres sessions ne sont pas touchees.
- L'app sert a lier, suivre l'etat de son instance et la delier.

## Etat actuel (app seule, pas encore reliee au bot)

- ✅ Flux de **liaison complet** : numero -> pairing code (8 caracteres) ->
  instructions WhatsApp -> confirmation -> instance "liee".
  - Le code est genere **localement (mode demo)**.
- ✅ Tableau de bord : **Mon Bot** (etat connecte, numero, delier),
  **Statistiques** (groupes, commandes, uptime), **Reglages** (prefixe, modules).
- ⏳ A venir : brancher l'app au bot (API multi-instance) + sessions WhatsApp
  multiples cote backend.

## Lancer l'app

Pre-requis : Flutter SDK (`D:\flutter`) + Android Studio.

```bash
flutter pub get
flutter run -d chrome    # apercu web (aucune install supplementaire)
flutter run -d windows   # bureau Windows (necessite Visual Studio + outils C++)
flutter run              # appareil Android / emulateur
```

## Structure

```
lib/
  main.dart                   Point d'entree (KassimBotApp)
  theme/app_theme.dart        Theme sombre
  services/
    bot_service.dart          Liaison: generatePairingCode / confirmLinked / unlink
    api_service.dart          Stub backend (requestPairingCode / fetchInstance)
  models/bot_instance.dart    Etat d'une instance (+ donnees demo)
  screens/
    splash_screen.dart        Routeur reactif (lie ? -> Home : Liaison)
    link/phone_screen.dart    Etape 1 : numero
    link/pairing_screen.dart  Etape 2 : pairing code + instructions WhatsApp
    home/...                  Mon Bot / Statistiques / Reglages
  widgets/                    Bouton, carte de stat
```

## Brancher au bot (plus tard)

1. Cote bot : rendre la connexion **multi-session** (un dossier d'auth par
   numero, ex. `whatsapp_auth/<numero>`), sans toucher a la session actuelle.
2. Exposer une API :
   - `POST /api/instances` { phone } -> cree la session et renvoie le pairing code.
   - `GET /api/instances/:phone` -> etat de l'instance (connecte, groupes, uptime).
   - `DELETE /api/instances/:phone` -> delie l'instance.
3. Renseigner `ApiService.baseUrl` (URL Railway) et remplacer les `TODO(bot)`
   dans `bot_service.dart` / `api_service.dart` par de vrais appels http.
