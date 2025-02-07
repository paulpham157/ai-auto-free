class ServicesModel {
  final List<FeatureModel> features;
  final List<String> needs;
  final AboutModel about;
  final List<String> dependencies;

  ServicesModel({
    required this.features,
    required this.needs,
    required this.about,
    required this.dependencies,
  });


  factory ServicesModel.fromJson(Map<String, dynamic> json) {
    return ServicesModel(
      features: (json['features'] as List)
          .map((e) => FeatureModel.fromJson(e))
          .toList(),
      needs: (json['needs'] as List).map((e) => e.toString()).toList(),
      about: AboutModel.fromJson(json['about']),
      dependencies: (json['dependencies'] as List).map((e) => e.toString()).toList(),
    );
  }
}


class FeatureModel {
  final String name;
  final bool isActive;
  final String fileName;
  final FeatureAddonModel? addon;

  FeatureModel({
    required this.name,
    required this.isActive,
    required this.fileName,
    this.addon,
  });

  factory FeatureModel.fromJson(Map<String, dynamic> json) {
    return FeatureModel(
      name: json['name'],
      isActive: json['isActive'],
      fileName: json['fileName'],
      addon: json['addon'] != null
          ? FeatureAddonModel.fromJson(json['addon'])
          : null,
    );
  }
}

class FeatureAddonModel {
  final String name;
  final String? nameKey;
  final String fileName;
  final List<String> arguments;
  final String? hint;

  FeatureAddonModel({
    required this.name,
    required this.nameKey,
    required this.fileName,
    this.hint,
    this.arguments = const [],
  });

  factory FeatureAddonModel.fromJson(Map<String, dynamic> json) {
    return FeatureAddonModel(
      name: json['name'],
      nameKey: json['nameKey'],
      fileName: json['fileName'],
      hint: json['hint'],
      arguments: json['arguments'] ?? const [],
    );
  }
}

class AboutModel {
  final String author;
  final String version;
  final String description;
  final int versionCode;
  final String repo;
  final String buyMeACoffee;
  final String btc;

  AboutModel({
    required this.author,
    required this.version,
    required this.description,
    required this.versionCode,
    required this.repo,
    required this.buyMeACoffee,
    required this.btc,
  });

  factory AboutModel.fromJson(Map<String, dynamic> json) {
    return AboutModel(
      author: json['author'],
      version: json['version'],
      versionCode: json['version_code'],
      description: json['description'],
      repo: json['repo'],
      buyMeACoffee: json['buymeacoffee'],
      btc: json['btc'],
    );
  }
}
