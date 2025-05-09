import 'dart:convert';

import 'package:ai_auto_free/services/helper_utils.dart';

import '../common/constants.dart';
import 'log_model.dart';

enum AccountType {
  cursor(Constants.cursorPng),
  windsurf(Constants.windsurfPng),
  other(null);

  final String? image;
  const AccountType(this.image);
}

class AccountModel {
  final AccountType type;
  final String email;
  final String? password;
  final bool isManualAdded;
  String? cookieToken;
  String? limit;
  final DateTime date;
  final String? refreshToken;
  final String? apiKey;
  String? lastUsageStatus;
  AccountModel({
    required this.type,
    required this.email,
    this.password,
    this.cookieToken,
    this.limit,
    this.isManualAdded = false,
    this.refreshToken,
    this.apiKey,
    required this.date,
    this.lastUsageStatus,
  });

  String? get token => HelperUtils.parseCursorToken(cookieToken);

  factory AccountModel.fromJsonString(String json) {
    final data = jsonDecode(json);
    return AccountModel(
      type: "${data["type"]}".toLowerCase() == "cursor"
          ? AccountType.cursor
          : "${data["type"]}".toLowerCase() == "windsurf"
              ? AccountType.windsurf
              : AccountType.other,
      email: data["email"],
      password: data["password"],
      cookieToken: data["token"],
      isManualAdded: data["manual"] ?? false,
      refreshToken: data["refreshToken"],
      apiKey: data["apiKey"],
      date: DateTime.parse(data["date"]),
      lastUsageStatus: data["lastUsageStatus"],
    );
  }

  factory AccountModel.fromLogDatas(List<LogModelData> logDatas,
      {required String nameKey}) {
    final email = logDatas
        .firstWhere((e) => e.dataKey == "email",
            orElse: () => LogModelData(dataKey: "", dataValue: ""))
        .dataValue;
    final password = logDatas
        .firstWhere((e) => e.dataKey == "password",
            orElse: () => LogModelData(dataKey: "", dataValue: ""))
        .dataValue;
    final token = logDatas
        .firstWhere((e) => e.dataKey == "token",
            orElse: () => LogModelData(dataKey: "", dataValue: ""))
        .dataValue;
    final manual = logDatas
        .firstWhere((e) => e.dataKey == "manual",
            orElse: () => LogModelData(dataKey: "", dataValue: ""))
        .dataValue;

    final refreshToken = logDatas
        .firstWhere((e) => e.dataKey == "refreshToken",
            orElse: () => LogModelData(dataKey: "", dataValue: ""))
        .dataValue;
    final apiKey = logDatas
        .firstWhere((e) => e.dataKey == "apiKey",
            orElse: () => LogModelData(dataKey: "", dataValue: ""))
        .dataValue;

    return AccountModel(
      type: nameKey == "cursor_auth" || nameKey == "cursor_manual_auth"
          ? AccountType.cursor
          : nameKey == "windsurf_auth"
              ? AccountType.windsurf
              : AccountType.other,
      email: email,
      password: password,
      cookieToken: token,
      isManualAdded: manual == "true",
      refreshToken: refreshToken,
      apiKey: apiKey,
      date: DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "type": type.name,
      "email": email,
      "password": password,
      "token": cookieToken,
      "limit": limit,
      "date": date.toIso8601String(),
      "name": type.name,
      "image": type.image,
      "refreshToken": refreshToken,
      "apiKey": apiKey,
      "manual": isManualAdded,
      "lastUsageStatus": lastUsageStatus,
    };
  }

  factory AccountModel.fromJson(Map<String, dynamic> json,
      {required String name}) {
    return AccountModel(
      type: name == "Cursor"
          ? AccountType.cursor
          : name == "Windsurf"
              ? AccountType.windsurf
              : AccountType.other,
      password: json["password"],
      email: json["email"],
      cookieToken: json['token'],
      refreshToken: json['refreshToken'],
      apiKey: json['apiKey'],
      date: DateTime.parse(json['created_at']),
    );
  }
}
