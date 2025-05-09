import 'package:ai_auto_free/features/home/home_provider.dart';
import 'package:ai_auto_free/features/info/notice_page.dart';
import 'package:ai_auto_free/features/pricing/pricing_page.dart';
import 'package:ai_auto_free/features/pricing/pricing_provider.dart';
import 'package:ai_auto_free/features/setup/setup_provider.dart';
import 'package:ai_auto_free/features/update/update_page.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../features/home/home_page.dart';
import '../features/settings/settings_page.dart';
import '../features/settings/settings_provider.dart';
import '../features/setup/setup_page.dart';
import '../features/update/update_provider.dart';
import '../models/user_info_model.dart';
import '../services/auth_service.dart';

final router = GoRouter(
  initialLocation: '/notice',
  routes: [
    GoRoute(
      path: '/notice',
      builder: (context, state) => const NoticePage(),
    ),
    GoRoute(
      path: '/update',
      builder: (context, state) => ChangeNotifierProvider<UpdateProvider>.value(
        value: UpdateProvider()..init(context),
        child: const UpdatePage(),
      ),
    ),
    GoRoute(
      path: '/setup',
      builder: (context, state) => ChangeNotifierProvider<SetupProvider>.value(
        value: SetupProvider()..init(context),
        child: const SetupPage(),
      ),
    ),
    GoRoute(
      path: '/',
      builder: (context, state) => MultiProvider(
        providers: [
          ChangeNotifierProvider<HomeProvider>.value(
            value: HomeProvider(),
          ),
          ChangeNotifierProvider<UserInfoModel?>.value(
            value: SecureAuthStorage.instance.userInfo,
          ),
        ],
        child: const HomePage(),
      ),
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) =>
          ChangeNotifierProvider<SettingsProvider>.value(
        value: SettingsProvider(),
        child: const SettingsPage(),
      ),
    ),
    GoRoute(
      path: '/pricing',
      builder: (context, state) =>
          ChangeNotifierProvider<PricingProvider>.value(
        value: PricingProvider(),
        child: const PricingPage(),
      ),
    ),
  ],
);
