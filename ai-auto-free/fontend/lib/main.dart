import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:google_fonts/google_fonts.dart';
import 'common/constants.dart';
import 'core/config.dart';
import 'core/router.dart';
import 'generated/l10n.dart';
import 'services/auth_service.dart';
import 'services/python/run_py.dart';
import 'services/user_settings.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppConfig().setWindowConfig();
  await SecureAuthStorage.instance.init();
  await UserSettings.init();
  await RunPy.instance.getFeatures();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        textTheme: GoogleFonts.poppinsTextTheme(Theme.of(context).textTheme),
        iconButtonTheme: IconButtonThemeData(
          style: IconButton.styleFrom(
            foregroundColor: Colors.white,
          ),
        ),
      ),
      locale: Constants.languageCode.isNotEmpty
          ? Locale(Constants.languageCode)
          : null,
      routerConfig: router,
      localizationsDelegates: [
        S.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: S.delegate.supportedLocales,
    );
  }
}
