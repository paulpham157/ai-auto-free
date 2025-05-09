import 'dart:developer';
import 'package:ai_auto_free/common/constants.dart';
import 'package:ai_auto_free/common/l10n_dyanmic.dart';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/models/log_model.dart';
import 'package:ai_auto_free/models/services_model.dart';
import 'package:dio/dio.dart';

import '../models/account_model.dart';
import 'auth_service.dart';
import 'helper_utils.dart';
import 'python/run_py.dart';

class AccountService {
  AccountService._private();

  static final AccountService _instance = AccountService._private();

  static AccountService get instance => _instance;
  final _dio = Dio()
    ..options.baseUrl = Constants.apiUrl
    ..options.validateStatus = (status) => status != null && status < 500;

  Future<void> parseAccountFromlogs(
      List<LogModelData>? logDatas, String featureName,
      {bool processFeature = true,
      Function(LogModel log)? onLog,
      Function(AccountModel account)? onSuccess}) async {
    if (logDatas != null &&
        (logDatas.any((e) => e.dataKey == "email") &&
            logDatas
                .any((e) => e.dataKey == "password" || e.dataKey == "token"))) {
      final account = AccountModel.fromLogDatas(logDatas, nameKey: featureName);
      try {
        final isSuccess = processFeature
            ? await AuthService().processFeature(
                featureName: featureName,
                data: account.toJson(),
              )
            : true;
        if (isSuccess) onSuccess?.call(account);
      } catch (e) {
        onLog?.call(LogModel(
          message: e.toString(),
          type: LogType.error,
          time: DateTime.now(),
        ));
      }
    }
  }

  Future<void> processAccount(FeatureModel feature,
      {Function(LogModel log)? onLog,
      Function(AccountModel account)? onSuccess}) async {
    if (!feature.pool) {
      await _processNormalAccount(feature, onLog: onLog,
          onSuccess: (account) async {
        await AuthService().getUserInfoFromServer();
        onSuccess?.call(account);
      });
    } else {
      await _processPoolAccount(feature, onLog: onLog,
          onSuccess: (account) async {
        await AuthService().getUserInfoFromServer();
        onSuccess?.call(account);
      });
    }
  }

  Future<void> _processNormalAccount(FeatureModel feature,
      {Function(LogModel log)? onLog,
      Function(AccountModel account)? onSuccess}) async {
    RunPy.instance
        .runPythonScript(
      feature.fileName,
      arguments: await HelperUtils.getMailScriptArguments(
          arguments: feature.arguments),
    )
        .listen((data) async {
      data.translatedMessage = l10nDynamic[data.message];
      log(data.translatedMessage ?? data.message);
      onLog?.call(data);

      final List<LogModelData>? logDatas = data.logDatas;
      await parseAccountFromlogs(logDatas, feature.nameKey, onLog: (log) {
        onLog?.call(log);
      }, onSuccess: (account) {
        data.type = LogType.success;
        onSuccess?.call(account);
      });
    });
  }

  Future<void> _processPoolAccount(FeatureModel feature,
      {Function(LogModel log)? onLog,
      Function(AccountModel account)? onSuccess}) async {
    try {
      onLog?.call(LogModel(
        message: S.current.assigning_account,
        type: LogType.info,
        time: DateTime.now(),
      ));

      // Cihaz bilgilerini ve token'ı al
      final token = await SecureAuthStorage.instance.readToken();
      final deviceInfo = await HelperUtils.getDeviceInfo();

      // Güvenli header'ları oluştur
      final Map<String, String> headers = {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      };

      // Güvenlik headerlarını ekle
      headers.addAll(HelperUtils.getSecureHeaders(deviceInfo: deviceInfo));

      final response = await _dio.post(
        "/assignAccount",
        options: Options(headers: headers),
        data: {
          "featureName": feature.nameKey,
          "deviceInfo": deviceInfo.toJson(),
        },
      );

      if (response.statusCode == 200) {
        feature.poolAccountCount--;
        final data = response.data as Map<String, dynamic>;
        log(data.toString());
        final account =
            AccountModel.fromJson(data["account"], name: feature.name);
        onLog?.call(LogModel(
          message: S.current.assigning_account_success,
          type: LogType.success,
          time: DateTime.now(),
        ));

        // Token response'tan al ve kaydet
        await HelperUtils.saveTokenFromResponse(response);

        onSuccess?.call(account);
      } else {
        log(response.data.toString());
        if (response.data is Map<String, dynamic> &&
            response.data.containsKey("error")) {
          onLog?.call(LogModel(
            message: response.data["error"],
            type: LogType.error,
            time: DateTime.now(),
          ));
          onLog?.call(LogModel(
            message: S.current.assigning_account_error,
            type: LogType.error,
            time: DateTime.now(),
          ));
        }
      }
    } catch (e) {
      onLog?.call(LogModel(
        message: e.toString(),
        type: LogType.error,
        time: DateTime.now(),
      ));
    }
  }
}
