import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:tetsubot_app/widgets/primary_button.dart';

void main() {
  testWidgets('PrimaryButton affiche son label et reagit au tap', (tester) async {
    var tapped = false;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: PrimaryButton(
            label: 'Se connecter',
            onPressed: () => tapped = true,
          ),
        ),
      ),
    );

    expect(find.text('Se connecter'), findsOneWidget);

    await tester.tap(find.byType(PrimaryButton));
    expect(tapped, isTrue);
  });

  testWidgets('PrimaryButton en chargement affiche un spinner', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: PrimaryButton(label: 'X', onPressed: null, loading: true),
        ),
      ),
    );

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
