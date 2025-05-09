import 'dart:developer';
import 'dart:io';
import 'helper_utils.dart';

class ChromeDetect {
  ChromeDetect._private();
  static final ChromeDetect _instance = ChromeDetect._private();
  static ChromeDetect get instance => _instance;

  bool isChromeInstalled() {
    if (Platform.isWindows) {
      // Windows'ta Chrome'un yaygın yükleme konumlarını kontrol et
      final List<String> possiblePaths = [
        '${Platform.environment['ProgramFiles']}\\Google\\Chrome\\Application\\chrome.exe',
        '${Platform.environment['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe',
        '${Platform.environment['LocalAppData']}\\Google\\Chrome\\Application\\chrome.exe',
      ];

      // Herhangi bir konumda Chrome varsa true döndür
      for (final path in possiblePaths) {
        if (File(path).existsSync()) {
          log(path);
          return true;
        }
      }

      // Registry'de kontrol et (hata alınırsa yoksay)
      try {
        final result = HelperUtils.shell.runSync(
            'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe"');
        return result.first.exitCode == 0;
      } catch (_) {
        // Registry kontrolü başarısız olursa yoksay
      }

      return false;
    } else if (Platform.isMacOS) {
      return Directory('/Applications/Google Chrome.app').existsSync();
    } else if (Platform.isLinux) {
      try {
        final result = HelperUtils.shell.runSync('which google-chrome');
        return result.first.exitCode == 0;
      } catch (_) {
        return false;
      }
    }

    return false;
  }
}
