import 'dart:developer';
import 'package:ai_auto_free/common/base_provider.dart';
import 'package:ai_auto_free/common/constants.dart';
import 'package:ai_auto_free/models/gift_code_model.dart';
import 'package:ai_auto_free/services/auth_service.dart';
import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:ai_auto_free/services/user_settings.dart';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

class GiftCodeProvider extends BaseProvider {
  final TextEditingController creditsController = TextEditingController();
  final TextEditingController redeemCodeController = TextEditingController();
  final List<GiftCodeModel> _createdCodes = [];

  List<GiftCodeModel> get createdCodes => _createdCodes;
  int get remainingCredits => SecureAuthStorage.instance.userInfo?.credits ?? 0;

  bool _isCreatingCode = false;
  bool get isCreatingCode => _isCreatingCode;

  bool _isRedeemingCode = false;
  bool get isRedeemingCode => _isRedeemingCode;

  String _errorMessage = '';
  String get errorMessage => _errorMessage;

  String _successMessage = '';
  String get successMessage => _successMessage;

  // Kredi güncellendiğinde çağrılacak olan callback fonksiyonu
  VoidCallback? onCreditsUpdated;

  GiftCodeProvider() {
    _loadCreatedCodes();
  }

  @override
  void dispose() {
    creditsController.dispose();
    redeemCodeController.dispose();
    super.dispose();
  }

  Future<void> _loadCreatedCodes() async {
    final codes = await UserSettings.getGiftCodes();
    _createdCodes.clear();
    _createdCodes.addAll(codes);
    notifyListeners();
  }

  // Hediye kodu oluşturma fonksiyonu
  Future<void> createGiftCode() async {
    if (creditsController.text.isEmpty) {
      _setErrorMessage(S.current.please_enter_credit_amount);
      return;
    }

    final int credits = int.tryParse(creditsController.text) ?? 0;
    if (credits <= 0) {
      _setErrorMessage(S.current.please_enter_valid_credit_amount);
      return;
    }

    if (credits > remainingCredits) {
      _setErrorMessage(S.current.not_enough_credits_for_gift);
      return;
    }

    _setErrorMessage('');
    _setSuccessMessage('');
    _isCreatingCode = true;
    notifyListeners();

    try {
      // Cihaz bilgilerini al
      final deviceInfo = await HelperUtils.getDeviceInfo();

      // Kullanıcı kimliğini al
      final userId = await HelperUtils.getUserId();

      // Data hazırla
      final Map<String, dynamic> data = {
        'userId': userId,
        'credits': credits,
        'deviceInfo': deviceInfo.toJson(),
      };

      log('Hediye kodu oluşturma verisi: $data');

      // Veriyi şifrele
      final String encryptedData = HelperUtils.encryptData(data);

      // API isteği için headers
      final Map<String, String> headers = {
        'Authorization':
            'Bearer ${await SecureAuthStorage.instance.readToken()}',
        'Content-Type': 'application/json',
      };

      // Güvenlik headerlarını ekle
      headers.addAll(HelperUtils.getSecureHeaders(deviceInfo: deviceInfo));

      // API isteği gönder
      final dio = Dio()
        ..options.validateStatus = (status) => status != null && status < 500;

      final response = await dio.post(
        '${Constants.apiUrl}/createGiftCode',
        options: Options(headers: headers),
        data: {'encryptedData': encryptedData},
      );

      log('Hediye kodu oluşturma: ${response.data}');
      log('Hediye kodu oluşturma: ${response.statusCode}');

      if (response.statusCode == 200) {
        // Yeni token varsa sakla
        await HelperUtils.saveTokenFromResponse(response);

        // Kod başarıyla oluşturuldu
        final GiftCodeModel newCode = GiftCodeModel(
          code: response.data['giftCode'] ?? '',
          credits: credits,
          createdAt: DateTime.now(),
        );

        // Boş kod kontrolü yap
        if (newCode.code.isEmpty) {
          _setErrorMessage(S.current.invalid_server_response);
          return;
        }

        // Kodu yerel olarak kaydet
        await UserSettings.addGiftCode(newCode);

        // Listeyi güncelle
        await _loadCreatedCodes();

        // Input temizle
        creditsController.clear();

        // Başarı mesajı
        _setSuccessMessage(S.current.gift_code_created_success(newCode.code));

        // Kredileri güncelle
        if (onCreditsUpdated != null) {
          onCreditsUpdated!();
        }
      } else {
        log('Hediye kodu oluşturma hatası: ${response.statusCode}');
        log('Hata detayı: ${response.data}');
        _setErrorMessage(response.data['message'] ??
            response.data['error'] ??
            S.current.gift_code_error);
      }
    } catch (e) {
      log('Hediye kodu oluşturma hatası: $e');
      _setErrorMessage(S.current.gift_code_error);
    } finally {
      _isCreatingCode = false;
      notifyListeners();
    }
  }

  // Hediye kodu kullanma fonksiyonu
  Future<void> redeemGiftCode() async {
    if (redeemCodeController.text.isEmpty) {
      _setErrorMessage(S.current.please_enter_gift_code);
      return;
    }

    _setErrorMessage('');
    _setSuccessMessage('');
    _isRedeemingCode = true;
    notifyListeners();

    try {
      // Cihaz bilgilerini al
      final deviceInfo = await HelperUtils.getDeviceInfo();

      // Kullanıcı kimliğini al
      final userId = SecureAuthStorage.instance.userInfo?.uuid ?? '';

      if (userId.isEmpty) {
        _setErrorMessage('Kullanıcı kimliği bulunamadı');
        return;
      }

      // API isteği için headers
      final Map<String, String> headers = {
        'Authorization':
            'Bearer ${await SecureAuthStorage.instance.readToken()}',
        'Content-Type': 'application/json',
      };

      // Güvenlik headerlarını ekle
      headers.addAll(HelperUtils.getSecureHeaders(deviceInfo: deviceInfo));

      // API isteği için data - şifreleme yapmadan direkt gönder
      final data = {
        'code': redeemCodeController.text,
      };

      log('Hediye kodu kullanma verisi: $data');

      // API isteği gönder
      final dio = Dio()
        ..options.validateStatus = (status) => status != null && status < 500;

      final response = await dio.post(
        '${Constants.apiUrl}/redeemGiftCode',
        options: Options(headers: headers),
        data: data,
      );

      log('Hediye kodu kullanma yanıtı: ${response.data}');
      log('Hediye kodu kullanma durum kodu: ${response.statusCode}');

      if (response.statusCode == 200) {
        // Yeni token varsa sakla
        await HelperUtils.saveTokenFromResponse(response);

        // Başarı mesajı
        final int addedCredits = response.data['creditsAdded'] ?? 0;
        _setSuccessMessage(S.current.credits_added_to_account(addedCredits));

        // Input temizle
        redeemCodeController.clear();

        // Kredileri güncelle
        if (onCreditsUpdated != null) {
          onCreditsUpdated!();
        }
      } else {
        log('Hediye kodu kullanma hatası: ${response.statusCode}');
        log('Hata detayı: ${response.data}');
        _setErrorMessage(response.data['message'] ??
            response.data['error'] ??
            S.current.redeem_code_error);
      }
    } catch (e) {
      log('Hediye kodu kullanma hatası: $e');
      _setErrorMessage(S.current.redeem_code_error);
    } finally {
      _isRedeemingCode = false;
      notifyListeners();
    }
  }

  void _setErrorMessage(String message) {
    _errorMessage = message;
    if (message.isNotEmpty) {
      _successMessage = '';
    }
    notifyListeners();
  }

  void _setSuccessMessage(String message) {
    _successMessage = message;
    if (message.isNotEmpty) {
      _errorMessage = '';
    }
    notifyListeners();
  }
}
