import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/models/services_model.dart';
import 'package:ai_auto_free/services/chrome_detect.dart';
import 'package:ai_auto_free/services/python/py_shell.dart';
import 'package:ai_auto_free/features/setup/py_provider_helper.dart';
import 'package:ai_auto_free/services/python/get/get_pip.dart';
import 'package:ai_auto_free/services/python/get/get_py.dart';
import 'package:ai_auto_free/services/python/run/run_py.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SetupProvider extends PyProviderHelper {
  bool _retryButton = false;
  String _retryMessage = "";

  bool _needRestart = false;
  bool _chromeInstalled = false;

  bool get retryButton => _retryButton;
  String get retryMessage => _retryMessage;
  bool get needRestart => _needRestart;
  bool get chromeInstalled => _chromeInstalled;

  void _setRetryButton(bool value, {String? message}) {
    _retryButton = value;
    _retryMessage = message ?? "";
    notifyListeners();
  }

  void _setNeedRestart(bool value) {
    _needRestart = value;
    notifyListeners();
  }

  void _setChromeInstalled(bool value) {
    _chromeInstalled = value;
    notifyListeners();
  }

  void check(BuildContext context) async {
    try {
      _setRetryButton(false);
      setChecking(true, message: S.current.checking_python);

      // Python mevcut mu kontrol et

      if (await PyShell.instance.whichPy() == null) {
        // eğer mevcut değilse
        setChecking(true, message: S.current.python_not_available);
        // Python'ı kur
        // kurma işlemi başarılı değilse

        if (!await GetPy.instance
            .checkAndSetup((message) => setChecking(true, message: message))) {
          _setRetryButton(true, message: S.current.python_installation_failed);
          setChecking(false);
        } else {
          // başarılı ise pip'i ve paketleri kontrol et

          if (context.mounted) {
            await _checkPip(
              context,
              newInstall: true,
              needRestart: () => _setNeedRestart(true),
            );
          }
        }
      } else {
        // Python zaten mevcutsa pip'i ve paketleri kontrol et
        if (context.mounted) {
          await _checkPip(context);
        }
      }
    } catch (e) {
      _setRetryButton(true);
      debugPrint(e.toString());
    }
  }

  Future<void> _checkPip(BuildContext context,
      {bool newInstall = false, VoidCallback? needRestart}) async {
    try {
      setChecking(true, message: S.current.python_available);
      final result = await GetPip.instance
          .checkAndSetup((message) => setChecking(true, message: message));
      setChecking(false);

      if (!result && newInstall) {
        needRestart?.call();
        return;
      }
      if (context.mounted) {
        _checkChromeInstalled(context);
      }
    } catch (e) {
      _setRetryButton(true);
      rethrow;
    }
  }

  Future<void> _checkChromeInstalled(BuildContext context) async {
    try {
      setChecking(true, message: S.current.checking_chrome);
      _setChromeInstalled(ChromeDetect.instance.isChromeInstalled());
      setChecking(false);

      if (!_chromeInstalled) {
        _setRetryButton(true, message: S.current.please_install_google_chrome);
        return;
      }

      _getRequiredFiles(context);
    } catch (e) {
      _setRetryButton(true, message: e.toString());
      rethrow;
    }
  }

  Future<void> _getRequiredFiles(BuildContext context) async {
    try {
      setChecking(true, message: S.current.getting_required_codes);
      await RunPy.instance.extractZipFile("assets/turnstilePatch.zip");
      for (final need in RunPy.instance.services?.needs ?? []) {
        await RunPy.instance.writePythonFile(need);
      }

      for (final FeatureModel feature
          in RunPy.instance.services?.features ?? []) {
        if (feature.addon != null) {
          await RunPy.instance.writePythonFile(feature.addon!.fileName);
        }
      }

      if (context.mounted) {
        context.go("/");
      }
    } catch (e) {
      _setRetryButton(true, message: e.toString());
      rethrow;
    }
  }
}
