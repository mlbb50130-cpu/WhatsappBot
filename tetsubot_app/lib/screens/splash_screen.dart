import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/bot_service.dart';
import 'link/phone_screen.dart';
import 'home/home_screen.dart';

/// Routeur racine reactif: liaison faite -> Home, sinon -> ecran de liaison.
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final bot = context.watch<BotService>();

    switch (bot.status) {
      case LinkStatus.unknown:
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      case LinkStatus.notLinked:
        return const PhoneScreen();
      case LinkStatus.linked:
        return const HomeScreen();
    }
  }
}
