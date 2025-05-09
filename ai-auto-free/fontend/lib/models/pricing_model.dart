import 'package:ai_auto_free/common/constants.dart';
import 'package:ai_auto_free/services/helper_utils.dart';

class PricingModel {
  final double creditPrice;
  final String name;
  final String image;
  final String url;
  final String message;
  final List<PricingSocialModel> socials;

  PricingModel({
    required this.creditPrice,
    required this.name,
    required this.image,
    required this.url,
    required this.message,
    required this.socials,
  });

  factory PricingModel.fromJson(Map<String, dynamic> json) {
    return PricingModel(
      creditPrice: json['credit_price'],
      name: json['name'],
      image: json['image'].contains("http")
          ? json['image']
          : "${Constants.baseUrl}${json['image']}",
      url: json['url'],
      message: json['msg'][HelperUtils.currentLanguageCode] ?? "",
      socials: (json['socials'] as List)
          .map((e) => PricingSocialModel.fromJson(e))
          .toList(),
    );
  }
}

class PricingSocialModel {
  final String name;
  final String url;
  final String image;

  PricingSocialModel({
    required this.name,
    required this.url,
    required this.image,
  });

  factory PricingSocialModel.fromJson(Map<String, dynamic> json) {
    return PricingSocialModel(
      name: json['name'],
      url: json['url'],
      image: json['image'].contains("http")
          ? json['image']
          : "${Constants.baseUrl}${json['image']}",
    );
  }
}
