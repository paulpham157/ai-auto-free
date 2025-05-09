class UpdateResponse {
  final String version;
  final String changes;
  final Map<String, String> url;
  final bool mandatory;

  UpdateResponse({
    required this.version,
    required this.changes,
    required this.url,
    required this.mandatory,
  });

  factory UpdateResponse.fromJson(Map<String, dynamic> json) {
    return UpdateResponse(
      version: json['version'] ?? '1.0.0',
      changes: json['changes'] ?? '',
      url: Map<String, String>.from(json['url'] ?? {}),
      mandatory: json['mandatory'] ?? false,
    );
  }
}
