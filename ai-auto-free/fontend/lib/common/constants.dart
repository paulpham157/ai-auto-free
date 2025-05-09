final class Constants {
  static const String name = "AI Auto Free";
  static const String apiUrl = "http://localhost:3000/api";
  static const String baseUrl = "http://localhost:3000";
  static const bool killProcessInDebugMode = true;

  // Images
  static const String cursorPng = "assets/cursor.png";
  static const String windsurfPng = "assets/windsurf.png";
  static const String windsurfToken1Png = "assets/windsurf_token_1.png";
  static const String windsurfToken2Png = "assets/windsurf_token_2.png";

  static const List<String> dependencies = [
    "DrissionPage",
    "bs4",
    "requests",
  ];
  
  // tr, en, ru for test
  static const String languageCode = "";
}
