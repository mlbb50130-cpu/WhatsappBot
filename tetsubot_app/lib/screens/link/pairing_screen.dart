import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../services/bot_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/primary_button.dart';

/// Etape 2: affiche le pairing code a saisir dans WhatsApp pour lier le compte.
class PairingScreen extends StatelessWidget {
  const PairingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final bot = context.watch<BotService>();

    return Scaffold(
      appBar: AppBar(title: const Text('Liaison WhatsApp')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 8),
              Text(
                'Ton code de liaison',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                'Numero: +${bot.pendingPhone ?? ''}',
                style: const TextStyle(color: Colors.white70),
              ),
              const SizedBox(height: 20),

              // Le code a saisir dans WhatsApp
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: bot.pairingCode ?? ''));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Code copie')),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 22),
                  decoration: BoxDecoration(
                    color: AppTheme.seed.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.seed.withValues(alpha: 0.6)),
                  ),
                  child: Text(
                    bot.prettyCode,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 34,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 6,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 6),
              const Center(
                child: Text('Touche le code pour le copier', style: TextStyle(color: Colors.white38, fontSize: 12)),
              ),
              const SizedBox(height: 24),

              const _Steps(),
              const SizedBox(height: 12),

              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'Mode demo: le code est genere localement. Une fois l\'app reliee '
                  'au bot, ce sera le vrai code WhatsApp de ton instance.',
                  style: TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ),
              const SizedBox(height: 20),

              PrimaryButton(
                label: 'J\'ai lie mon compte',
                loading: bot.busy,
                onPressed: () async {
                  final ok = await bot.confirmLinked();
                  if (!context.mounted) return;
                  if (ok) {
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Pas encore connecte. Termine la liaison dans WhatsApp puis reessaie.',
                        ),
                      ),
                    );
                  }
                },
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: bot.busy ? null : () => bot.generatePairingCode(bot.pendingPhone ?? ''),
                child: const Text('Generer un nouveau code'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Steps extends StatelessWidget {
  const _Steps();

  @override
  Widget build(BuildContext context) {
    const steps = [
      'Ouvre WhatsApp sur le telephone de ce numero.',
      'Va dans Reglages > Appareils connectes.',
      'Touche "Connecter un appareil".',
      'Choisis "Connecter avec le numero de telephone".',
      'Saisis le code affiche ci-dessus.',
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < steps.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 12,
                  backgroundColor: AppTheme.seed,
                  child: Text('${i + 1}', style: const TextStyle(fontSize: 12, color: Colors.white)),
                ),
                const SizedBox(width: 12),
                Expanded(child: Text(steps[i])),
              ],
            ),
          ),
      ],
    );
  }
}
