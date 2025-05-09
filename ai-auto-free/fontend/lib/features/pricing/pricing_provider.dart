import 'package:ai_auto_free/common/base_provider.dart';
import 'package:ai_auto_free/models/pricing_model.dart';
import 'package:ai_auto_free/services/pricing_service.dart';

class PricingProvider extends BaseProvider {
  PricingModel? _pricingModel;
  PricingModel? get pricingModel => _pricingModel;

  String? _error;
  String? get error => _error;

  double _selectedCredits = 0;
  double get selectedCredits => _selectedCredits;

  void setSelectedCredits(double value) {
    _selectedCredits = value;
    notifyListeners();
  }

  PricingProvider() {
    _fetchPricing();
  }

  void _fetchPricing() async {
    try {
      _pricingModel = await PricingService.instance.getPricing();
      _selectedCredits = 15;
    } catch (e) {
      _error = e.toString();
    } finally {
      notifyListeners();
    }
  }
}
