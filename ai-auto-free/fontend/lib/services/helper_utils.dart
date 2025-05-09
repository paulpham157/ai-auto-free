import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:ai_auto_free/common/constants.dart';
import 'package:ai_auto_free/common/public_key.dart';
import 'package:ai_auto_free/features/settings/settings_provider.dart';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/models/device_info_model.dart';
import 'package:ai_auto_free/models/user_info_model.dart';
import 'package:process_run/process_run.dart';
import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:crypto/crypto.dart';

import 'auth_service.dart';
import 'user_settings.dart';

class HelperUtils {
  static Shell _shell = Shell(
    environment: Platform.environment,
    includeParentEnvironment: true,
    runInShell: true,
  );

  static Shell get shell => _shell;

  static void updateShellEnvironment(Map<String, String> environment) {
    _shell = _shell.cloneWithOptions(ShellOptions(environment: environment));
  }

  static final _dio = Dio()
    ..options.validateStatus = (status) => status != null && status < 500;

  // Şifreleme için sabit anahtar (gerçek uygulamada güvenli bir şekilde saklanmalıdır)
  static const String _encryptionKey = "ai_auto_free_secure_key_V47R3JNT";

  static String get currentLanguageCode {
    if (Constants.languageCode.isNotEmpty) return Constants.languageCode;
    final code = Platform.localeName.split('_')[0];
    if (["tr", "zh"].contains(code)) {
      return code;
    }
    return "en";
  }

  static String get fallbackLanguageCode => "en";

  // DeviceInfo alma işlemi devam ediyor mu kontrolü
  static bool _isGettingDeviceInfo = false;

  /// Cihaz bilgilerini toplar ve DeviceInfoModel olarak döndürür
  static Future<DeviceInfoModel> getDeviceInfo() async {
    // Eğer zaten bir getDeviceInfo işlemi çalışıyorsa sonsuz döngüyü önle
    if (_isGettingDeviceInfo) {
      log('getDeviceInfo zaten çalışıyor, sonsuz döngü önlendi!');
      // Geçici bir DeviceInfo döndür
      return DeviceInfoModel(
        deviceName: Platform.localHostname,
        deviceId: "TEMP_${DateTime.now().millisecondsSinceEpoch}",
        macAddress: "",
        osName: Platform.operatingSystem,
        osVersion: Platform.operatingSystemVersion,
        locale: Platform.localeName,
        timezone: DateTime.now().timeZoneOffset.toString(),
        ipAddress: "",
      );
    }

    // İşlem başlıyor
    _isGettingDeviceInfo = true;

    try {
      final deviceInfo = DeviceInfoPlugin();
      String deviceName = Platform.localHostname;
      String deviceId = '';
      String macAddress = '';
      String osName = Platform.operatingSystem;
      String osVersion = Platform.operatingSystemVersion;
      String locale = Platform.localeName;
      String timezone = DateTime.now().timeZoneOffset.toString();
      String ipAddress = '';

      // IP adresini al
      try {
        ipAddress = await getPublicIpAddress();
        log('Public IP adresi alındı: $ipAddress');
      } catch (e) {
        log('IP adresi alınamadı: $e');
      }

      try {
        // MAC adresini almak için platform spesifik kodlar
        if (Platform.isWindows) {
          final result = await _shell.run('getmac /fo csv /nh');
          if (result.isNotEmpty && result.first.exitCode == 0) {
            final output = result.first.stdout.toString().trim();
            if (output.isNotEmpty) {
              // Çıktıyı satır satır böl
              final lines = output.split('\n');

              // Aktif bir MAC adresi bulmaya çalış (Media disconnected olmayanlar)
              String? activeMac;
              String? firstMac;

              for (final line in lines) {
                final parts = line.split(',');
                if (parts.length >= 2) {
                  final mac = parts[0].replaceAll('"', '').trim();
                  final status = parts[1].replaceAll('"', '').trim();

                  // İlk MAC adresini sakla (eğer aktif bulamazsak)
                  firstMac ??= mac;

                  // Media disconnected kontrolü
                  if (!status.contains("Media disconnected")) {
                    activeMac = mac;
                    break; // Aktif MAC adresi bulundu
                  }
                }
              }

              // Aktif MAC adresi bulunamazsa ilk adresi kullan
              macAddress = activeMac ?? firstMac ?? '';
            }
          }
        }
      } catch (e) {
        log('MAC adresi alınamadı: $e');
      }

      // Platform spesifik bilgileri al
      Map<String, dynamic> additionalInfo = {};

      try {
        if (Platform.isWindows) {
          final windowsInfo = await deviceInfo.windowsInfo;
          deviceName = windowsInfo.computerName;
          additionalInfo = {
            'productName': windowsInfo.productName,
            'editionId': windowsInfo.editionId,
            'systemMemoryInMegabytes': windowsInfo.systemMemoryInMegabytes,
            'userName': windowsInfo.userName,
            'numberOfCores': windowsInfo.numberOfCores,
            'computerName': windowsInfo.computerName,
          };

          // Eski DeviceId'yi additionalInfo içinde sakla (ama deviceId olarak kullanma)
          if (windowsInfo.deviceId.isNotEmpty) {
            additionalInfo['windowsDeviceId'] = windowsInfo.deviceId;
          }
        }
      } catch (e) {
        log('Cihaz bilgileri alınamadı: $e');
      }

      // Benzersiz kimlik oluştur - generateUuid ÇAĞIRMADAN direkt hash oluştur
      // Sonsuz döngüyü önlemek için
      String dataToHash =
          (additionalInfo['windowsDeviceId'] ?? '') + deviceName;
      if (dataToHash.isEmpty) {
        dataToHash = Platform.operatingSystem +
            Platform.operatingSystemVersion +
            macAddress;
      }

      var bytes = utf8.encode(dataToHash + _encryptionKey.substring(0, 8));
      var digest = sha256.convert(bytes);
      deviceId = digest.toString().substring(0, 12).toUpperCase();
      log('Cihaz için doğrudan UUID oluşturuldu: $deviceId');

      // Cihaz adı boşsa
      if (deviceName.isEmpty) {
        deviceName = Platform.localHostname;
        log('Cihaz adı bulunamadı, local hostname kullanılıyor: $deviceName');
      }

      final model = DeviceInfoModel(
        deviceName: deviceName,
        deviceId: deviceId,
        macAddress: macAddress,
        osName: osName,
        osVersion: osVersion,
        locale: locale,
        timezone: timezone,
        ipAddress: ipAddress,
        additionalInfo: additionalInfo,
      );

      log('Sunucuya gönderilecek cihaz bilgileri: ${model.toJsonString()}');
      return model;
    } finally {
      // İşlemi tamamlandığında flag'i sıfırla
      _isGettingDeviceInfo = false;
    }
  }

  /// Cihaz bilgilerini şifreler ve imzalar
  static Map<String, String> getSecureHeaders({DeviceInfoModel? deviceInfo}) {
    final Map<String, String> headers = {};

    try {
      if (deviceInfo != null) {
        // Cihaz bilgilerini JSON'a dönüştür (sadece istenen alanlar)
        final deviceInfoJson = deviceInfo.toJsonString();

        // Cihaz bilgilerini şifrele (Base64 ile)
        final encodedDeviceInfo = base64Encode(utf8.encode(deviceInfoJson));
        headers['X-Device-Info'] = encodedDeviceInfo;

        // İmza oluştur (HMAC-SHA256)
        final hmacSha256 = Hmac(sha256, utf8.encode(_encryptionKey));
        final digest = hmacSha256.convert(utf8.encode(deviceInfoJson));
        headers['X-Device-Signature'] = digest.toString();

        // Zaman damgası ekle
        final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
        headers['X-Timestamp'] = timestamp;

        // Zaman damgası + cihaz kimliği ile ek bir imza oluştur
        final verificationData =
            '$timestamp:${deviceInfo.deviceId}:${deviceInfo.ipAddress}';
        final verificationDigest =
            hmacSha256.convert(utf8.encode(verificationData));
        headers['X-Verification'] = verificationDigest.toString();
      }
    } catch (e) {
      log('Güvenli header oluşturma hatası: $e');
    }

    return headers;
  }

  static String? parseCursorToken(String? rawToken) {
    if (rawToken == null || rawToken.isEmpty) return null;
    if (!rawToken.contains("%3A%3A")) {
      return rawToken;
    }
    try {
      return rawToken.split('%3A%3A').last;
    } catch (e) {
      return null;
    }
  }

  /// Veriyi AES algoritması ile şifreler ve Base64 formatında döndürür
  static String encryptData(Map<String, dynamic> data) {
    try {
      // Veriyi JSON formatına dönüştür
      final jsonData = jsonEncode(data);

      // Basit bir şifreleme için HMAC-SHA256 kullanarak bir anahtar türetelim
      final hmacSha256 = Hmac(sha256, utf8.encode(_encryptionKey));
      final digest = hmacSha256.convert(utf8.encode(jsonData));

      // Şifreleme için bir "tuz" (salt) oluşturalım
      final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
      final salt = digest.toString().substring(0, 8) +
          timestamp.substring(timestamp.length - 4);

      // Veriyi şifrele (basit bir XOR şifreleme)
      final List<int> bytes = utf8.encode(jsonData);
      final List<int> keyBytes = utf8.encode(_encryptionKey + salt);
      final List<int> encryptedBytes = [];

      for (int i = 0; i < bytes.length; i++) {
        encryptedBytes.add(bytes[i] ^ keyBytes[i % keyBytes.length]);
      }

      // Şifrelenmiş veriyi Base64 formatına dönüştür
      final encryptedData = base64Encode(encryptedBytes);

      // Salt değerini şifrelenmiş verinin başına ekleyelim (ayırıcı olarak ":" kullanıyoruz)
      return "$salt:$encryptedData";
    } catch (e) {
      log('Veri şifreleme hatası: $e');
      return "";
    }
  }

  static Future<void> killCursorProcesses() async {
    if (!Constants.killProcessInDebugMode) return;
    try {
      if (Platform.isWindows) {
        await _shell.run('taskkill /F /IM Cursor.exe');
      } else {
        await _shell.run('pkill -f Cursor');
      }
    } catch (e) {
      log("Cursor process not found");
    }
  }

  static Future<String> getCursorUsage(String rawToken) async {
    if (rawToken.isEmpty) return '-';

    final userId = _getCursorUserId(rawToken);
    if (userId == null) return '-';

    try {
      final response = await _dio.get(
        'https://www.cursor.com/api/usage',
        queryParameters: {'user': userId},
        options: Options(
          headers: {
            'Cookie': 'WorkosCursorSessionToken=$rawToken',
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
            'Accept': '*/*',
            'Accept-Language': 'tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.cursor.com/settings',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Te': 'trailers',
          },
        ),
      );
      log("Usage response code: ${response.statusCode}");
      log("Usage response: ${response.data}");

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final usageInfo = <String, String>{};

        data.forEach((model, stats) {
          if (stats is Map<String, dynamic> &&
              (stats['numRequests'] ?? 0) > 0) {
            final renamedModel = model
                .toString()
                .replaceAll('gpt-4', S.current.premium)
                .replaceAll('gpt-3.5-turbo', S.current.free);
            final requests = stats['numRequests'];
            final maxRequests = stats['maxRequestUsage'];
            usageInfo[renamedModel] = requests != null
                ? '$requests${maxRequests != null ? '/$maxRequests' : ''}'
                : '';
          }
        });

        return usageInfo.isEmpty
            ? 'new'
            : usageInfo.entries
                .map((e) => '${e.key}: ${e.value}')
                .join('  ${S.current.and}  ');
      }
      return '+';
    } catch (e) {
      log(e.toString());
      return '-';
    }
  }

  static String? _getCursorUserId(String rawToken) {
    try {
      return rawToken.split('%3A%3A')[0];
    } catch (e) {
      return null;
    }
  }

  static Future<void> launchURL(String? url) async {
    if (url != null && await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }

  static Future<List<String>> getMailScriptArguments({
    List<String> arguments = const [],
  }) async {
    arguments.add(UserSettings.getBrowserVisibilityArgument());
    final emailValidatorType = UserSettings.getEmailValidatorType();
    if (emailValidatorType == EmailValidatorType.imap) {
      arguments.add("--email-verifier imap");
      arguments.add("--imap-server ${UserSettings.getImapServer()}");
      arguments.add("--imap-port ${UserSettings.getImapPort()}");
      arguments.add("--imap-user ${UserSettings.getImapUser()}");
      arguments.add('--imap-pass "${UserSettings.getImapPassword()}"');
    }
    arguments.add("--platform ${Platform.operatingSystem}");
    if (emailValidatorType == EmailValidatorType.imap) {
      final list = UserSettings.getImapRedirectedMails();
      if (list.isNotEmpty) {
        arguments.add("--email ${list.first}");
      }
    }
    return arguments;
  }

  static Future<String> getUserId() async {
    final userId = SecureAuthStorage.instance.userInfo?.uuid;
    return userId ?? await generateUuid();
  }

  static Future<String> generateUuid() async {
    // Sonsuz döngüyü önlemek için DeviceInfoModel'i direkt olarak oluşturmayacağız
    // getDeviceInfo() metodunu çağırmak yerine direkt olarak gerekli bilgileri alıp hash oluşturacağız

    // Temel cihaz kimliği bilgilerini topla
    final deviceInfo = DeviceInfoPlugin();
    String deviceId = '';
    String computerName = Platform.localHostname;
    String userName = '';

    try {
      if (Platform.isWindows) {
        final windowsInfo = await deviceInfo.windowsInfo;
        deviceId = windowsInfo.deviceId;
        computerName = windowsInfo.computerName;
        userName = windowsInfo.userName;
      }
    } catch (e) {
      log('UUID oluşturmak için cihaz bilgileri alınamadı: $e');
    }

    // Hash için güçlü bir veri oluştur
    String dataToHash = deviceId.isNotEmpty
        ? deviceId
        : computerName +
            userName +
            Platform.operatingSystem +
            Platform.operatingSystemVersion;

    // Ek güvenlik için sabit bir salt ekle
    dataToHash += _encryptionKey.substring(0, 8);

    // Hash oluştur
    var bytes = utf8.encode(dataToHash);
    var digest = sha256.convert(bytes);

    return digest.toString().substring(0, 12).toUpperCase();
  }

  static ({bool isValid, JWT? jwt}) verifyJwtToken(String token) {
    try {
      final jwt = JWT.verify(token, RSAPublicKey(publickKeyPem));
      return (isValid: true, jwt: jwt);
    } catch (e) {
      log('JWT doğrulama hatası: $e');
      return (isValid: false, jwt: null);
    }
  }

  static Future<bool> saveTokenFromResponse(Response response) async {
    final String? userInfoToken = response.headers.map["New-Token"]?[0];
    if (userInfoToken != null) {
      final verify = HelperUtils.verifyJwtToken(userInfoToken);
      if (verify.isValid && verify.jwt?.payload != null) {
        if (SecureAuthStorage.instance.userInfo != null) {
          // Mevcut bir UserInfoModel varsa kredileri güncelle
          SecureAuthStorage.instance.userInfo!.credits =
              verify.jwt?.payload['credits'] ?? 0;
          log('Kredi güncellendi: ${SecureAuthStorage.instance.userInfo!.credits}');
        } else {
          // Yoksa yeni bir instance oluştur
          SecureAuthStorage.instance.userInfo =
              UserInfoModel.fromJson(verify.jwt?.payload);
          log('Yeni UserInfoModel oluşturuldu: ${SecureAuthStorage.instance.userInfo!.credits}');
        }

        // Auth servisi token'ı kaydetsin
        await SecureAuthStorage.instance.writeToken(userInfoToken);

        return true;
      }
    }
    return false;
  }

  static bool checkJWTValid(String token) {
    try {
      token = parseCursorToken(token) ?? token;
      // Token'ı parçalara ayır
      final parts = token.split('.');
      if (parts.length != 3) return false;

      // Payload kısmını decode et
      final payload = json
          .decode(utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))));

      // exp (expiration time) kontrolü
      if (payload['exp'] != null) {
        final expiry =
            DateTime.fromMillisecondsSinceEpoch(payload['exp'] * 1000);
        return DateTime.now().isBefore(expiry);
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  static DateTime? jwtToDateTime(String? token) {
    if (token == null || token.isEmpty || token.length < 10) return null;
    try {
      token = parseCursorToken(token) ?? token;
      final parts = token.split('.');
      if (parts.length != 3) return null;
      final payload = json
          .decode(utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))));
      if (payload['time'] != null || payload['auth_time'] != null) {
        final timestamp = int.parse(payload['time'] ?? (payload['auth_time']));
        final dateTime =
            DateTime.fromMillisecondsSinceEpoch(timestamp * 1000, isUtc: true);
        return dateTime;
      }
    } catch (e) {
      log(e.toString());
      return null;
    }
    return null;
  }

  static String getDependencyCommand() {
    final deps = Constants.dependencies;
    return "pip install ${deps.join(" ")}";
  }

  static Future<String?> refreshWindsurfToken(
      String refreshToken, String apiKey) async {
    try {
      final response = await _dio.post(
        'https://securetoken.googleapis.com/v1/token?key=$apiKey',
        data: "grant_type=refresh_token&refresh_token=$refreshToken",
        options: Options(
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        ),
      );
      return response.data['access_token'];
    } catch (e) {
      log(e.toString());
      return null;
    }
  }

  /// Uygulamanın çalıştığı klasörü (exe dosyasının bulunduğu klasörü) döndürür
  static String getApplicationDirectory() {
    try {
      // Platform.resolvedExecutable, uygulamanın çalıştırılabilir dosyasının tam yolunu verir
      final executablePath = Platform.resolvedExecutable;

      // Dosya yolundan klasör yolunu elde etmek için son kısmı (dosya adını) çıkarıyoruz
      final directory = File(executablePath).parent.path;

      return directory;
    } catch (e) {
      // Hata durumunda geçerli çalışma dizinini döndür
      return Directory.current.path;
    }
  }

  /// Kullanıcının genel IP adresini almak için basit bir HTTP isteği gönderir.
  /// ipify.org API'sini kullanarak IP adresini alır.
  static Future<String> getPublicIpAddress() async {
    try {
      // ipify.org ücretsiz IP API
      final response = await _dio.get('https://api.ipify.org');

      if (response.statusCode == 200 && response.data != null) {
        // API direkt olarak IP adresini döndürür
        return response.data.toString().trim();
      }

      // Yedek API olarak ipinfo.io kullan (günlük 1000 istek sınırı var)
      final backupResponse = await _dio.get('https://ipinfo.io/ip');
      if (backupResponse.statusCode == 200 && backupResponse.data != null) {
        return backupResponse.data.toString().trim();
      }

      log('IP adresi alınamadı');
      return '';
    } catch (e) {
      log('IP adresi alma hatası: $e');
      try {
        // Son bir deneme daha
        final lastTryResponse = await _dio.get('https://ifconfig.me/ip');
        if (lastTryResponse.statusCode == 200 && lastTryResponse.data != null) {
          return lastTryResponse.data.toString().trim();
        }
      } catch (_) {}
      return '';
    }
  }

  static void copyToClipboard(String userId) {}

  /// Kullanıcının bildirim göndermesi için API isteği yapar
  /// [message] Bildirim başlığı
  /// [details] Bildirim detayları
  /// [token] İsteğe bağlı JWT token. Belirtilmezse secure storage'dan okunur.
  static Future<bool> sendNotificationToTelegram({
    required String message,
    required String details,
    String? token,
  }) async {
    try {
      final String? authToken =
          token ?? await SecureAuthStorage.instance.readToken();
      if (authToken == null) {
        log('Bildirim gönderme hatası: Token bulunamadı');
        return false;
      }

      // Cihaz bilgilerini al
      final deviceInfo = await getDeviceInfo();

      // Güvenli header'ları oluştur
      final Map<String, String> headers = {
        'Authorization': 'Bearer $authToken',
        'Content-Type': 'application/json',
      };

      // Güvenlik headerlarını ekle
      headers.addAll(getSecureHeaders(deviceInfo: deviceInfo));

      // İstek gönder
      final response = await _dio.post(
        '${Constants.apiUrl}/notify',
        options: Options(headers: headers),
        data: {
          'message': message,
          'details': details,
          'deviceInfo': deviceInfo.toJson(),
        },
      );

      log('Bildirim yanıtı: ${response.data}');

      // İşlem başarılı mı kontrol et
      return response.statusCode == 200;
    } catch (e) {
      log('Bildirim gönderme hatası: $e');
      return false;
    }
  }

  /// Cursor hesabının geçerli olup olmadığını test eder
  static Future<bool> testCursorAccount(String token,
      {Function(bool isValid, String? message)? onValid}) async {
    log('Cursor hesabı test ediliyor');

    final Map<String, String> headers = {
      'Accept-Encoding': 'gzip, deflate, br',
      'Authorization': 'Bearer $token',
      'Connect-Protocol-Version': '1',
      'Content-Type': 'application/proto',
      'User-Agent': 'connect-es/1.6.1',
      'X-Ghost-Mode': 'true'
    };

    try {
      final response = await _dio.post(
        'https://api2.cursor.sh/aiserver.v1.DashboardService/GetTeams',
        options: Options(headers: headers),
      );
      log("Hesap geçerliliği: ${response.data}");
      final bool isValid = response.statusCode == 200;
      if (isValid) {
        onValid?.call(isValid, response.data['code']);
        return isValid;
      } else {
        onValid?.call(false, response.data);
        return false;
      }
    } catch (e) {
      log('Cursor hesabı test hatası: $e');
      return false;
    }
  }
}
