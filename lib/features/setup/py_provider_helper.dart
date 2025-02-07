import 'package:ai_auto_free/common/base_provider.dart';

class PyProviderHelper extends BaseProvider {
  bool _checking = true;
  String _checkingMessage = "";
  bool get checking => _checking;
  String get checkingMessage => _checkingMessage;

  void setChecking(bool value, {String? message}) {
    if (message != null) _checkingMessage = message;
    _checking = value;
    notifyListeners();
  }
}
