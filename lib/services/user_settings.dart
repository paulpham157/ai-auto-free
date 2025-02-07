import 'package:ai_auto_free/models/account_model.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../features/settings/settings_provider.dart';
import 'dart:convert';

class UserSettings {
  static const String _keyBrowserVisibility = 'browserVisibility';
  static const String _keyEmailValidatorType = 'emailValidatorType';
  static const String _keyImapServer = 'imapServer';
  static const String _keyImapUser = 'imapUser';
  static const String _keyImapPassword = 'imapPassword';
  static const String _keyImapPort = 'imapPort';
  static const String _keyAccounts = 'accounts';

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
    return value != null
        ? EmailValidatorType.values.firstWhere((e) => e.name == value)
        : EmailValidatorType.tempMail;
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
    final accounts = await getAccounts();
    if (accounts.any((e) => e.email == account.email)) {
      return;
    }
    accounts.add(account);
    _setAccounts(accounts);
  }

  static Future<List<AccountModel>> removeAccount(AccountModel account) async {
    final accounts = await getAccounts();
    accounts.removeWhere((e) => e.email == account.email);
    _setAccounts(accounts);
    return accounts;
  }
}
