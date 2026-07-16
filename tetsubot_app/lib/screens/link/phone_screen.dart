import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../services/bot_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/server_dialog.dart';
import 'pairing_screen.dart';

/// Etape 1: l'utilisateur saisit son numero pour lier SON WhatsApp au bot.
class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});

  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  final _controller = TextEditingController();
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final digits = BotService.normalize(_controller.text);
    if (digits.length < 8) {
      setState(() => _error = 'Entre un numero valide (format international).');
      return;
    }
    setState(() => _error = null);

    final bot = context.read<BotService>();
    final error = await bot.generatePairingCode(digits);
    if (!mounted) return;
    if (error != null) {
      setState(() => _error = 'Serveur injoignable: $error');
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const PairingScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bot = context.watch<BotService>();

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(Icons.link_rounded, size: 68, color: AppTheme.seed),
                const SizedBox(height: 16),
                Text(
                  'KASSIM-BOT',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Lie ton WhatsApp au bot pour obtenir\nta propre instance (ton bot, ta section).',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.white70),
                ),
                const SizedBox(height: 32),
                TextField(
                  controller: _controller,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[0-9 +\-]')),
                  ],
                  decoration: InputDecoration(
                    labelText: 'Ton numero WhatsApp',
                    hintText: 'ex: +229 01 45 49 44 64',
                    prefixIcon: const Icon(Icons.phone_rounded),
                    errorText: _error,
                  ),
                ),
                const SizedBox(height: 20),
                PrimaryButton(
                  label: 'Generer le code de liaison',
                  loading: bot.busy,
                  onPressed: _submit,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Ta liaison cree une nouvelle session, sans toucher aux autres.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white38, fontSize: 12),
                ),
                const SizedBox(height: 16),
                TextButton.icon(
                  onPressed: () => showServerConfigDialog(context),
                  icon: const Icon(Icons.dns_rounded, size: 18),
                  label: Text(
                    bot.connectedToBackend ? 'Serveur configure' : 'Configurer le serveur (mode demo)',
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
