import 'package:ai_auto_free/features/home/home_provider.dart';
import 'package:ai_auto_free/features/setup/setup_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../features/home/home_page.dart';
import '../features/settings/settings_page.dart';
import '../features/settings/settings_provider.dart';
import '../features/setup/setup_page.dart';

final router = GoRouter(
  initialLocation: '/setup',
  routes: [
    GoRoute(
      path: '/setup',
      builder: (context, state) => ChangeNotifierProvider(
        create: (context) => SetupProvider()..check(context),
        child: const SetupPage(),
      ),
    ),
    GoRoute(
      path: '/',
      builder: (context, state) => ChangeNotifierProvider(
        create: (context) => HomeProvider(),
        child: const HomePage(),
      ),
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => ChangeNotifierProvider(
        create: (context) => SettingsProvider(),
        child: const SettingsPage(),
      ),
    ),
  ],
);
