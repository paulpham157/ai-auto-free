import 'dart:convert';
import 'dart:developer';

import 'package:ai_auto_free/models/device_info_model.dart';
import 'package:ai_auto_free/models/user_info_model.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, TargetPlatform;

import '../common/constants.dart';
import 'helper_utils.dart';
import 'user_settings.dart';

class SecureAuthStorage {
  SecureAuthStorage._private();

  static final SecureAuthStorage _instance = SecureAuthStorage._private();

  static SecureAuthStorage get instance => _instance;

  UserInfoModel? userInfo;

  // Platforma göre depolama nesnesi
  dynamic _storage;

  static const String _tokenKey = 'jwt_token';

  Future<void> init() async {
    if (defaultTargetPlatform == TargetPlatform.macOS) {
      _storage = await SharedPreferences.getInstance();
    } else {
      _storage = const FlutterSecureStorage();
    }
  }

  Future<void> writeToken(String token) async {
    if (_storage is FlutterSecureStorage) {
      await _storage.write(key: _tokenKey, value: token);
    } else if (_storage is SharedPreferences) {
      await _storage.setString(_tokenKey, token);
    }
    // Secure DB'nin silindiğini anlamak için SharedPreferences'e işaret ekle
    await UserSettings.addSecurityMark('l');
  }

  Future<String?> readToken() async {
    if (_storage is FlutterSecureStorage) {
      return await _storage.read(key: _tokenKey);
    } else if (_storage is SharedPreferences) {
      return _storage.getString(_tokenKey);
    }
    return null;
  }
}

class AuthService {
  AuthService._private();

  static final AuthService _instance = AuthService._private();

  AuthService.internal();

  factory AuthService() {
    return _instance;
  }
  final SecureAuthStorage _storage = SecureAuthStorage.instance;

  final _dio = Dio()
    ..options = BaseOptions(
      baseUrl: Constants.apiUrl,
      sendTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      validateStatus: (status) {
        return status != null && status <= 500;
      },
    );

  // Kullanıcının ban durumu
  bool _isBanned = false;
  String _banReason = '';

  // Ban durumunu kontrol et
  bool get isBanned => _isBanned;
  String get banReason => _banReason;

  Future<bool> checkAndLogin() async {
    try {
      // Önce token kontrolü
      final token = await _storage.readToken();

      // Cihaz bilgilerini al
      final deviceInfo = await HelperUtils.getDeviceInfo();

      // Güvenli header'ları oluştur
      final secureHeaders =
          HelperUtils.getSecureHeaders(deviceInfo: deviceInfo);

      // Eğer token varsa, önce kullanıcı bilgilerini alıp ban durumunu kontrol et
      if (token != null) {
        // Mevcut token ile kullanıcı bilgilerini al
        final userInfoResult =
            await getUserInfoFromServer(deviceInfo: deviceInfo);

        // Kullanıcı bilgileri alındıktan sonra ban durumunu kontrol et
        if (_isBanned) return false;

        // Kullanıcı bilgileri başarıyla alındıysa ve banlı değilse
        return userInfoResult;
      }

      // Token yoksa veya geçersizse, yeni bir token almak için auth isteği gönder
      // Tüm cihaz bilgilerini içeren veri
      final Map<String, dynamic> authData = {
        'uniqueId': await HelperUtils.getUserId(),
        'deviceInfo': deviceInfo.toJson(),
      };

      log('Auth isteği verileri: ${jsonEncode(authData)}');

      // AuthData verisini şifrele
      final String encryptedAuthData = HelperUtils.encryptData(authData);

      // JWT token getir
      final response = await _dio.post(
        '/auth',
        data: {'encryptedData': encryptedAuthData},
        options: Options(
          headers: {
            ...secureHeaders,
          },
        ),
      );

      log('Auth response: ${response.data}');

      // Ban durumunu kontrol et
      if (response.statusCode == 403) {
        _isBanned = true;
        _banReason = response.data['message'] ?? 'Hesabınız engellenmiştir.';
        log('Kullanıcı engellendi: $_banReason');
        return false;
      }

      if (response.statusCode == 200) {
        final newToken = response.data['token'];
        final verify = HelperUtils.verifyJwtToken(newToken);
        if (verify.isValid) {
          await _storage.writeToken(newToken);
          log('Geçerli Token: $newToken\nPayload: ${verify.jwt?.payload}');

          // Yeni token ile kullanıcı bilgilerini al
          if (await getUserInfoFromServer(deviceInfo: deviceInfo)) {
            // Kullanıcı bilgileri alındıktan sonra tekrar ban durumunu kontrol et
            if (_isBanned) {
              log('Yeni token alındıktan sonra kullanıcı banlı: $_banReason');
              return false;
            }
            return true;
          }
        }
      }

      return false;
    } catch (e) {
      log('Giriş hatası: $e');
      return false;
    }
  }

  /// Sunucudan kullanıcı bilgilerini alır ve [SecureAuthStorage] içerisinde saklar.
  Future<bool> getUserInfoFromServer({DeviceInfoModel? deviceInfo}) async {
    try {
      final String? token = await _storage.readToken();
      if (token == null) return false;

      final Map<String, dynamic> data = {};
      if (deviceInfo != null) {
        data['deviceInfo'] = deviceInfo.toJson();
      }

      // Güvenli header'ları oluştur
      final Map<String, String> headers = {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      };

      if (deviceInfo != null) {
        headers.addAll(HelperUtils.getSecureHeaders(deviceInfo: deviceInfo));
      }

      // Data içeriğini şifrele (boş değilse)
      Map<String, dynamic> requestData = {};
      if (data.isNotEmpty) {
        final String encryptedData = HelperUtils.encryptData(data);
        requestData['encryptedData'] = encryptedData;
      }

      final response = await _dio.post(
        '/user',
        options: Options(headers: headers),
        data: requestData.isNotEmpty ? requestData : null,
      );

      // Ban durumunu kontrol et
      if (response.statusCode == 403) {
        _isBanned = true;
        _banReason = response.data['message'] ?? 'Account Banned';
        log('Kullanıcı engellendi: $_banReason');
        return false;
      }

      if (response.statusCode == 200) {
        // Ban durumu için ek kontrol (sunucu isteği başarılı ancak kullanıcı banlı olabilir)
        if (response.data is Map &&
            response.data.containsKey('isBanned') &&
            response.data['isBanned'] == true) {
          _isBanned = true;
          _banReason = response.data['banReason'] ?? 'Account Banned';
          log('Kullanıcı ban durumu: Banlı. Sebep: $_banReason');
          return false;
        }

        return await HelperUtils.saveTokenFromResponse(response);
      }

      return false;
    } catch (e) {
      log('Kullanıcı bilgileri alınamadı: $e');
      return false;
    }
  }

  Future<bool> processFeature(
      {required String featureName, Map<String, dynamic>? data}) async {
    try {
      // Kullanıcının banlı olup olmadığını kontrol et
      if (_isBanned) {
        log('İşlem reddedildi: Kullanıcı banlı. Sebep: $_banReason');
        return false;
      }

      final token = await _storage.readToken();
      if (token == null) {
        throw Exception('Authentication Error');
      }

      // Cihaz bilgilerini ekle
      final deviceInfo = await HelperUtils.getDeviceInfo();
      final Map<String, dynamic> featureData = {
        'featureName': featureName,
        'data': data ?? {},
        'deviceInfo': deviceInfo.toJson(),
      };

      log('Feature isteği verileri: ${jsonEncode(featureData)}');

      // Veriyi şifrele
      final String encryptedData = HelperUtils.encryptData(featureData);
      final Map<String, dynamic> requestData = {'encryptedData': encryptedData};

      // Güvenli header'ları oluştur
      final Map<String, String> headers = {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      };

      headers.addAll(HelperUtils.getSecureHeaders(deviceInfo: deviceInfo));

      final response = await _dio.post(
        '/processFeature',
        options: Options(headers: headers),
        data: requestData,
      );

      log('Feature response: ${response.data}');

      // Ban durumunu kontrol et
      if (response.statusCode == 403) {
        _isBanned = true;
        _banReason =
            response.data['error'] ?? response.data['message'] ?? 'ERR: 403';
        log('İşlem reddedildi: $_banReason');
        return false;
      }

      if (response.statusCode == 200) {
        // Ban durumu için ek kontrol
        if (response.data is Map &&
            response.data.containsKey('isBanned') &&
            response.data['isBanned'] == true) {
          _isBanned = true;
          _banReason =
              response.data['banReason'] ?? 'Hesabınız engellenmiştir.';
          log('İşlem sonrası kullanıcı banlı: $_banReason');
          return false;
        }

        return await HelperUtils.saveTokenFromResponse(response);
      }

      throw 'ERR: ${response.data}';
    } catch (e) {
      log('Feature işlemi hatası: $e');
      rethrow;
    }
  }

  // Ban durumunu göstermek için dialog
  static Future<void> showBanDialog(BuildContext context, String reason,
      {final String? userId}) async {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Account Banned'),
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                Text(reason),
                const SizedBox(height: 10),
                const Text(
                  'Your account is banned. Please contact for more information.',
                  style: TextStyle(fontSize: 14),
                ),
                if (userId != null) ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: SelectableText(
                          'User ID: $userId',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(
                          Icons.copy,
                          size: 16,
                          color: Colors.black54,
                        ),
                        onPressed: () {
                          HelperUtils.copyToClipboard(userId);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text("Copied")),
                          );
                        },
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(
                          minWidth: 24,
                          minHeight: 24,
                        ),
                        tooltip: 'Kopyala',
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}
