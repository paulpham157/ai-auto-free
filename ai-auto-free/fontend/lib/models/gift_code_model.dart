import 'dart:convert';

class GiftCodeModel {
  final String code;
  final int credits;
  final DateTime createdAt;


  GiftCodeModel({
    required this.code,
    required this.credits,
    required this.createdAt,
  });

  factory GiftCodeModel.fromJson(Map<String, dynamic> json) {
    return GiftCodeModel(
      code: json['code'],
      credits: json['credits'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'credits': credits,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  String toJsonString() {
    return jsonEncode(toJson());
  }

  factory GiftCodeModel.fromJsonString(String jsonString) {
    return GiftCodeModel.fromJson(jsonDecode(jsonString));
  }
}
