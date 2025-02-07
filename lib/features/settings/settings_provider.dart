import 'package:ai_auto_free/models/services_model.dart';
import 'package:ai_auto_free/services/python/run/run_py.dart';
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

  AboutModel? get about => RunPy.instance.services?.about;

  SettingsProvider() {
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
}
