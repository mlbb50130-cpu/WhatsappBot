import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'services/bot_service.dart';
import 'services/notification_service.dart';
import 'theme/app_theme.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.init();
  runApp(const KassimBotApp());
}

class KassimBotApp extends StatelessWidget {
  const KassimBotApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => BotService()..init(),
      child: MaterialApp(
        title: 'KASSIM-BOT',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.dark,
        home: const SplashScreen(),
      ),
    );
  }
}
