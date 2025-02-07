enum LogType {
  info,
  error,
  success,
}

class LogModelData {
  final String dataValue;
  final String dataKey;

  LogModelData({required this.dataValue, required this.dataKey});
}

class LogModel {
  final String message;

  String? translatedMessage;
  LogType type;
  final DateTime time;
  List<LogModelData>? logDatas;

  LogModel({
    required this.message,
    this.translatedMessage,
    required this.type,
    required this.time,
    this.logDatas,
  });

  factory LogModel.fromJson(Map<String, dynamic> json) {
    return LogModel(
      message: (json['error'] ?? json['status'] ?? json['message']).toString(),
      type: "${json["status"]}".toLowerCase() == "ok"
          ? LogType.success
          : json.keys.contains("error")
              ? LogType.error
              : LogType.info,
      time: DateTime.now(),
      logDatas: json.keys.contains('data')
          ? (json['data'] as Map)
              .entries
              .map((e) => LogModelData(
                    dataValue: e.value.toString(),
                    dataKey: e.key.toString(),
                  ))
              .toList()
          : null,
    );
  }

  String get logData {
    return logDatas
            ?.map((e) => e.dataKey != "token" ? e.dataValue : "")
            .join(" ") ??
        "";
  }
}
