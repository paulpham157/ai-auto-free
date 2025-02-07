import 'dart:async';
import 'dart:convert';
import 'dart:developer';
import 'dart:io';
import 'package:ai_auto_free/common/constants.dart';
import 'package:ai_auto_free/models/services_model.dart';
import 'package:ai_auto_free/models/log_model.dart';
import 'package:archive/archive.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';
import 'package:dio/dio.dart';
import 'package:process_run/shell.dart';
import 'package:crypto/crypto.dart';

class RunPy {
  RunPy._private() {
    _dio = Dio(BaseOptions(
      baseUrl: Constants.apiUrl,
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 10),
    ));
    _runningStateController = StreamController<bool>.broadcast();
  }

  static final RunPy _instance = RunPy._private();
  static RunPy get instance => _instance;
  late final Dio _dio;
  late final StreamController<bool> _runningStateController;
  Stream<bool> get runningState => _runningStateController.stream;

  Shell? _currentShell;
  ShellLinesController? _currentController;

  String? _currentRunFile;
  String? get currentRunFile => _currentRunFile;

  Future<Directory> _getTempFolder() async {
    final tempDir = await getTemporaryDirectory();
    final aiAutoFreeDir = Directory(path.join(tempDir.path, 'ai-auto-free'));
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

  /// API'dan özellikleri alır
  Future<void> getFeatures() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/services');
      if (response.statusCode == 200 && response.data != null) {
        log(response.data.toString());
        _services = ServicesModel.fromJson(response.data!);
      }
    } catch (e) {
      debugPrint(e.toString());
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
      throw Exception('Py: ${response.statusCode}');
    } catch (e) {
      throw Exception('Py: $e');
    }
  }

  /// API'dan Python dosyasını indirir ve temp klasörüne yazar
  Future<String> writePythonFile(String fileName) async {
    try {
      final aiAutoFreeDir = await _getTempFolder();
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
      final aiAutoFreeDir = await _getTempFolder();

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
  Stream<LogModel> runPythonScript(String pythonFileName,
      {List<String> arguments = const []}) async* {
    _currentController = ShellLinesController();
    _runningStateController.add(true);
    LogModel? lastYieldedLog;

    try {
      _currentShell = Shell(
        environment: Platform.environment,
        includeParentEnvironment: true,
        runInShell: true,
        verbose: false,
        stdout: _currentController!.sink,
        stderr: _currentController!.sink,
      );

      final pythonCommand = Platform.isWindows ? 'python' : 'python3';
      final pythonFilePath = path.join(
          await _getTempFolder().then((value) => value.path), pythonFileName);
      final List<String> fullCommand = [pythonFilePath, ...arguments];

      unawaited(_currentShell!.run('$pythonCommand ${fullCommand.join(" ")}'));

      await for (final line in _currentController!.stream) {
        if (line.trim().isEmpty) continue;

        try {
          final json = jsonDecode(line);
          final model = LogModel.fromJson(json);

          // Önceki log ile aynı mesaj ve tip ise atla
          if (lastYieldedLog != null &&
              lastYieldedLog.message == model.message &&
              lastYieldedLog.type == model.type) {
            continue;
          }

          if (model.type == LogType.error || model.type == LogType.success) {
            _runningStateController.add(false);
          }
          lastYieldedLog = model;
          yield model;
        } catch (e) {
          final model =
              LogModel(message: line, type: LogType.info, time: DateTime.now());

          // Parse hatası için de aynı kontrolü yap
          if (lastYieldedLog?.message == model.message) {
            continue;
          }

          log("Parse error: $e");
          lastYieldedLog = model;
          yield model;
        }
      }
      _currentRunFile = pythonFileName;
    } catch (e) {
      _runningStateController.add(false);
      throw Exception('Python Run: $e');
    }
  }

  /// Çalışan Python scriptini durdurur
  Future<void> stopPythonScript() async {
    try {
      if (_currentShell != null) {
        _currentShell!.kill();
        _currentShell = null;
      }

      if (_currentController != null) {
        _currentController!.close();
        _currentController = null;
      }

      _runningStateController.add(false); // Script durduğunda false gönder
    } catch (e) {
      throw Exception('Python Stop: $e');
    }
  }

  /// Servisi temizle
  void dispose() {
    _runningStateController.close();
  }
}
