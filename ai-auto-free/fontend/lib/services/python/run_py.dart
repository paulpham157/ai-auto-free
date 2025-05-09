import 'dart:async';
import 'dart:convert';
import 'dart:developer';
import 'dart:io';
import 'package:ai_auto_free/common/constants.dart';
import 'package:ai_auto_free/models/services_model.dart';
import 'package:ai_auto_free/models/log_model.dart';
import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:ai_auto_free/services/python/py_shell.dart';
import 'package:archive/archive.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';
import 'package:dio/dio.dart';
import 'package:process_run/shell.dart';
import 'package:crypto/crypto.dart';

import '../user_settings.dart';

class RunPy {
  RunPy._private() {
    _dio = Dio(BaseOptions(
      baseUrl: Constants.apiUrl,
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 10),
      validateStatus: (status) => status! <= 500,
    ));
    _runningStateController = StreamController<bool>.broadcast();
  }

  static final RunPy _instance = RunPy._private();
  static RunPy get instance => _instance;
  late final Dio _dio;
  late final StreamController<bool> _runningStateController;
  Stream<bool> get runningState => _runningStateController.stream;

  Shell _currentShell = HelperUtils.shell;
  ShellLinesController? _currentController;

  String? _currentRunFile;
  String? get currentRunFile => _currentRunFile;

  Future<Directory> _getPythonScriptsFolder() async {
    final appdataDir = await getApplicationSupportDirectory();
    final aiAutoFreeDir =
        Directory(path.join(appdataDir.path, Platform.localHostname));
    if (!aiAutoFreeDir.existsSync()) {
      aiAutoFreeDir.createSync();
    }
    return aiAutoFreeDir;
  }

  /// Dosyanın SHA-256 hash'ini hesaplar
  String _calculateFileHash(List<int> fileContent) {
    final digest = sha256.convert(fileContent);
    return digest.toString();
  }

  /// API'dan dosya hash'ini alır
  Future<String> _getFileHash(String fileName) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/hash/$fileName');
      if (response.statusCode == 200 && response.data != null) {
        return response.data!['hash'] as String;
      }
      throw Exception('Hash: ${response.statusCode}');
    } catch (e) {
      throw Exception('Hash: $e');
    }
  }

  ServicesModel? _services;
  ServicesModel? get services => _services;
  List<NotificationModel> get notifications {
    final notifications = _services?.notifications.reversed.toList() ?? [];
    return notifications
        .where((e) => !UserSettings.getReadNotifications().contains(e.id))
        .toList();
  }

  bool _isServicesLoaded = false;
  String? _servicesError;
  String? get servicesError => _servicesError;
  bool get isServicesLoaded => _isServicesLoaded;

  /// API'dan özellikleri alır
  Future<void> getFeatures() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/services');
      if (response.statusCode == 200 && response.data != null) {
        log(response.data.toString());
        _services = ServicesModel.fromJson(response.data!);
        _isServicesLoaded = true;
        return;
      }
      _isServicesLoaded = false;
      _servicesError = "ERR API: Status Code: ${response.statusCode}";
    } catch (e, stackTrace) {
      _isServicesLoaded = false;
      _servicesError = "ERR API: $e";
      log("API Hata Detayı: $e");
      log("Hata Yığını: $stackTrace");
      debugPrint("API Servis Yükleme Hatası: $e\n$stackTrace");
    }
  }

  /// API'dan dosyayı indirir
  Future<List<int>> _downloadFile(String hash) async {
    try {
      final response = await _dio.get<List<int>>(
        '/file/$hash',
        options: Options(responseType: ResponseType.bytes),
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data!;
      }
      log(response.data.toString());
      throw Exception('Py: ${response.statusCode}');
    } catch (e) {
      throw Exception('Py: $e');
    }
  }

  /// API'dan Python dosyasını indirir ve temp klasörüne yazar
  Future<String> writePythonFile(String fileName) async {
    try {
      final aiAutoFreeDir = await _getPythonScriptsFolder();
      final filePath = path.join(aiAutoFreeDir.path, fileName);
      final file = File(filePath);

      // Dosya hash'ini al
      final apiHash = await _getFileHash(fileName);

      // Dosya daha önce indirilmiş mi kontrol et
      if (file.existsSync()) {
        // Dosya varsa hash kontrolü yap
        final fileContent = await file.readAsBytes();
        final currentHash = _calculateFileHash(fileContent);

        // Hash'ler eşleşiyorsa mevcut dosyayı kullan
        if (currentHash == apiHash) {
          return filePath;
        }
      }

      // Dosya yoksa veya hash'ler eşleşmiyorsa yeni dosyayı indir
      final fileContent = await _downloadFile(apiHash);

      // Dosyayı yaz
      await file.writeAsBytes(fileContent);
      log("File: $fileName");

      return filePath;
    } catch (e) {
      throw Exception('Py Write: $e');
    }
  }

  /// Zip dosyasını temp/ai-auto-free klasörüne çıkartır
  Future<String> extractZipFile(String assetPath) async {
    try {
      final aiAutoFreeDir = await _getPythonScriptsFolder();

      final zipData = await rootBundle.load(assetPath);
      final archive = ZipDecoder().decodeBytes(zipData.buffer.asUint8List());

      for (final file in archive) {
        final filename = file.name;
        if (file.isFile) {
          final data = file.content as List<int>;
          File(path.join(aiAutoFreeDir.path, filename))
            ..createSync(recursive: true)
            ..writeAsBytesSync(data);
        }
      }

      return aiAutoFreeDir.path;
    } catch (e) {
      throw Exception('Zip Extract: $e');
    }
  }

  /// Python dosyasını çalıştırır ve çıktıyı döndürür
  Stream<LogModel> runPythonScript(
    String pythonFileName, {
    List<String> arguments = const [],
    VoidCallback? onSuccess,
  }) async* {
    _currentController = ShellLinesController();
    _runningStateController.add(true);
    LogModel? lastYieldedLog;
    bool isCompleted = false;

    try {
      // Seçilen Python yolunu al
      final pythonPath = await PyShell.instance.whichPy();
      if (pythonPath == null) {
        yield LogModel(
          type: LogType.error,
          message:
              "Python yolu bulunamadı. Lütfen Python kurulumunuzu kontrol edin.",
          time: DateTime.now(),
        );
        _runningStateController.add(false);
        return;
      }

      final workingDir =
          await _getPythonScriptsFolder().then((value) => value.path);
      log("Python script çalıştırılıyor: $pythonFileName, yol: $pythonPath, çalışma dizini: $workingDir");

      _currentShell = HelperUtils.shell.cloneWithOptions(ShellOptions(
        workingDirectory: workingDir,
        runInShell: true,
        verbose: false,
        stdout: _currentController!.sink,
        stderr: _currentController!.sink,
      ));

      final List<String> fullCommand = [pythonFileName, ...arguments];

      // Process'i başlat ve tamamlanmasını bekle
      final future = _currentShell.run('$pythonPath ${fullCommand.join(" ")}');

      // Process'in tamamlanmasını arka planda dinle
      unawaited(future.then((value) {
        isCompleted = true;
        _runningStateController.add(false);
        if (value.first.exitCode == 0) {
          if (onSuccess != null) {
            onSuccess();
          }
        }
      }).catchError((e) {
        isCompleted = true;
        stopPythonScript();
      }));

      await for (final line in _currentController!.stream) {
        // Boş satırları atla
        if (line.trim().isEmpty) continue;

        try {
          final json = jsonDecode(line);
          final model = LogModel.fromJson(json);

          // Durumu güncelle
          if (isCompleted ||
              model.type == LogType.error ||
              model.type == LogType.success) {
            _runningStateController.add(false);
          }

          // Aynı mesajı tekrar yield etmeyi önle
          if (lastYieldedLog != null &&
              lastYieldedLog.message == model.message &&
              lastYieldedLog.type == model.type) {
            continue;
          }

          lastYieldedLog = model;
          yield model;
        } catch (e) {
          log("JSON parse error: $e");

          final model =
              LogModel(message: line, type: LogType.info, time: DateTime.now());

          if (lastYieldedLog?.message == model.message) {
            continue;
          }

          lastYieldedLog = model;
          yield model;
        }
      }
      _currentRunFile = pythonFileName;
    } catch (e) {
      log("Stream error: $e");
      stopPythonScript();
      throw Exception('Python Run: $e');
    }
  }

  /// Çalışan Python scriptini durdurur
  Future<void> stopPythonScript() async {
    try {
      _runningStateController.add(false);
      _currentShell.kill();
      _currentShell = HelperUtils.shell;

      if (_currentController != null) {
        _currentController!.close();
        _currentController = null;
      }
    } catch (e) {
      throw Exception('Python Stop: $e');
    }
  }

  Future<Process> runDetachedProcess(
    String command, {
    List<String> arguments = const [],
  }) async {
    // Detached process'i başlat
    final process = await Process.start(
      command,
      arguments,
      runInShell: true,
      workingDirectory:
          await _getPythonScriptsFolder().then((value) => value.path),
      includeParentEnvironment: true,
      mode: ProcessStartMode.detachedWithStdio,
    );

    // Process'i ana uygulamadan bağımsız hale getir
    await process.stdin.close();
    process.stdout.listen((_) {});
    process.stderr.listen((_) {});

    return process;
  }

  /// Servisi temizle
  void dispose() {
    _runningStateController.close();
  }
}
