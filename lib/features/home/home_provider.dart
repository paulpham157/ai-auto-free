import 'dart:developer';

import 'package:ai_auto_free/common/base_provider.dart';
import 'package:ai_auto_free/common/constants.dart';
import 'package:ai_auto_free/common/l10n_dyanmic.dart';
import 'package:ai_auto_free/models/account_model.dart';
import 'package:ai_auto_free/models/log_model.dart';
import 'package:ai_auto_free/models/services_model.dart';
import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:ai_auto_free/services/python/run/run_py.dart';
import 'package:ai_auto_free/services/user_settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'widgets/account_info.dart';

class HomeProvider extends BaseProvider {
  AccountModel? _selectedAccount;
  final List<LogModel> _consoleMessage = [];
  bool _consoleMinimized = true;
  final ScrollController scrollController = ScrollController();
  bool _isRunning = false;
  List<AccountModel> _accounts = [];

  AccountModel? get selectedAccount => _selectedAccount;
  List<LogModel> get consoleMessage => _consoleMessage;
  bool get consoleMinimized => _consoleMinimized;
  bool get isRunning => _isRunning;
  List<AccountModel> get accounts => _accounts;

  void setIsRunning(bool value) {
    _isRunning = value;
    notifyListeners();
  }

  HomeProvider() {
    RunPy.instance.runningState.listen(setIsRunning);
    initAccounts();
  }

  String? updateAvailable() {
    final version = RunPy.instance.services?.about.versionCode;
    final currentVersion = Constants.versionCode;
    if (version != null && version > currentVersion) {
      return RunPy.instance.services?.about.version;
    }
    return null;
  }

  void update() async {
    HelperUtils.launchURL(RunPy.instance.services?.about.repo);
  }

  void selectAccount(BuildContext context, AccountModel? account) async {
    _selectedAccount = account;
    if (account != null) {
      // Bottom sheet'i göster
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        useSafeArea: true,
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width,
        ),
        builder: (context) => AccountInfo(
          account: account,
          onClose: () {
            Navigator.pop(context);
            selectAccount(context, null);
          },
          onSwitchAccount: () {
            Navigator.pop(context);
            selectAccount(context, null);
            _switchCursorAccount(account);
          },
        ),
      );
    }
    notifyListeners();
  }

  void removeAccount(AccountModel account) async {
    _accounts = await UserSettings.removeAccount(account);
    notifyListeners();
  }

  void setConsoleMinimized(bool value) {
    _consoleMinimized = value;

    if (!value) _selectedAccount = null;
    notifyListeners();
  }

  void _addConsoleMessage(LogModel message) async {
    _selectedAccount = null;
    _consoleMessage.add(message);
    setConsoleMinimized(false);

    // scroll bottom
    if (scrollController.hasClients) {
      await Future.delayed(const Duration(milliseconds: 300));
      scrollController.animateTo(
        scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void clearConsoleMessage() {
    _consoleMessage.clear();
    setConsoleMinimized(true);
  }

  void onClickStop() {
    RunPy.instance.stopPythonScript();
  }

  Future<void> initAccounts() async {
    _accounts = await UserSettings.getAccounts();
    notifyListeners();
  }

  void onClickFeature(FeatureModel feature) async {
    clearConsoleMessage();
    if (feature.name.toLowerCase() == "cursor") {
      await HelperUtils.killCursorProcesses();
    }
    RunPy.instance
        .runPythonScript(feature.fileName,
            arguments: HelperUtils.getMailScriptArguments())
        .listen((data) {
      data.translatedMessage = l10nDynamic[data.message];
      log(data.translatedMessage ?? data.message);
      final logDatas = data.logDatas;
      if (logDatas != null &&
          (logDatas.any((e) => e.dataKey == "email") &&
              logDatas.any((e) => e.dataKey == "password"))) {
        data.type = LogType.success;
        final account = AccountModel.fromLogDatas(logDatas, name: feature.name);
        UserSettings.addAccount(account).then((_) => initAccounts());
      }
      _addConsoleMessage(data);
    });
  }

  void copyConsoleMessages() {
    final message = _consoleMessage
        .map((e) => "${e.translatedMessage ?? e.message} [${e.logData}]")
        .join("\n");
    Clipboard.setData(ClipboardData(text: message));
  }

  void onClickAddon(FeatureModel feature) async {
    if (feature.addon == null) return;

    if (feature.name.toLowerCase() == "cursor") {
      await HelperUtils.killCursorProcesses();
    }

    clearConsoleMessage();
    RunPy.instance
        .runPythonScript(feature.addon!.fileName,
            arguments: feature.addon!.arguments)
        .listen((data) {
      _addConsoleMessage(data);
    });
  }

  void _switchCursorAccount(AccountModel account) async {
    _selectedAccount = null;
    clearConsoleMessage();
    await HelperUtils.killCursorProcesses();

    final token = HelperUtils.parseCursorToken(account.token);
    RunPy.instance.runPythonScript("cursor_db_manager.py", arguments: [
      "--email=${account.email}",
      "--access-token=$token",
      "--refresh-token=$token"
    ]).listen((data) {
      _addConsoleMessage(data);
    });
  }
}
