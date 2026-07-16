import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/bot_instance.dart';
import '../../services/bot_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/stat_card.dart';

class StatsTab extends StatefulWidget {
  const StatsTab({super.key});

  @override
  State<StatsTab> createState() => _StatsTabState();
}

class _StatsTabState extends State<StatsTab> {
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

  @override
  Widget build(BuildContext context) {
    final inst = _instance;
    if (inst == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.5,
            children: [
              StatCard(icon: Icons.groups_rounded, label: 'Groupes', value: '${inst.groups}'),
              StatCard(icon: Icons.terminal_rounded, label: 'Commandes (auj.)', value: '${inst.commandsToday}'),
              StatCard(icon: Icons.timer_rounded, label: 'Uptime', value: inst.uptime, color: AppTheme.gold),
              StatCard(
                icon: Icons.wifi_rounded,
                label: 'Etat',
                value: inst.connected ? 'En ligne' : 'Hors ligne',
                color: inst.connected ? Colors.greenAccent : Colors.redAccent,
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            'Statistiques de demonstration (en attente du backend).',
            style: TextStyle(color: Colors.white54, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
