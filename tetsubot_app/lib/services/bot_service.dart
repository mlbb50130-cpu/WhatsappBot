import 'dart:async';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../app_config.dart';
import '../models/bot_instance.dart';
import 'api_service.dart';
import 'notification_service.dart';

enum LinkStatus { unknown, notLinked, linked }

/// Gere la LIAISON du WhatsApp de l'utilisateur au bot, et SURVEILLE l'etat de
/// son instance (notification si elle se deconnecte, ex: apres un redeploiement).
///
/// Si l'URL du serveur (baseUrl) est configuree, les operations utilisent l'API
/// reelle du bot (pairing code WhatsApp, etat reel). Sinon: mode demo local.
class BotService extends ChangeNotifier {
  static const String _kPhone = 'bot_phone';
  static const String _kLinked = 'bot_linked';
  static const String _kPrefix = 'bot_prefix';
  static const String _kBaseUrl = 'bot_base_url';
  static const String _kToken = 'bot_api_token';
  static const Duration _pollEvery = Duration(seconds: 30);

  LinkStatus status = LinkStatus.unknown;
  String? phone;
  String? pendingPhone;
  String? pairingCode;
  String prefix = '!';
  bool busy = false;
  bool? instanceConnected;

  // Valeurs par defaut (bakees): voir lib/app_config.dart.
  String baseUrl = '';
  String apiToken = '';

  Timer? _monitor;

  bool get connectedToBackend => baseUrl.trim().isNotEmpty;

  Future<void> init() async {
    final p = await SharedPreferences.getInstance();
    phone = p.getString(_kPhone);
    prefix = p.getString(_kPrefix) ?? '!';
    // L'override stocke (config manuelle) a la priorite, sinon valeur bakee (AppConfig).
    final storedUrl = p.getString(_kBaseUrl) ?? '';
    baseUrl = storedUrl.isNotEmpty ? storedUrl : AppConfig.apiBaseUrl;
    final storedToken = p.getString(_kToken) ?? '';
    apiToken = storedToken.isNotEmpty ? storedToken : AppConfig.apiToken;
    final linked = p.getBool(_kLinked) ?? false;
    status = (linked && phone != null) ? LinkStatus.linked : LinkStatus.notLinked;
    notifyListeners();
    if (status == LinkStatus.linked) startMonitor();
  }

  static String normalize(String s) => s.replaceAll(RegExp(r'[^0-9]'), '');

  Future<void> setServer(String url, String token) async {
    baseUrl = url.trim();
    apiToken = token.trim();
    final p = await SharedPreferences.getInstance();
    await p.setString(_kBaseUrl, baseUrl);
    await p.setString(_kToken, apiToken);
    notifyListeners();
  }

  /// Demande un code de liaison (pairing code WhatsApp) pour ce numero.
  Future<String?> generatePairingCode(String raw) async {
    busy = true;
    notifyListeners();
    pendingPhone = normalize(raw);
    String? error;
    try {
      if (connectedToBackend) {
        final state = await ApiService.createInstance(baseUrl, apiToken, pendingPhone!, prefix);
        pairingCode = state['pairingCode'] as String?;
        if (state['connected'] == true) {
          // Deja connecte: on peut confirmer directement.
          pairingCode = pairingCode ?? '';
        }
      } else {
        await Future.delayed(const Duration(milliseconds: 600));
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        final r = Random();
        pairingCode = List.generate(8, (_) => chars[r.nextInt(chars.length)]).join();
      }
    } catch (e) {
      error = e.toString();
    }
    busy = false;
    notifyListeners();
    return error;
  }

  String get prettyCode {
    final c = pairingCode ?? '';
    return c.length == 8 ? '${c.substring(0, 4)}-${c.substring(4)}' : c;
  }

  Future<void> setPrefix(String value) async {
    final cleaned = value.replaceAll(RegExp(r'\s'), '');
    final next = cleaned.isEmpty ? '!' : cleaned.substring(0, cleaned.length > 3 ? 3 : cleaned.length);
    prefix = next;
    final p = await SharedPreferences.getInstance();
    await p.setString(_kPrefix, next);
    if (connectedToBackend && phone != null) {
      try { await ApiService.setPrefix(baseUrl, apiToken, phone!, next); } catch (_) {}
    }
    notifyListeners();
  }

  /// Confirme la liaison. En mode backend, verifie que l'instance est connectee.
  /// Retourne true si la liaison est validee.
  Future<bool> confirmLinked() async {
    busy = true;
    notifyListeners();
    bool ok = true;
    try {
      if (connectedToBackend) {
        final raw = await ApiService.getInstanceRaw(baseUrl, apiToken, pendingPhone ?? '');
        ok = raw != null && raw['connected'] == true;
      } else {
        await Future.delayed(const Duration(milliseconds: 500));
      }
    } catch (_) {
      ok = false;
    }

    if (ok) {
      phone = pendingPhone;
      final p = await SharedPreferences.getInstance();
      await p.setString(_kPhone, phone ?? '');
      await p.setBool(_kLinked, true);
      status = LinkStatus.linked;
      pendingPhone = null;
      pairingCode = null;
      instanceConnected = true;
    }

    busy = false;
    notifyListeners();
    if (ok) startMonitor();
    return ok;
  }

  Future<void> unlink() async {
    stopMonitor();
    if (connectedToBackend && phone != null) {
      try { await ApiService.removeInstance(baseUrl, apiToken, phone!); } catch (_) {}
    }
    final p = await SharedPreferences.getInstance();
    await p.remove(_kPhone);
    await p.remove(_kLinked);
    phone = null;
    pendingPhone = null;
    pairingCode = null;
    instanceConnected = null;
    status = LinkStatus.notLinked;
    notifyListeners();
  }

  /// Etat complet de l'instance (backend si configure, sinon demo).
  Future<BotInstance> fetchInstance() async {
    if (connectedToBackend && phone != null) {
      try {
        return await ApiService.fetchInstance(baseUrl, apiToken, phone!);
      } catch (_) {
        return BotInstance(phone: phone!, connected: false, groups: 0, commandsToday: 0, uptime: '-');
      }
    }
    return BotInstance.demo(phone ?? '');
  }

  // --- Surveillance ---

  void startMonitor() {
    _monitor?.cancel();
    if (status != LinkStatus.linked) return;
    _checkOnce();
    _monitor = Timer.periodic(_pollEvery, (_) => _checkOnce());
  }

  void stopMonitor() {
    _monitor?.cancel();
    _monitor = null;
  }

  Future<void> _checkOnce() async {
    if (status != LinkStatus.linked || phone == null) return;
    bool connected;
    try {
      if (connectedToBackend) {
        final inst = await ApiService.fetchInstance(baseUrl, apiToken, phone!);
        connected = inst.connected;
      } else {
        connected = true; // demo: toujours connecte
      }
    } catch (_) {
      connected = false; // injoignable = considere deconnecte
    }
    final was = instanceConnected;
    instanceConnected = connected;
    if (was == true && connected == false) {
      await NotificationService.notifyBotDisconnected(phone!);
    }
    notifyListeners();
  }

  Future<void> simulateDisconnect() async {
    instanceConnected = false;
    notifyListeners();
    await NotificationService.notifyBotDisconnected(phone ?? '');
  }

  @override
  void dispose() {
    stopMonitor();
    super.dispose();
  }
}
