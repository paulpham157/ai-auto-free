import 'package:flutter/foundation.dart';

class UserInfoModel extends ChangeNotifier {
  final String uuid;
  int _credits;

  UserInfoModel({required this.uuid, required int credits})
      : _credits = credits;

  int get credits => _credits;

  set credits(int value) {
    if (_credits != value) {
      _credits = value;
      notifyListeners();
    }
  }

  factory UserInfoModel.fromJson(Map<String, dynamic> json) {
    return UserInfoModel(uuid: json['id'], credits: json['credits']);
  }
}
