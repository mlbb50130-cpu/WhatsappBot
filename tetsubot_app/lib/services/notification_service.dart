import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Notifications systeme (alerte quand le bot est deconnecte).
///
/// Supporte Android / iOS / macOS / Linux. Sur Web et Windows (non supportes
/// par le plugin), les appels sont ignores silencieusement; l'UI affiche alors
/// une banniere in-app a la place.
class NotificationService {
  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();
  static bool _ready = false;

  static bool get supported {
    if (kIsWeb) return false;
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
      case TargetPlatform.linux:
        return true;
      default:
        return false; // windows, fuchsia
    }
  }

  static Future<void> init() async {
    if (!supported) return;
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const darwin = DarwinInitializationSettings();
    const linux = LinuxInitializationSettings(defaultActionName: 'Ouvrir');

    await _plugin.initialize(const InitializationSettings(
      android: android,
      iOS: darwin,
      macOS: darwin,
      linux: linux,
    ));

    // Android 13+ : permission de notifications.
    await _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();

    _ready = true;
  }

  static Future<void> notifyBotDisconnected(String phone) async {
    if (!supported || !_ready) return;

    const android = AndroidNotificationDetails(
      'bot_status',
      'Etat du bot',
      channelDescription: 'Alertes de connexion de ton instance',
      importance: Importance.high,
      priority: Priority.high,
    );
    const details = NotificationDetails(
      android: android,
      iOS: DarwinNotificationDetails(),
      macOS: DarwinNotificationDetails(),
      linux: LinuxNotificationDetails(),
    );

    await _plugin.show(
      1,
      'KASSIM-BOT deconnecte',
      'Ton bot (+$phone) est hors ligne (ex: apres un redeploiement). Reconnecte-le si besoin.',
      details,
    );
  }
}
