import 'package:ai_auto_free/common/base_provider.dart';
import 'package:ai_auto_free/common/constants.dart';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/models/update_model.dart';
import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:ai_auto_free/services/python/run_py.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';

class UpdateProvider extends BaseProvider {
  UpdateResponse? updateInfo;
  bool isLoading = true;
  String? error;
  PackageInfo? _packageInfo;
  bool hasUpdate = false;

  // Test modu için değişkenler
  bool _isTestMode = false;
  String _testVersion = '1.0.0';
  final String _testUrl =
      'https://github.com/kodu67/ai-auto-free/releases/download/v2.0.6/AI.Auto.Free.v2.0.6.zip';

  String? _progressText;
  String? get progressText => _progressText;
  bool _progress = false;
  bool get progress => _progress;

  // Test modunu aktifleştirmek için metod
  void enableTestMode({String testVersion = '2.0.0'}) {
    _isTestMode = true;
    _testVersion = testVersion;
  }

  // Test modunu kapatmak için metod
  void disableTestMode() {
    _isTestMode = false;
  }

  Future<void> _initPackageInfo() async {
    if (_isTestMode) {
      _packageInfo = PackageInfo(
        appName: 'Test App',
        packageName: 'com.test.app',
        version: '1.0.0',
        buildNumber: '1',
      );
      return;
    }
    _packageInfo = await PackageInfo.fromPlatform();
  }

  void init(BuildContext context) {
    // enableTestMode();
    checkUpdate(context);
  }

  void _setLoading(bool value) {
    isLoading = value;
    notifyListeners();
  }

  Future<void> checkUpdate(BuildContext context) async {
    try {
      _setLoading(true);

      await _initPackageInfo();

      if (_isTestMode) {
        // Test modunda sahte güncelleme bilgisi oluştur
        updateInfo = UpdateResponse(
          version: _testVersion,
          changes: 'Test mode update notes',
          url: {'windows': _testUrl},
          mandatory: false,
        );

        if (_packageInfo != null) {
          final currentVersion = _packageInfo!.version;
          hasUpdate = _compareVersions(currentVersion, updateInfo!.version);

          if (!hasUpdate && context.mounted) {
            error = null;
            skipUpdate(context);
            return;
          }
        }
        error = null;
        _setLoading(false);
        return;
      }

      final dio = Dio();
      final response = await dio.get(
        '${Constants.apiUrl}/check-update',
        options: Options(
          validateStatus: (status) => status != null && status < 500,
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        updateInfo = UpdateResponse.fromJson(response.data);

        // Sürüm karşılaştırması yap
        if (_packageInfo != null) {
          final currentVersion = _packageInfo!.version;
          hasUpdate = _compareVersions(currentVersion, updateInfo!.version);

          // Eğer güncelleme yoksa direkt setup sayfasına yönlendir
          if (!hasUpdate && context.mounted) {
            error = null;
            skipUpdate(context);
            return;
          }
        }

        error = null;
      } else {
        error = S.current.invalid_server_response;
      }
    } on DioException catch (e) {
      error = S.current.update_connection_error(e.message ?? '');
    } catch (e) {
      error = S.current.unexpected_error(e.toString());
    } finally {
      Future.delayed(const Duration(seconds: 1), () {
        _setLoading(false);
      });
    }
  }

  bool _compareVersions(String currentVersion, String newVersion) {
    // Sürüm formatı: x.y.z
    final current = currentVersion.split('.').map(int.parse).toList();
    final latest = newVersion.split('.').map(int.parse).toList();

    // Major sürüm karşılaştırması
    if (latest[0] > current[0]) return true;
    if (latest[0] < current[0]) return false;

    // Minor sürüm karşılaştırması
    if (latest[1] > current[1]) return true;
    if (latest[1] < current[1]) return false;

    // Patch sürüm karşılaştırması
    return latest[2] > current[2];
  }

  void skipUpdate(BuildContext context) {
    context.go('/setup');
  }

  void _updateProgress(String message) {
    _progressText = message;
    _progress = true;
    notifyListeners();
  }

  Future<void> downloadUpdate() async {
    try {
      _updateProgress(S.current.downloading_update);

      // Dosyayı indir
      final downloadedZipFile = await downloadFile();

      if (downloadedZipFile == null) {
        _updateProgress(S.current.download_failed);
        return;
      }

      _updateProgress(S.current.installing_update);

      final appFolder = HelperUtils.getApplicationDirectory();

      // İndirilen dosyayı Python script'ine gönder
      RunPy.instance.runDetachedProcess("python", arguments: [
        "script.py",
        "update",
        "--zip-path=$downloadedZipFile",
        "--target-folder=$appFolder"
      ]);
    } catch (e) {
      _updateProgress(S.current.update_failed(e.toString()));
    }
  }

  void manualDownload() {
    HelperUtils.launchURL(updateInfo?.url["windows"] ?? '');
  }

  Future<String?> downloadFile() async {
    try {
      final url = updateInfo?.url["windows"];
      if (url == null) {
        _updateProgress(S.current.no_download_url);
        return null;
      }

      // Geçici klasörü al
      final tempDir = await getTemporaryDirectory();
      final fileName = url.split('/').last;
      final savePath = '${tempDir.path}/$fileName';

      // Eğer dosya zaten varsa sil
      final file = File(savePath);
      if (await file.exists()) {
        await file.delete();
      }

      // Dio ile indirme işlemi
      final dio = Dio();
      await dio.download(
        url,
        savePath,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            final progress = (received / total * 100).toStringAsFixed(0);
            _updateProgress("${S.current.downloading}: %$progress");
          }
        },
      );

      _updateProgress(S.current.download_completed);
      return savePath;
    } catch (e) {
      _updateProgress(S.current.download_error(e.toString()));
      return null;
    }
  }
}
