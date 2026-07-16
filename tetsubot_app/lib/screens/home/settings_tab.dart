import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../services/bot_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/server_dialog.dart';

/// Reglages de l'instance: prefixe (defini par le proprietaire), modules.
class SettingsTab extends StatefulWidget {
  const SettingsTab({super.key});

  @override
  State<SettingsTab> createState() => _SettingsTabState();
}

class _SettingsTabState extends State<SettingsTab> {
  bool _xp = true;
  bool _quiz = true;
  bool _nsfw = false;
  bool _antilink = false;

  Future<void> _editPrefix() async {
    final bot = context.read<BotService>();
    final controller = TextEditingController(text: bot.prefix);
    final value = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Prefixe des commandes'),
        content: TextField(
          controller: controller,
          maxLength: 3,
          autofocus: true,
          inputFormatters: [FilteringTextInputFormatter.deny(RegExp(r'\s'))],
          decoration: const InputDecoration(
            hintText: 'ex: ! ou . ou /',
            counterText: '',
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, controller.text),
            child: const Text('Enregistrer'),
          ),
        ],
      ),
    );
    if (value != null) {
      await bot.setPrefix(value);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bot = context.watch<BotService>();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Proprietaire de la section
        Card(
          child: ListTile(
            leading: const Icon(Icons.verified_user_rounded, color: AppTheme.gold),
            title: const Text('Proprietaire de cette section'),
            subtitle: Text('+${bot.phone ?? ''}'),
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: ListTile(
            leading: const Icon(Icons.dns_rounded),
            title: const Text('Serveur du bot'),
            subtitle: Text(bot.connectedToBackend ? bot.baseUrl : 'Mode demo (non configure)'),
            trailing: const Icon(Icons.edit_rounded),
            onTap: () => showServerConfigDialog(context),
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: ListTile(
            leading: const Icon(Icons.tag_rounded),
            title: const Text('Prefixe des commandes'),
            subtitle: Text('Actuel: "${bot.prefix}"  (ex: ${bot.prefix}menu)'),
            trailing: const Icon(Icons.edit_rounded),
            onTap: _editPrefix,
          ),
        ),
        const SizedBox(height: 12),
        Text('Modules', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 6),
        Card(
          child: Column(
            children: [
              SwitchListTile(
                title: const Text('Systeme XP / niveaux'),
                value: _xp,
                onChanged: (v) => setState(() => _xp = v),
              ),
              SwitchListTile(
                title: const Text('Quiz'),
                value: _quiz,
                onChanged: (v) => setState(() => _quiz = v),
              ),
              SwitchListTile(
                title: const Text('Anti-lien'),
                value: _antilink,
                onChanged: (v) => setState(() => _antilink = v),
              ),
              SwitchListTile(
                title: const Text('NSFW'),
                value: _nsfw,
                onChanged: (v) => setState(() => _nsfw = v),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'Le prefixe est enregistre sur l\'app. Il sera applique a ta section une '
          'fois l\'app reliee au bot. Les modules sont en demo.',
          style: TextStyle(color: Colors.white54, fontSize: 12),
        ),
      ],
    );
  }
}
