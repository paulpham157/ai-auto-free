import 'dart:io';

import 'package:process_run/process_run.dart' as s;

class PyShell {
  PyShell._private();

  static final PyShell _instance = PyShell._private();

  static PyShell get instance => _instance;

  List<String> get _pythonCommands =>
      Platform.isWindows ? ['python', 'python3'] : ['python3', 'python'];

  String get _pipCommand => Platform.isWindows ? 'pip' : 'pip3';

  final s.Shell shell = s.Shell(
      environment: Platform.environment, includeParentEnvironment: true);

  Future<String?> whichPy() async {
    for (final command in _pythonCommands) {
      String? path = await s.which(command);
      if (path == null) continue;
      return path;
    }
    return null;
  }

  Future<String?> whichPip() async {
    try {
      return await s.which(_pipCommand);
    } catch (e) {
      return null;
    }
  }

  Future<List<ProcessResult>> run(String command) async => shell.run(command);

  Future<List<ProcessResult>> installPip() async {
    final pythonPath = await whichPy();
    return run("$pythonPath -m ensurepip --upgrade");
  }

  Future<List<ProcessResult>> installWindows(String installerPath) async {
    return run(
      "$installerPath /quiet InstallAllUsers=0 PrependPath=1 Include_test=0 Include_pip=1",
    );
  }

  Future<List<ProcessResult>> installMacOS(String installerPath) async {
    return run(
      'sudo installer -pkg $installerPath -target /',
    );
  }

  Future<List<ProcessResult>> installLinux() async {
    return run(
      'sudo apt-get install -y python3',
    );
  }

  Future<bool> checkDependency(String dependency) async {
    try {
      final path = await whichPip();
      if (path == null) return false;
      await run("$path show $dependency");
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<List<ProcessResult>> installDependency(String dependency) async {
    final path = await whichPip();
    if (path == null) return [];
    return run("$path install $dependency");
  }
}
