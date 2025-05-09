import 'dart:developer';

import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:ai_auto_free/services/python/py_shell.dart';

import 'run_py.dart';

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
      log('Pip kurulumu veya bağımlılık yükleme hatası: $e');
      onProgress(S.current.error_during_dependency_installation);
      return false;
    }
  }

  Future<bool> _checkAndInstallPip(ProgressCallback onProgress) async {
    try {
      onProgress(S.current.checking_pip_installation);

      // Pip kurulu mu kontrol et
      final isPipInstalled = await PyShell.instance.whichPip();

      if (isPipInstalled) {
        // Pip zaten kurulu
        onProgress(S.current.pip_is_already_installed);
        return true;
      } else {
        // Pip kurulu değil, kurulum yap
        onProgress(S.current.pip_is_not_installed_installing_pip);

        final result = await PyShell.instance.installPip();

        if (result.first.exitCode == 0) {
          // Pip kurulumu başarılı
          onProgress(S.current.pip_installed_successfully);
          return true;
        } else {
          // Pip kurulumu başarısız
          log('Pip kurulumu başarısız: ${result.first.stderr}');
          onProgress(S.current
              .failed_to_install_pip_please_install_python_with_pip_included(
                  HelperUtils.getDependencyCommand()));
          return false;
        }
      }
    } catch (e) {
      log('Pip kurulum hatası: $e');
      onProgress(S.current
          .failed_to_install_pip_please_install_python_with_pip_included(
              HelperUtils.getDependencyCommand()));
      return false;
    }
  }

  Future<bool> _installDependencies(ProgressCallback onProgress) async {
    try {
      // RunPy.instance.services null olabilir, kontrol et
      final dependencies = RunPy.instance.services?.dependencies;
      if (dependencies == null || dependencies.isEmpty) {
        log('Bağımlılık listesi boş veya null');
        return true; // Bağımlılık yoksa başarılı kabul et
      }

      for (var dep in dependencies) {
        log("checking $dep...");
        onProgress("${S.current.checking} $dep...");
        if (!await PyShell.instance.checkDependency(dep)) {
          onProgress("${S.current.installing} $dep...");
          try {
            final result = await PyShell.instance.installDependency(dep);
            if (result.first.exitCode == 0) {
              onProgress("${S.current.installed_successfully} $dep");
            } else {
              log('Bağımlılık kurulum hatası: ${result.first.stderr}');
              onProgress(
                  "${S.current.error_installing_dependencies(HelperUtils.getDependencyCommand())}: $dep");
              return false;
            }
          } catch (e) {
            log('Bağımlılık kurulum hatası: $e');
            onProgress(
                "${S.current.error_installing_dependencies(HelperUtils.getDependencyCommand())}: $dep - $e");
            return false;
          }
        } else {
          onProgress("${S.current.is_already_installed} $dep");
        }
      }
      return true;
    } catch (e) {
      log('Bağımlılık kurulum hatası: $e');
      onProgress(
          "${S.current.error_installing_dependencies(HelperUtils.getDependencyCommand())}: $e");
      return false;
    }
  }
}
