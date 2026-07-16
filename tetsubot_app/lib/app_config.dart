/// Configuration de l'app.
///
/// Pour que l'app se connecte AUTOMATIQUEMENT (sans demander l'URL a chaque
/// utilisateur), renseigne l'URL publique de ton bot ci-dessous OU passe-la au
/// build:
///   flutter build apk --dart-define=BOT_API_URL=https://mon-bot.up.railway.app \
///                      --dart-define=BOT_API_TOKEN=xxxxx
///
/// Priorite: valeur saisie dans l'app > --dart-define > valeur par defaut ici.
class AppConfig {
  // <-- Mets ici l'URL publique de ton bot (Railway) pour la baker dans l'app.
  static const String _defaultBaseUrl ='https://whatsappbot-production-8366.up.railway.app';
  static const String _defaultToken = '';

  static const String apiBaseUrl =
      String.fromEnvironment('BOT_API_URL', defaultValue: _defaultBaseUrl);
  static const String apiToken =
      String.fromEnvironment('BOT_API_TOKEN', defaultValue: _defaultToken);
}
