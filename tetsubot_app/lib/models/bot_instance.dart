/// Etat de l'instance de bot d'un proprietaire (sa "section").
class BotInstance {
  final String phone;
  final bool connected;
  final int groups;
  final int commandsToday;
  final String uptime;

  const BotInstance({
    required this.phone,
    required this.connected,
    required this.groups,
    required this.commandsToday,
    required this.uptime,
  });

  factory BotInstance.fromJson(Map<String, dynamic> json) {
    return BotInstance(
      phone: json['phone'] as String? ?? '',
      connected: json['connected'] as bool? ?? false,
      groups: (json['groups'] as num?)?.toInt() ?? 0,
      commandsToday: (json['commandsToday'] as num?)?.toInt() ?? 0,
      uptime: json['uptime'] as String? ?? '-',
    );
  }

  /// Donnees de demonstration tant que l'app n'est pas reliee au bot.
  factory BotInstance.demo(String phone) => BotInstance(
        phone: phone,
        connected: true,
        groups: 3,
        commandsToday: 128,
        uptime: '4 h 12 min',
      );
}
