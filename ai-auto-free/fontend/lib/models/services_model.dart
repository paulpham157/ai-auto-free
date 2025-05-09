import 'package:ai_auto_free/services/helper_utils.dart';

class ServicesModel {
  final List<FeatureModel> features;
  final List<String> needs;
  final List<String> dependencies;
  final List<NotificationModel> notifications;
  final String repository;
  final String dailyLoginCount;

  ServicesModel({
    required this.features,
    required this.needs,
    required this.dependencies,
    required this.notifications,
    required this.repository,
    required this.dailyLoginCount,
  });

  factory ServicesModel.fromJson(Map<String, dynamic> json) {
    final features = (json['features'] as List)
        .map((e) => FeatureModel.fromJson(e))
        .where((e) => e.isActive || (e.addon != null && e.addon!.isActive))
        .toList();

    return ServicesModel(
      features: features,
      needs: (json['needs'] as List).map((e) => e.toString()).toList(),
      dependencies:
          (json['dependencies'] as List).map((e) => e.toString()).toList(),
      notifications: (json['notifications'] as List)
          .map((e) => NotificationModel.fromJson(e))
          .toList(),
      repository: json['repository'],
      dailyLoginCount: json['dailyLoginCount'].toString(),
    );
  }
}

class FeatureModel {
  final String name;
  final String nameKey;
  final bool isActive;
  final String fileName;
  final List<String> arguments;
  final String hint;
  final int credit;
  final FeatureAddonModel? addon;
  final bool pool;
  int poolAccountCount;

  FeatureModel({
    required this.name,
    required this.nameKey,
    required this.isActive,
    required this.fileName,
    required this.hint,
    this.addon,
    this.credit = 0,
    this.arguments = const [],
    required this.pool,
    this.poolAccountCount = 0,
  });

  factory FeatureModel.fromJson(Map<String, dynamic> json) {
    return FeatureModel(
      name: json['name'],
      nameKey: json['nameKey'],
      isActive: json['isActive'],
      fileName: json['fileName'],
      credit: json['credit'] ?? 0,
      arguments:
          json['args'] != null ? List<String>.from(json['args']) : const [],
      hint: json['hint'][HelperUtils.currentLanguageCode],
      addon: json['addon'] != null
          ? FeatureAddonModel.fromJson(json['addon'])
          : null,
      pool: json['pool'] ?? false,
      poolAccountCount: json['poolAccountCount'] ?? 0,
    );
  }
}

class FeatureAddonModel {
  final String name;
  final bool isActive;
  final String nameKey;
  final String fileName;
  final List<String> arguments;
  final int credit;
  final String? hint;

  FeatureAddonModel({
    required this.name,
    required this.nameKey,
    required this.fileName,
    this.hint,
    this.arguments = const [],
    this.isActive = true,
    this.credit = 0,
  });

  factory FeatureAddonModel.fromJson(Map<String, dynamic> json) {
    return FeatureAddonModel(
      name: json['name'],
      nameKey: json['nameKey'],
      fileName: json['fileName'],
      credit: json['credit'] ?? 0,
      hint: json['hint'][HelperUtils.currentLanguageCode],
      arguments:
          json['args'] != null ? List<String>.from(json['args']) : const [],
      isActive: json['isActive'] ?? true,
    );
  }
}

class NotificationModel {
  final int id;
  final String message;

  NotificationModel({
    required this.id,
    required this.message,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'],
      message: json['message'][HelperUtils.currentLanguageCode],
    );
  }
}
