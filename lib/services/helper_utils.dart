import 'dart:developer';
import 'dart:io';

import 'package:ai_auto_free/common/constants.dart';
import 'package:ai_auto_free/features/settings/settings_provider.dart';
import 'package:process_run/process_run.dart';
import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';

import 'user_settings.dart';

class HelperUtils {
  static final Shell _shell = Shell(
    environment: Platform.environment,
    includeParentEnvironment: true,
    runInShell: true,
  );

  static final _dio = Dio();

  static String? parseCursorToken(String? rawToken) {
    try {
      return rawToken?.split('%3A%3A').last;
    } catch (e) {
      return null;
    }
  }

  static Future<void> killCursorProcesses() async {
    if (!Constants.killProcessInDebugMode) return;
    try {
      if (Platform.isWindows) {
        await _shell.run('taskkill /F /IM Cursor.exe');
      } else {
        await _shell.run('pkill -f Cursor');
      }
    } catch (e) {
      log("Cursor process not found");
    }
  }

  static Future<String> getCursorUsage(String rawToken) async {
    if (rawToken.isEmpty) return '-';

    final userId = _getCursorUserId(rawToken);
    if (userId == null) return '-';

    try {
      final response = await _dio.get(
        'https://www.cursor.com/api/usage',
        queryParameters: {'user': userId},
        options: Options(
          headers: {
            'Cookie': 'WorkosCursorSessionToken=$rawToken',
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
            'Accept': '*/*',
            'Accept-Language': 'tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.cursor.com/settings',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Te': 'trailers',
          },
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final usageInfo = <String, String>{};

        data.forEach((model, stats) {
          if (stats is Map<String, dynamic> &&
              (stats['numRequests'] ?? 0) > 0) {
            final renamedModel = model
                .toString()
                .replaceAll('gpt-4', 'Premium')
                .replaceAll('gpt-3.5-turbo', 'Free');
            usageInfo[renamedModel] =
                '${stats['numRequests']}/${stats['maxRequestUsage']}';
          }
        });

        return usageInfo.isEmpty
            ? 'new'
            : usageInfo.entries.map((e) => '${e.key}: ${e.value}').join('\n');
      }
      return '+';
    } catch (e) {
      log(e.toString());
      return '-';
    }
  }

  static String? _getCursorUserId(String rawToken) {
    try {
      return rawToken.split('%3A%3A')[0];
    } catch (e) {
      return null;
    }
  }

  static Future<void> launchURL(String? url) async {
    if (url != null && await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }

  static List<String> getMailScriptArguments() {
    final arguments = <String>[];
    arguments.add(UserSettings.getBrowserVisibilityArgument());
    final emailValidatorType = UserSettings.getEmailValidatorType();
    if (emailValidatorType == EmailValidatorType.imap) {
      arguments.add("--email-verifier imap");
      arguments.add("--imap-server ${UserSettings.getImapServer()}");
      arguments.add("--imap-port ${UserSettings.getImapPort()}");
      arguments.add("--imap-user ${UserSettings.getImapUser()}");
      arguments.add('--imap-pass "${UserSettings.getImapPassword()}"');
    }
    return arguments;
  }
}
