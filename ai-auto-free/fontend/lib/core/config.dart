import 'dart:ui';
import 'package:ai_auto_free/common/constants.dart';
import 'package:window_manager/window_manager.dart';

class AppConfig {
  AppConfig._private();

  static final AppConfig _instance = AppConfig._private();

  AppConfig.internal();

  factory AppConfig() {
    return _instance;
  }

  Future<void> setWindowConfig() async {
    await windowManager.ensureInitialized();
    WindowOptions windowOptions = WindowOptions(
      size: Size(1000, 625),
      center: true,
      title: Constants.name,
    );

    windowManager.waitUntilReadyToShow(windowOptions, () async {
      await windowManager.setAsFrameless();
      await windowManager.show();
      await windowManager.focus();
    });
  }
}
