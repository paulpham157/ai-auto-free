import 'package:flutter/material.dart';
import '../../services/user_settings.dart';

enum EmailValidatorType {
  tempMail,
  imap,
}

class SettingsProvider extends ChangeNotifier {
  bool _browserVisibility = true;
  EmailValidatorType _emailValidatorType = EmailValidatorType.tempMail;

  final TextEditingController imapServerController = TextEditingController();
  final TextEditingController imapUserController = TextEditingController();
  final TextEditingController imapPasswordController = TextEditingController();
  final TextEditingController imapPortController = TextEditingController();
  final TextEditingController newEmailController = TextEditingController();

  final List<String> _imapRedirectedMails = [];

  List<String> get imapRedirectedMails => _imapRedirectedMails;

  SettingsProvider() {
    _imapRedirectedMails.addAll(UserSettings.getImapRedirectedMails());
    // Load saved settings when provider is created
    UserSettings.loadSettings(this);
  }

  bool get browserVisibility => _browserVisibility;
  EmailValidatorType get emailValidatorType => _emailValidatorType;

  void setBrowserVisibility(bool value) {
    _browserVisibility = value;
    UserSettings.setBrowserVisibility(value);
    notifyListeners();
  }

  void setEmailValidatorType(EmailValidatorType type) {
    _emailValidatorType = type;
    UserSettings.setEmailValidatorType(type);
    notifyListeners();
  }

  void saveAll() async {
    await UserSettings.saveSettings(this);
  }

  void addImapRedirectedMail(String email) {
    _imapRedirectedMails.add(email);
    UserSettings.addImapRedirectedMail(email);
    notifyListeners();
  }

  void removeImapRedirectedMail(String email) {
    _imapRedirectedMails.remove(email);
    UserSettings.removeImapRedirectedMail(email);
    notifyListeners();
  }
}
