import 'dart:developer';
import 'dart:io';

import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:process_run/process_run.dart';

class PyShell {
  PyShell._private();

  static final PyShell _instance = PyShell._private();

  static PyShell get instance => _instance;

  // Kullanılacak Python yolunu tutan değişken
  String? _selectedPythonPath;
  String? get selectedPythonPath => _selectedPythonPath;

  /// Kullanılacak Python yolunu belirler ve kaydeder
  Future<String?> whichPy() => _getPythonPath();
  Future<String?> _getPythonPath({bool forceRefresh = false}) async {
    // Eğer daha önce Python yolu belirlendiyse ve zorunlu yenileme istenmiyorsa
    if (_selectedPythonPath != null && !forceRefresh) {
      return _selectedPythonPath;
    }

    try {
      // Windows'ta tüm Python kurulumlarını bul
      final result = await HelperUtils.shell.run("where python");
      if (result.first.exitCode == 0) {
        final pythonPaths = result.first.stdout
            .toString()
            .split('\n')
            .where((path) => path.trim().isNotEmpty)
            .toList();

        if (pythonPaths.isEmpty) {
          log('Sistemde Python bulunamadı');
          return null;
        }

        log('Bulunan Python yolları: $pythonPaths');

        // Microsoft Store Python'u tespit etmek için
        final storePathIndex = pythonPaths.indexWhere((path) =>
            path.toLowerCase().contains('windowsapps') ||
            path.toLowerCase().contains('microsoft.pythoncore'));

        if (storePathIndex >= 0) {
          // Microsoft Store Python'dan kaçınmak için listenin başına koyalım
          final storePath = pythonPaths.removeAt(storePathIndex);
          pythonPaths.add(storePath); // En sona ekle (en düşük öncelik)
          log('Microsoft Store Python tespit edildi ve en düşük önceliğe alındı: $storePath');
        }

        // İlk Python sürümünü (Microsoft Store olmayan) seç
        _selectedPythonPath = pythonPaths.first.trim();
        log('Seçilen Python yolu: $_selectedPythonPath');

        // Bu Python'un versiyon bilgisini kontrol et
        final versionResult = await run('$_selectedPythonPath --version');
        if (versionResult.first.exitCode == 0) {
          log('Seçilen Python sürümü: ${versionResult.first.stdout}');
        }

        return _selectedPythonPath;
      }
      return null;
    } catch (e) {
      log('Python yolu belirleme hatası: ${e.toString()}');
      return null;
    }
  }

  Future<bool> whichPip() async {
    try {
      final pythonPath = await _getPythonPath();
      if (pythonPath == null) {
        return false;
      }

      // Python üzerinden pip kontrolü
      final result = await run('$pythonPath -m pip --version');
      return result.first.exitCode == 0;
    } catch (e) {
      log('Pip kontrolü hatası: ${e.toString()}');
      return false;
    }
  }

  Future<List<ProcessResult>> run(String command) async {
    final pythonPath = await _getPythonPath();
    if (pythonPath != null && command.startsWith("python ")) {
      // "python" komutunu seçilen Python yolu ile değiştir
      command = command.replaceFirst("python", pythonPath);
      log('Komut şu Python ile çalıştırılıyor: $pythonPath');
    }
    return HelperUtils.shell.run(command);
  }

  Future<List<ProcessResult>> installPip() async {
    final pythonPath = await _getPythonPath();
    if (pythonPath == null) {
      throw Exception('Python yolu bulunamadı, pip kurulamıyor');
    }
    return run("$pythonPath -m ensurepip --upgrade");
  }

  Future<List<ProcessResult>> installWindows(String installerPath) => run(
        "$installerPath /quiet InstallAllUsers=0 PrependPath=1 Include_test=0 Include_pip=1",
      );

  /// Python kurulumu sonrası PATH'in güncellenip güncellenmediğini kontrol eder
  Future<bool> isPythonInPath() async {
    try {
      // Seçilen Python yolunu al
      final pythonPath = await _getPythonPath();
      if (pythonPath == null) {
        return false;
      }

      // Path kontrolü: seçilen Python yolu PATH'de mi?
      final path = Platform.environment['PATH'] ?? '';
      final directory = pythonPath.substring(0, pythonPath.lastIndexOf('\\'));

      if (path.toLowerCase().contains(directory.toLowerCase())) {
        return true;
      }

      // Mevcut Python yolu PATH'de değilse, environment güncelleyelim
      log('Python PATH\'te bulunamadı, PATH\'e ekleniyor: $directory');

      // Yeni bir environment map'i oluştur ve PATH'i güncelle
      final updatedEnv = Map<String, String>.from(Platform.environment);
      updatedEnv['PATH'] = '$directory;$directory\\Scripts;$path';

      // Yeni bir shell oluştur ve güncellenmiş çevreyi kullan
      final shell = Shell(
        environment: updatedEnv,
        includeParentEnvironment: true,
        runInShell: true,
      );

      // Test amaçlı Python'u çalıştır
      final testResult = await shell.run('$pythonPath --version');
      if (testResult.first.exitCode == 0) {
        log('Python PATH\'e eklendi ve çalışıyor: ${testResult.first.stdout}');
        HelperUtils.updateShellEnvironment(updatedEnv);
        return true;
      }

      return false;
    } catch (e) {
      log('PATH kontrolü hatası: ${e.toString()}');
      return false;
    }
  }

  Future<bool> checkDependency(String dependency) async {
    try {
      final pythonPath = await _getPythonPath();
      if (pythonPath == null) {
        log('Python yolu bulunamadı, bağımlılık kontrolü yapılamıyor: $dependency');
        return false;
      }

      if (!await whichPip()) {
        log('Pip kurulu değil, bağımlılık kontrolü yapılamıyor: $dependency');
        return false;
      }

      final results = await run("$pythonPath -m pip show $dependency");
      return results.first.exitCode == 0;
    } catch (e) {
      log('Bağımlılık kontrolü hatası: ${e.toString()}');
      return false;
    }
  }

  Future<List<ProcessResult>> installDependency(String dependency) async {
    try {
      final pythonPath = await _getPythonPath();
      if (pythonPath == null) {
        throw Exception('Python yolu bulunamadı, bağımlılık kurulamıyor');
      }

      if (!await whichPip()) {
        // Pip kurulu değilse önce pip'i kur
        log('Pip kurulu değil, önce pip kuruluyor...');
        final pipResult = await installPip();
        if (pipResult.first.exitCode != 0) {
          throw Exception('Pip kurulumu başarısız oldu');
        }
      }

      log('$dependency kuruluyor...');
      return await run("$pythonPath -m pip install $dependency");
    } catch (e) {
      log('Bağımlılık kurulumu hatası: ${e.toString()}');
      rethrow;
    }
  }
}
