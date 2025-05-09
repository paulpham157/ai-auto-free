import 'dart:developer';

import 'package:ai_auto_free/common/constants.dart';
import 'package:ai_auto_free/models/pricing_model.dart';
import 'package:dio/dio.dart';

class PricingService {
  PricingService._private();

  static final PricingService _instance = PricingService._private();

  static PricingService get instance => _instance;

  final _dio = Dio()..options.baseUrl = Constants.apiUrl;

  PricingModel? pricingModel;

  Future<PricingModel?> getPricing() async {
    try {
      if (pricingModel != null) return pricingModel!;
      final response = await _dio.get('/pricing');
      if (response.statusCode == 200) {
        pricingModel = PricingModel.fromJson(response.data);
        return pricingModel;
      }
      return null;
    } catch (e) {
      log(e.toString());
      rethrow;
    }
  }
}
