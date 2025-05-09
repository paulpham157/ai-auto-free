import 'dart:io';

import 'package:ai_auto_free/common/base_provider.dart';
import 'package:ai_auto_free/common/l10n_dyanmic.dart';
import 'package:ai_auto_free/models/account_model.dart';
import 'package:ai_auto_free/models/log_model.dart';
import 'package:ai_auto_free/models/services_model.dart';
import 'package:ai_auto_free/services/account_service.dart';
import 'package:ai_auto_free/services/auth_service.dart';
import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:ai_auto_free/services/python/run_py.dart';
import 'package:ai_auto_free/services/user_settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'widgets/account_info.dart';
import 'widgets/token_guide_dialog.dart';

class HomeProvider extends BaseProvider {
  AccountModel? _selectedAccount;
  final List<LogModel> _consoleMessage = [];
  bool _consoleMinimized = true;
  final ScrollController scrollController = ScrollController();
  bool _isRunning = false;
  List<AccountModel> _accounts = [];
  int _remainingCredits = 0;
  int get remainingCredits => _remainingCredits;

  AccountModel? get selectedAccount => _selectedAccount;
  List<LogModel> get consoleMessage => _consoleMessage;
  bool get consoleMinimized => _consoleMinimized;
  bool get isRunning => _isRunning;
  List<AccountModel> get accounts => _accounts;

  bool _changeCreditButtonColor = false;
  bool get changeCreditButtonColor => _changeCreditButtonColor;

  void setIsRunning(bool value) {
    _isRunning = value;
    notifyListeners();
  }

  HomeProvider() {
    RunPy.instance.runningState.listen(setIsRunning);
    getAccounts();
    _setupUserInfoListener();
    _updateCreditButtonColor();
    _getRemainingCredits();
  }

  void _setupUserInfoListener() {
    if (SecureAuthStorage.instance.userInfo == null) {
      Future.delayed(const Duration(seconds: 1), () {
        _setupUserInfoListener();
      });
      return;
    }

    SecureAuthStorage.instance.userInfo
        ?.removeListener(_updateCreditButtonColor);

    SecureAuthStorage.instance.userInfo?.addListener(() {
      _updateCreditButtonColor();
      _getRemainingCredits();
    });
  }

  void _updateCreditButtonColor() {
    final credits = SecureAuthStorage.instance.userInfo?.credits ?? 0;
    _changeCreditButtonColor = credits <= 0;
    notifyListeners();
  }

  @override
  void dispose() {
    SecureAuthStorage.instance.userInfo
        ?.removeListener(_updateCreditButtonColor);
    super.dispose();
  }

  void _getRemainingCredits() {
    _remainingCredits = SecureAuthStorage.instance.userInfo?.credits ?? 0;
    if (_remainingCredits <= 0) {
      _changeCreditButtonColor = true;
    } else {
      _changeCreditButtonColor = false;
    }
    notifyListeners();
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
            _switchCursorAccount(account, context);
          },
          onTestAccount: () {
            Navigator.pop(context);
            selectAccount(context, null);
            _testCursorAccount(account);
          },
          onUsageUpdated: () {
            // Kullanım bilgisi güncellendiğinde hesap listesini güncelle
            getAccounts();
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

  /// Hesapların sırasını değiştirir
  void reorderAccounts(int oldIndex, int newIndex) async {
    if (oldIndex < newIndex) {
      newIndex -= 1;
    }

    // Ters çevrilmiş listeden doğru indeksleri hesapla
    final actualOldIndex = _accounts.length - 1 - oldIndex;
    final actualNewIndex = _accounts.length - 1 - newIndex;

    // Asıl listede sıralamayı değiştir
    final AccountModel item = _accounts.removeAt(actualOldIndex);
    _accounts.insert(actualNewIndex, item);

    // Tüm hesapları temizle ve yeniden ekle
    final currentAccounts = List<AccountModel>.from(_accounts);
    for (final account in currentAccounts) {
      await UserSettings.removeAccount(account);
    }

    for (final account in _accounts) {
      await UserSettings.addAccount(account);
    }

    notifyListeners();
  }

  void setConsoleMinimized(bool value) {
    _consoleMinimized = value;

    if (!value) _selectedAccount = null;
    notifyListeners();
  }

  void _addConsoleMessage(LogModel logModel) async {
    logModel.translatedMessage = l10nDynamic[logModel.message];
    _selectedAccount = null;
    _consoleMessage.add(logModel);
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

  Future<void> getAccounts() async {
    _accounts = await UserSettings.getAccounts();
    notifyListeners();
  }

  void onClickFeature(FeatureModel feature) async {
    clearConsoleMessage();

    AccountService.instance.processAccount(feature, onLog: _addConsoleMessage,
        onSuccess: (account) async {
      await UserSettings.addAccount(account).then((_) => getAccounts());
      _getRemainingCredits();
      _updateCreditButtonColor();
      notifyListeners();
    });
  }

  void copyConsoleMessages() {
    final message = _consoleMessage
        .map((e) =>
            "${e.translatedMessage ?? e.message} ${e.logData.isEmpty ? "" : "[${e.logData}]"}")
        .join("\n");
    Clipboard.setData(ClipboardData(text: message));
  }

  void onClickAddon(FeatureModel feature) async {
    clearConsoleMessage();

    if (feature.addon == null) return;

    if (feature.name.toLowerCase() == "cursor") {
      await HelperUtils.killCursorProcesses();
    }

    RunPy.instance.runPythonScript(feature.addon!.fileName,
        arguments: feature.addon!.arguments, onSuccess: () {
      _getRemainingCredits();
      _updateCreditButtonColor();
      notifyListeners();
    }).listen((data) async {
      _addConsoleMessage(data);
      final List<LogModelData>? logDatas = data.logDatas;
      await AccountService.instance.parseAccountFromlogs(
          logDatas, feature.addon!.nameKey, onLog: _addConsoleMessage,
          onSuccess: (account) async {
        await UserSettings.addAccount(account).then((_) => getAccounts());
        data.type = LogType.success;
        _getRemainingCredits();
        _updateCreditButtonColor();
        notifyListeners();
      });
    });
  }

  void _switchCursorAccount(
      AccountModel account, BuildContext? contextParam) async {
    _selectedAccount = null;
    if (account.type == AccountType.windsurf) {
      if (contextParam != null) {
        showDialog(
          context: contextParam,
          barrierDismissible: false,
          builder: (BuildContext context) {
            return TokenGuideDialog(
              token: account.token ?? account.cookieToken ?? "",
            );
          },
        );
      }
    } else {
      clearConsoleMessage();

      RunPy.instance.runPythonScript("script.py", arguments: [
        "auto_login_browser",
        "--token=${account.cookieToken}",
        "--lang=${Platform.localeName.split('_')[0]}"
      ]).listen(_addConsoleMessage);
    }
  }

  void _testCursorAccount(AccountModel account) async {
    clearConsoleMessage();
    RunPy.instance.runPythonScript("script.py", arguments: [
      "test_cursor_account",
      "--token=${account.token}"
    ]).listen(_addConsoleMessage);
  }

  void refreshCredits() {
    _getRemainingCredits();
    notifyListeners();
  }
}
