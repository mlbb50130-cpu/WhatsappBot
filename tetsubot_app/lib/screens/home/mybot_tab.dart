import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/bot_instance.dart';
import '../../services/bot_service.dart';
import '../../services/notification_service.dart';
import '../../theme/app_theme.dart';

class MyBotTab extends StatefulWidget {
  const MyBotTab({super.key});

  @override
  State<MyBotTab> createState() => _MyBotTabState();
}

class _MyBotTabState extends State<MyBotTab> {
  BotInstance? _instance;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final inst = await context.read<BotService>().fetchInstance();
    if (mounted) setState(() => _instance = inst);
  }

  Future<void> _confirmUnlink() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delier mon WhatsApp ?'),
        content: const Text(
          'Ton instance sera deconnectee. Les autres sessions ne sont pas affectees.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delier')),
        ],
      ),
    );
    if (ok == true && mounted) {
      await context.read<BotService>().unlink();
    }
  }

  @override
  Widget build(BuildContext context) {
    final bot = context.watch<BotService>();
    final inst = _instance;
    if (inst == null) {
      return const Center(child: CircularProgressIndicator());
    }

    // Etat de connexion en direct (surveille), avec repli sur l'etat charge.
    final connected = bot.instanceConnected ?? inst.connected;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          if (!connected) const _DisconnectedBanner(),
          if (!connected) const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Icon(
                    connected ? Icons.check_circle_rounded : Icons.cancel_rounded,
                    color: connected ? Colors.greenAccent : Colors.redAccent,
                    size: 56,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    connected ? 'Ton bot est connecte' : 'Ton bot est deconnecte',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text('+${inst.phone}', style: const TextStyle(color: Colors.white60)),
                  const SizedBox(height: 4),
                  Text('Disponibilite: ${inst.uptime}',
                      style: const TextStyle(color: Colors.white38, fontSize: 13)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          const _DemoNotice(),
          const SizedBox(height: 8),
          TextButton.icon(
            onPressed: () => context.read<BotService>().simulateDisconnect(),
            icon: const Icon(Icons.notifications_active_outlined),
            label: Text(NotificationService.supported
                ? 'Simuler une deconnexion (demo)'
                : 'Simuler une deconnexion (banniere seule ici)'),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: _confirmUnlink,
            icon: const Icon(Icons.link_off_rounded),
            label: const Text('Delier mon WhatsApp'),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(50),
              foregroundColor: Colors.redAccent,
            ),
          ),
        ],
      ),
    );
  }
}

class _DisconnectedBanner extends StatelessWidget {
  const _DisconnectedBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.redAccent.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.redAccent.withValues(alpha: 0.6)),
      ),
      child: const Row(
        children: [
          Icon(Icons.warning_amber_rounded, color: Colors.redAccent),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Ton bot est hors ligne (ex: apres un redeploiement). '
              'Relie ton WhatsApp pour le reactiver.',
              style: TextStyle(fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}

class _DemoNotice extends StatelessWidget {
  const _DemoNotice();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.seed.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Row(
        children: [
          Icon(Icons.science_outlined, size: 18, color: Colors.white54),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'Etat de demonstration. Il reflechira ta vraie instance une fois l\'API du bot branchee.',
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
