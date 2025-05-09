import 'package:ai_auto_free/models/account_model.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../features/settings/settings_provider.dart';
import 'dart:convert';
import '../models/gift_code_model.dart';

class UserSettings {
  static const String _keyBrowserVisibility = 'browserVisibility';
  static const String _keyEmailValidatorType = 'emailValidatorType';
  static const String _keyImapServer = 'imapServer';
  static const String _keyImapUser = 'imapUser';
  static const String _keyImapPassword = 'imapPassword';
  static const String _keyImapPort = 'imapPort';
  static const String _keyAccounts = 'accounts';
  static const String _keyImapRedirectedMails = 'imapRedirectedMails';
  static const String _keyReadNotifications = 'readNotifications';
  static const String _keyGiftCodes = 'giftCodes';

  static late SharedPreferences _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    //await reset();
  }

  static Future<void> reset() async {
    await _prefs.clear();
  }

  // Browser Visibility
  static Future<void> setBrowserVisibility(bool value) async {
    await _prefs.setBool(_keyBrowserVisibility, value);
  }

  static bool getBrowserVisibility() {
    return _prefs.getBool(_keyBrowserVisibility) ?? false;
  }

  static String getBrowserVisibilityArgument() {
    return getBrowserVisibility() ? "--visible" : "";
  }

  // Email Validator Type
  static Future<void> setEmailValidatorType(EmailValidatorType type) async {
    await _prefs.setString(_keyEmailValidatorType, type.name);
  }

  static EmailValidatorType getEmailValidatorType() {
    String? value = _prefs.getString(_keyEmailValidatorType);
    final result = value != null
        ? EmailValidatorType.values.firstWhere((e) => e.name == value)
        : EmailValidatorType.tempMail;
    if (result == EmailValidatorType.imap) {
      // Değerler var mı kontrol et
      final imapServer = getImapServer();
      final imapUser = getImapUser();
      final imapPassword = getImapPassword();
      final imapPort = getImapPort();
      if (imapServer.isEmpty ||
          imapUser.isEmpty ||
          imapPassword.isEmpty ||
          imapPort.isEmpty) {
        return EmailValidatorType.tempMail;
      }
    }
    return result;
  }

  // IMAP Settings
  static Future<void> setImapServer(String value) async {
    await _prefs.setString(_keyImapServer, value);
  }

  static String getImapServer() {
    return _prefs.getString(_keyImapServer) ?? '';
  }

  static Future<void> setImapUser(String value) async {
    await _prefs.setString(_keyImapUser, value);
  }

  static String getImapUser() {
    return _prefs.getString(_keyImapUser) ?? '';
  }

  static Future<void> setImapPassword(String value) async {
    await _prefs.setString(_keyImapPassword, value);
  }

  static String getImapPassword() {
    return _prefs.getString(_keyImapPassword) ?? '';
  }

  static Future<void> setImapPort(String value) async {
    await _prefs.setString(_keyImapPort, value);
  }

  static String getImapPort() {
    return _prefs.getString(_keyImapPort) ?? '';
  }

  static Future<void> addImapRedirectedMail(String value) async {
    final list = getImapRedirectedMails();
    list.add(value);
    await _prefs.setStringList(_keyImapRedirectedMails, list);
  }

  static Future<void> removeImapRedirectedMail(String value) async {
    final list = getImapRedirectedMails();
    list.remove(value);
    await _prefs.setStringList(_keyImapRedirectedMails, list);
  }

  static Future<void> setImapRedirectedMails(List<String> value) async {
    await _prefs.setStringList(_keyImapRedirectedMails, value);
  }

  static List<String> getImapRedirectedMails() {
    return _prefs.getStringList(_keyImapRedirectedMails) ?? [];
  }

  // Load all settings into provider
  static void loadSettings(SettingsProvider provider) {
    provider.setBrowserVisibility(getBrowserVisibility());
    provider.setEmailValidatorType(getEmailValidatorType());
    provider.imapServerController.text = getImapServer();
    provider.imapUserController.text = getImapUser();
    provider.imapPasswordController.text = getImapPassword();
    provider.imapPortController.text = getImapPort();
  }

  // Save all settings from provider
  static Future<void> saveSettings(SettingsProvider provider) async {
    await setBrowserVisibility(provider.browserVisibility);
    await setEmailValidatorType(provider.emailValidatorType);
    await setImapServer(provider.imapServerController.text);
    await setImapUser(provider.imapUserController.text);
    await setImapPassword(provider.imapPasswordController.text);
    await setImapPort(provider.imapPortController.text);
  }

  static Future<List<String>> getAccountsString() async {
    final accounts = _prefs.getStringList(_keyAccounts) ?? [];
    return accounts;
  }

  static Future<List<AccountModel>> getAccounts() async {
    final accounts = await getAccountsString();
    return accounts.map((e) => AccountModel.fromJsonString(e)).toList();
  }

  static Future<void> _setAccounts(List<AccountModel> accounts) async {
    await _prefs.setStringList(
      _keyAccounts,
      accounts.map((e) => jsonEncode(e.toJson())).toList(),
    );
  }

  static Future<void> addAccount(AccountModel account) async {
    final emailValidatorType = getEmailValidatorType();
    final accounts = await getAccounts();
    if (accounts.any((e) => e.email == account.email)) {
      return;
    }
    accounts.add(account);
    _setAccounts(accounts);

    if (emailValidatorType == EmailValidatorType.imap) {
      await removeImapRedirectedMail(account.email);
    }
  }

  static Future<void> updateAccountUsage(String email, String usageStatus) async {
    final accounts = await getAccounts();
    final accountIndex = accounts.indexWhere((e) => e.email == email);
    if (accountIndex != -1) {
      accounts[accountIndex].lastUsageStatus = usageStatus;
      await _setAccounts(accounts);
    }
  }

  static Future<List<AccountModel>> removeAccount(AccountModel account) async {
    final accounts = await getAccounts();
    accounts.removeWhere((e) => e.email == account.email);
    _setAccounts(accounts);
    return accounts;
  }

  static Set<int> getReadNotifications() {
    final List<String> readIds =
        _prefs.getStringList(_keyReadNotifications) ?? [];
    return readIds.map((e) => int.parse(e)).toSet();
  }

  static Future<void> markNotificationAsRead(List<int> notificationIds) async {
    final readIds = getReadNotifications();
    for (var notificationId in notificationIds) {
      if (!readIds.contains(notificationId)) {
        readIds.add(notificationId);
      }
    }
    await _prefs.setStringList(
      _keyReadNotifications,
      readIds.map((e) => e.toString()).toList(),
    );
  }

  // Güvenlik için işaret ekle
  static Future<void> addSecurityMark(String mark) async {
    await _prefs.setBool(mark, true);
  }

  static bool getSecurityMark(String mark) {
    return _prefs.getBool(mark) ?? false;
  }

  // Gift Code Methods
  static Future<List<String>> getGiftCodesString() async {
    final giftCodes = _prefs.getStringList(_keyGiftCodes) ?? [];
    return giftCodes;
  }

  static Future<List<GiftCodeModel>> getGiftCodes() async {
    final giftCodesString = await getGiftCodesString();
    return giftCodesString.map((e) => GiftCodeModel.fromJsonString(e)).toList();
  }

  static Future<void> addGiftCode(GiftCodeModel giftCode) async {
    final giftCodes = await getGiftCodesString();
    giftCodes.add(giftCode.toJsonString());
    await _prefs.setStringList(_keyGiftCodes, giftCodes);
  }
}
