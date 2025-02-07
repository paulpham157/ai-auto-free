import 'dart:convert';

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
  final String password;
  final String? token;
  String? limit;
  final DateTime date;
  AccountModel({
    required this.type,
    required this.email,
    required this.password,
    this.token,
    this.limit,
    required this.date,
  });

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
      token: data["token"],
      date: DateTime.now(),
    );
  }
  factory AccountModel.fromLogDatas(List<LogModelData> logDatas,
      {required String name}) {
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

    return AccountModel(
      type: name == "Cursor"
          ? AccountType.cursor
          : name == "Windsurf"
              ? AccountType.windsurf
              : AccountType.other,
      email: email,
      password: password,
      token: token,
      date: DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "type": type.name,
      "email": email,
      "password": password,
      "token": token,
      "limit": limit,
      "date": date.toIso8601String(),
      "name": type.name,
      "image": type.image,
    };
  }
}
