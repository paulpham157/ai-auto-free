import 'dart:io';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/services/python/py_shell.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:url_launcher/url_launcher.dart';

typedef ProgressCallback = void Function(String message);

class GetPy {
  GetPy._private();
  static final GetPy _instance = GetPy._private();
  static GetPy get instance => _instance;

  final _dio = Dio();

  Future<bool> checkAndSetup(ProgressCallback onProgress) async {
    if (Platform.isWindows) {
      return await _getWindowsPython(onProgress);
    } else if (Platform.isMacOS) {
      return await _getMacOSPython(onProgress);
    } else if (Platform.isLinux) {
      return await _getLinuxPython(onProgress);
    }
    return false;
  }

  Future<bool> _manuelDownload(ProgressCallback onProgress) async {
    final pythonUrl = Uri.parse('https://www.python.org/downloads/');
    if (await canLaunchUrl(pythonUrl)) {
      await launchUrl(pythonUrl);
      onProgress(S.current.please_install_python_from_the_website);
      return true;
    }
    return false;
  }

  Future<bool> _getWindowsPython(ProgressCallback onProgress) async {
    try {
      onProgress(S.current.downloading_python_installer);

      // Get temp directory for downloading installer
      final tempDir = await getTemporaryDirectory();
      final installerPath = '${tempDir.path}\\python_installer.exe';

      // Download Python installer
      await _dio.download(
        'https://www.python.org/ftp/python/3.13.1/python-3.13.1-amd64.exe',
        installerPath,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            final progress = (received / total * 100).toStringAsFixed(0);
            onProgress("${S.current.downloading_python}: $progress%");
          }
        },
      );

      onProgress(S.current.installing_python_silently);
      // Install Python silently with required options
      await PyShell.instance.installWindows(installerPath);

      return true;
    } catch (e) {
      onProgress("${S.current.error_installing_python}: $e");
      return await _manuelDownload(onProgress);
    }
  }

  Future<bool> _getMacOSPython(ProgressCallback onProgress) async {
    try {
      onProgress(S.current.downloading_python_installer_for_macos);

      // Get temp directory for downloading installer
      final tempDir = await getTemporaryDirectory();
      final installerPath = '${tempDir.path}/python_installer.pkg';

      // Download Python installer
      await _dio.download(
        'https://www.python.org/ftp/python/3.13.1/python-3.13.1-macos11.pkg',
        installerPath,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            final progress = (received / total * 100).toStringAsFixed(0);
            onProgress("${S.current.downloading_python}: $progress%");
          }
        },
      );

      onProgress(S.current.installing_python);
      await PyShell.instance.installMacOS(installerPath);

      return true;
    } catch (e) {
      onProgress("${S.current.error_installing_python}: $e");
      return await _manuelDownload(onProgress);
    }
  }

  Future<bool> _getLinuxPython(ProgressCallback onProgress) async {
    try {
      onProgress(S.current.installing_python_using_package_manager);

      // First update package list
      final updateResult = await Process.run('sudo', ['apt-get', 'update']);
      if (updateResult.exitCode != 0) {
        onProgress(S.current.failed_to_update_package_list);
        return false;
      }

      // Install Python3
      await PyShell.instance.installLinux();

      return true;
    } catch (e) {
      onProgress(
          "${S.current.installing_python_using_package_manager_error}: $e");
      return await _manuelDownload(onProgress);
    }
  }
}
