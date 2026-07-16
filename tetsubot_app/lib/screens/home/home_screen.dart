import 'package:flutter/material.dart';

import 'mybot_tab.dart';
import 'stats_tab.dart';
import 'settings_tab.dart';

/// Ecran principal une fois le WhatsApp lie: gestion de SON instance de bot.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _index = 0;

  static const _titles = ['Mon Bot', 'Statistiques', 'Reglages'];
  final _tabs = const [MyBotTab(), StatsTab(), SettingsTab()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_titles[_index])),
      body: IndexedStack(index: _index, children: _tabs),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.smart_toy_rounded), label: 'Mon Bot'),
          NavigationDestination(icon: Icon(Icons.insights_rounded), label: 'Stats'),
          NavigationDestination(icon: Icon(Icons.settings_rounded), label: 'Reglages'),
        ],
      ),
    );
  }
}
