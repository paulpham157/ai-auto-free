import 'dart:developer';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/services/helper_utils.dart';
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

  // En son Python sürümü - bu değer dinamik olarak güncellenebilir
  static const String _defaultPythonVersion = "3.13.2";

  // Python sürümünü almak için API URL'si
  static const String _pythonVersionApiUrl =
      "https://www.python.org/api/v2/downloads/release/";

  Future<bool> checkAndSetup(ProgressCallback onProgress) async {
    // Microsoft Store'da Python'ı açmak için
    onProgress(S.current.please_install_python_from_the_website);

    // Microsoft Store'da Python'ı açmak için URL
    const pythonStoreUrl =
        'ms-windows-store://pdp/?ProductId=9PNRBTZXMB4Z'; // Python 3.11 Store ID

    // HelperUtils.launchURL metodunu kullanarak Microsoft Store'da Python'ı aç
    try {
      await HelperUtils.launchURL(pythonStoreUrl);
      return false;
    } catch (e) {
      return await _getWindowsPython(onProgress);
    }
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

  /// En son kararlı Python sürümünü almaya çalışır, başarısız olursa varsayılan sürümü döndürür
  Future<String> _getLatestPythonVersion() async {
    try {
      // Python'un API'sinden en son sürümü almaya çalış
      final response = await _dio.get(_pythonVersionApiUrl);
      if (response.statusCode == 200 && response.data != null) {
        // API yanıtını listeye dönüştür
        final List<dynamic> versions = response.data;

        // Yayınlanmış ve en son sürüm olan versiyonları filtrele
        final publishedVersions = versions
            .where((v) => v['is_published'] == true && v['is_latest'] == true)
            .toList();

        if (publishedVersions.isNotEmpty) {
          // Version numaralarına göre sırala ve en yüksek olanı al
          publishedVersions.sort((a, b) =>
              b['version'].toString().compareTo(a['version'].toString()));

          return publishedVersions.first['name'].split(' ').last;
        }
      }

      log('API yanıtından geçerli bir Python sürümü bulunamadı');
    } catch (e) {
      // API çağrısı başarısız olursa loglama yap
      log('Python sürümü alınamadı: $e');
    }

    // Hata durumunda varsayılan sürümü kullan
    return _defaultPythonVersion;
  }

  Future<bool> _getWindowsPython(ProgressCallback onProgress) async {
    try {
      onProgress(S.current.downloading_python_installer);

      // En son Python sürümünü al
      final pythonVersion = await _getLatestPythonVersion();

      // Get temp directory for downloading installer
      final tempDir = await getTemporaryDirectory();
      final installerPath = '${tempDir.path}\\python_installer.exe';

      // Download Python installer
      await _dio.download(
        'https://www.python.org/ftp/python/$pythonVersion/python-$pythonVersion-amd64.exe',
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
      final installResult =
          await PyShell.instance.installWindows(installerPath);

      // Kurulum başarısız olduysa
      if (installResult.first.exitCode != 0) {
        onProgress("${S.current.error_installing_python}: Installation failed");
        return await _manuelDownload(onProgress);
      }

      // Python kurulumu sonrası PATH kontrolü
      onProgress(S.current.python_path_progress);

      // PATH kontrolü - Python PATH'e eklenmiş mi?
      if (!await PyShell.instance.isPythonInPath()) {
        onProgress(S.current.python_path_error);
        return true; // Yine de kurulum başarılı sayılır, kullanıcı bilgilendirilir
      }

      onProgress(S.current.python_path_success);
      return true;
    } catch (e) {
      onProgress("${S.current.error_installing_python}: $e");
      return await _manuelDownload(onProgress);
    }
  }
}
