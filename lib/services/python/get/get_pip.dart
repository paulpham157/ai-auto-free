import 'dart:developer';

import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/services/python/py_shell.dart';

import '../run/run_py.dart';

typedef ProgressCallback = void Function(String message);

class GetPip {
  GetPip._private();
  static final GetPip _instance = GetPip._private();
  static GetPip get instance => _instance;

  Future<bool> checkAndSetup(ProgressCallback onProgress) async {
    try {
      // First check and install pip
      if (!await _checkAndInstallPip(onProgress)) {
        return false;
      }

      // Then install all dependencies
      return await _installDependencies(onProgress);
    } catch (e) {
      onProgress(S.current.error_during_dependency_installation);
      return false;
    }
  }

  Future<bool> _checkAndInstallPip(ProgressCallback onProgress) async {
    try {
      onProgress(S.current.checking_pip_installation);

      if (await PyShell.instance.whichPip() == null) {
        onProgress(S.current.pip_is_not_installed_installing_pip);
        await PyShell.instance.installPip();

        onProgress(S.current.pip_installed_successfully);
      } else {
        onProgress(S.current.pip_is_already_installed);
      }

      return true;
    } catch (e) {
      onProgress(S.current
          .failed_to_install_pip_please_install_python_with_pip_included);
      return false;
    }
  }

  Future<bool> _installDependencies(ProgressCallback onProgress) async {
    try {
      for (var dep in RunPy.instance.services!.dependencies) {
        log("checking $dep...");
        onProgress("${S.current.checking} $dep...");
        if (!await PyShell.instance.checkDependency(dep)) {
          onProgress("${S.current.installing} $dep...");
          await PyShell.instance.installDependency(dep);

          onProgress("${S.current.installed_successfully} $dep");
        } else {
          onProgress("${S.current.is_already_installed} $dep");
        }
      }
      return true;
    } catch (e) {
      onProgress("${S.current.error_installing_dependencies}: $e");
      return false;
    }
  }
}
