import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/api_service.dart';
import '../services/bot_service.dart';

/// Dialogue de configuration du serveur du bot (URL + token), avec test de
/// connexion. URL vide = mode demo.
Future<void> showServerConfigDialog(BuildContext context) async {
  final bot = context.read<BotService>();
  final urlController = TextEditingController(text: bot.baseUrl);
  final tokenController = TextEditingController(text: bot.apiToken);

  await showDialog<void>(
    context: context,
    builder: (ctx) {
      String? result;
      bool testing = false;

      return StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          title: const Text('Serveur du bot'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: urlController,
                keyboardType: TextInputType.url,
                decoration: const InputDecoration(
                  labelText: 'URL du bot',
                  hintText: 'https://mon-bot.up.railway.app',
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: tokenController,
                decoration: const InputDecoration(labelText: 'Token (optionnel)'),
              ),
              const SizedBox(height: 10),
              if (result != null)
                Text(
                  result!,
                  style: TextStyle(
                    fontSize: 12,
                    color: result!.startsWith('OK') ? Colors.greenAccent : Colors.redAccent,
                  ),
                ),
              const SizedBox(height: 4),
              const Text(
                'Laisse l\'URL vide pour le mode demo.',
                style: TextStyle(fontSize: 12, color: Colors.white54),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: testing
                  ? null
                  : () async {
                      final url = urlController.text.trim();
                      if (url.isEmpty) {
                        setState(() => result = 'Entre une URL a tester.');
                        return;
                      }
                      setState(() { testing = true; result = 'Test en cours...'; });
                      try {
                        final ok = await ApiService.checkConnection(url, tokenController.text.trim());
                        setState(() => result = ok ? 'OK: serveur joignable' : 'Reponse inattendue du serveur');
                      } catch (e) {
                        setState(() => result = 'Echec: $e');
                      } finally {
                        setState(() => testing = false);
                      }
                    },
              child: const Text('Tester'),
            ),
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
            FilledButton(
              onPressed: () async {
                await bot.setServer(urlController.text, tokenController.text);
                if (ctx.mounted) Navigator.pop(ctx);
              },
              child: const Text('Enregistrer'),
            ),
          ],
        ),
      );
    },
  );
}
