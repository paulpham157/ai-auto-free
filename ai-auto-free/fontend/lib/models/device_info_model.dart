import 'dart:convert';

class DeviceInfoModel {
  final String deviceName;
  final String deviceId;
  final String macAddress;
  final String osName;
  final String osVersion;
  final String locale;
  final String timezone;
  final String ipAddress;
  final Map<String, dynamic>? additionalInfo;

  DeviceInfoModel({
    required this.deviceName,
    required this.deviceId,
    required this.macAddress,
    required this.osName,
    required this.osVersion,
    required this.locale,
    required this.timezone,
    this.ipAddress = '',
    this.additionalInfo,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> json = {
      'computerName': deviceName,
      'deviceId': deviceId,
      'macAddress': macAddress,
      'osName': osName,
      'locale': locale,
      'ipAddress': ipAddress,
    };

    if (additionalInfo != null) {
      if (additionalInfo!.containsKey('productName')) {
        json['productName'] = additionalInfo!['productName'];
      }
      if (additionalInfo!.containsKey('numberOfCores')) {
        json['numberOfCores'] = additionalInfo!['numberOfCores'];
      }
      if (additionalInfo!.containsKey('systemMemoryInMegabytes')) {
        json['systemMemoryInMegabytes'] =
            additionalInfo!['systemMemoryInMegabytes'];
      }
      if (additionalInfo!.containsKey('userName')) {
        json['username'] = additionalInfo!['userName'];
      }
    }

    return json;
  }

  Map<String, dynamic> toFullJson() {
    return {
      'deviceName': deviceName,
      'deviceId': deviceId,
      'macAddress': macAddress,
      'osName': osName,
      'osVersion': osVersion,
      'locale': locale,
      'timezone': timezone,
      'ipAddress': ipAddress,
      if (additionalInfo != null) 'additionalInfo': additionalInfo,
    };
  }

  factory DeviceInfoModel.fromJson(Map<String, dynamic> json) {
    return DeviceInfoModel(
      deviceName: json['deviceName'] ?? json['computerName'] ?? '',
      deviceId: json['deviceId'] ?? '',
      macAddress: json['macAddress'] ?? '',
      osName: json['osName'] ?? '',
      osVersion: json['osVersion'] ?? '',
      locale: json['locale'] ?? '',
      timezone: json['timezone'] ?? '',
      ipAddress: json['ipAddress'] ?? '',
      additionalInfo: json['additionalInfo'],
    );
  }

  String toJsonString() => jsonEncode(toJson());

  String toFullJsonString() => jsonEncode(toFullJson());

  @override
  String toString() {
    return 'DeviceInfoModel(deviceName: $deviceName, deviceId: $deviceId, macAddress: $macAddress, osName: $osName, osVersion: $osVersion, locale: $locale, timezone: $timezone, ipAddress: $ipAddress)';
  }
}
