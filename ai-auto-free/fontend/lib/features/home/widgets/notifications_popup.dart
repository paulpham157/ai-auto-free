import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/models/services_model.dart';
import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:ai_auto_free/services/python/run_py.dart';
import 'package:ai_auto_free/services/user_settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';

class NotificationButton extends StatelessWidget {
  final VoidCallback? onStateChanged;

  const NotificationButton({
    super.key,
    this.onStateChanged,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    if (RunPy.instance.notifications.isEmpty) {
      return const SizedBox.shrink();
    }

    return PopupMenuButton(
      position: PopupMenuPosition.under,
      tooltip: S.of(context).show_notifications,
      offset: const Offset(0, 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          IconButton(
            onPressed: null,
            icon: Icon(
              Icons.notifications,
              color: colorScheme.surfaceContainer,
              size: 26,
            ),
          ),
          Positioned(
            top: 8,
            right: 8,
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: colorScheme.error,
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: colorScheme.shadow.withAlpha(20),
                    blurRadius: 2,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              constraints: const BoxConstraints(
                minWidth: 16,
                minHeight: 16,
              ),
              child: Text(
                RunPy.instance.notifications.length.toString(),
                style: TextStyle(
                  color: colorScheme.onError,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ),
      itemBuilder: (context) => [
        PopupMenuItem(
          enabled: false,
          child: Notifications(
            notifications: RunPy.instance.notifications,
            onClear: onStateChanged,
          ),
        ),
      ],
    );
  }
}

class Notifications extends StatelessWidget {
  final List<NotificationModel> notifications;
  final VoidCallback? onClear;
  const Notifications({super.key, required this.notifications, this.onClear});

  // Link tespiti için regex
  static final RegExp _urlRegExp = RegExp(
    r'https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)',
    caseSensitive: false,
  );

  // Link tespiti ve tıklanabilir hale getirme
  Widget _buildRichText(String text, BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final List<InlineSpan> spans = [];
    int lastMatchEnd = 0;

    for (final match in _urlRegExp.allMatches(text)) {
      // Önceki metin
      if (match.start > lastMatchEnd) {
        spans.add(TextSpan(
          text: text.substring(lastMatchEnd, match.start),
          style: TextStyle(
            fontSize: 12,
            color: colorScheme.onSurface.withAlpha(220),
          ),
        ));
      }

      // Link
      final url = text.substring(match.start, match.end);
      spans.add(
        TextSpan(
          text: url,
          style: TextStyle(
            fontSize: 12,
            color: colorScheme.primary,
            decoration: TextDecoration.underline,
          ),
          recognizer: TapGestureRecognizer()
            ..onTap = () => HelperUtils.launchURL(url),
        ),
      );

      lastMatchEnd = match.end;
    }

    // Kalan metin
    if (lastMatchEnd < text.length) {
      spans.add(TextSpan(
        text: text.substring(lastMatchEnd),
        style: TextStyle(
          fontSize: 12,
          color: colorScheme.onSurface.withAlpha(220),
        ),
      ));
    }

    return RichText(text: TextSpan(children: spans));
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return SizedBox(
      width: 320,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Başlık
          Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  S.of(context).notifications,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onSurface,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    UserSettings.markNotificationAsRead(
                        notifications.map((e) => e.id).toList());
                    RunPy.instance.services?.notifications.clear();
                    Navigator.pop(context);
                    onClear?.call();
                  },
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.all(8),
                    minimumSize: Size.zero,
                  ),
                  child: Text(
                    S.of(context).clear_notifications,
                    style: TextStyle(fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Bildirim Listesi
          ConstrainedBox(
            constraints: const BoxConstraints(
              maxHeight: 300,
              minHeight: 100,
            ),
            child: notifications.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.notifications_none,
                          size: 32,
                          color: colorScheme.onSurface.withAlpha(100),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          S.of(context).no_notifications,
                          style: TextStyle(
                            fontSize: 13,
                            color: colorScheme.onSurface.withAlpha(140),
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: notifications.length,
                    shrinkWrap: true,
                    padding: EdgeInsets.zero,
                    itemBuilder: (context, index) {
                      final notification = notifications[index];
                      return ListTile(
                        dense: true,
                        leading: CircleAvatar(
                          radius: 16,
                          backgroundColor: colorScheme.primaryContainer,
                          child: Icon(
                            Icons.notification_important,
                            size: 16,
                            color: colorScheme.primary,
                          ),
                        ),
                        subtitle: _urlRegExp.hasMatch(notification.message)
                            ? _buildRichText(notification.message, context)
                            : Text(
                                notification.message,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: colorScheme.onSurface.withAlpha(220),
                                ),
                              ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
