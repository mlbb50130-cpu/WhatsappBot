import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/bot_instance.dart';

/// Acces a l'API du bot (multi-instance). Toutes les methodes prennent l'URL de
/// base (ex: https://mon-bot.up.railway.app) et un token optionnel.
class ApiService {
  static Map<String, String> _headers(String token) => {
        'Content-Type': 'application/json',
        if (token.isNotEmpty) 'x-api-token': token,
      };

  /// Verifie que le serveur du bot repond (GET /api/status).
  static Future<bool> checkConnection(String baseUrl, String token) async {
    final r = await http
        .get(_u(baseUrl, '/api/status'), headers: _headers(token))
        .timeout(const Duration(seconds: 12));
    return r.statusCode >= 200 && r.statusCode < 300;
  }

  static Uri _u(String baseUrl, String pathSegment) {
    final base = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    return Uri.parse('$base$pathSegment');
  }

  /// Cree (ou recupere) l'instance et renvoie son etat (avec pairingCode).
  static Future<Map<String, dynamic>> createInstance(
      String baseUrl, String token, String phone, String prefix) async {
    final r = await http
        .post(_u(baseUrl, '/api/instances'),
            headers: _headers(token), body: jsonEncode({'phone': phone, 'prefix': prefix}))
        .timeout(const Duration(seconds: 20));
    if (r.statusCode >= 200 && r.statusCode < 300) {
      return jsonDecode(r.body) as Map<String, dynamic>;
    }
    throw Exception('HTTP ${r.statusCode}: ${r.body}');
  }

  /// Etat brut d'une instance (null si 404).
  static Future<Map<String, dynamic>?> getInstanceRaw(
      String baseUrl, String token, String phone) async {
    final r = await http
        .get(_u(baseUrl, '/api/instances/$phone'), headers: _headers(token))
        .timeout(const Duration(seconds: 15));
    if (r.statusCode == 404) return null;
    if (r.statusCode >= 200 && r.statusCode < 300) {
      return jsonDecode(r.body) as Map<String, dynamic>;
    }
    throw Exception('HTTP ${r.statusCode}');
  }

  static Future<BotInstance> fetchInstance(String baseUrl, String token, String phone) async {
    final raw = await getInstanceRaw(baseUrl, token, phone);
    if (raw == null) {
      return BotInstance(phone: phone, connected: false, groups: 0, commandsToday: 0, uptime: '-');
    }
    return BotInstance.fromJson(raw);
  }

  static Future<void> setPrefix(String baseUrl, String token, String phone, String prefix) async {
    await http
        .post(_u(baseUrl, '/api/instances/$phone/prefix'),
            headers: _headers(token), body: jsonEncode({'prefix': prefix}))
        .timeout(const Duration(seconds: 15));
  }

  static Future<void> removeInstance(String baseUrl, String token, String phone) async {
    await http
        .delete(_u(baseUrl, '/api/instances/$phone'), headers: _headers(token))
        .timeout(const Duration(seconds: 15));
  }
}
