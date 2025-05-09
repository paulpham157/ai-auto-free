import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:ai_auto_free/services/user_settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../models/account_model.dart';

class AccountInfo extends StatefulWidget {
  final AccountModel account;
  final VoidCallback? onClose;
  final VoidCallback? onSwitchAccount;
  final VoidCallback? onTestAccount;
  final VoidCallback? onUsageUpdated;
  const AccountInfo({
    super.key,
    required this.account,
    this.onClose,
    this.onSwitchAccount,
    this.onTestAccount,
    this.onUsageUpdated,
  });

  @override
  State<AccountInfo> createState() => _AccountInfoState();
}

class _AccountInfoState extends State<AccountInfo> {
  String? _isCopiedText;
  late TextEditingController _tokenController;
  late TextEditingController _typeController;
  late TextEditingController _emailController;
  late TextEditingController _passwordController;
  late TextEditingController _createdController;
  late TextEditingController _limitController;
  final bool _isInvalid = false;

  @override
  void initState() {
    super.initState();
    _initControllers();
    _checkTokenExpire();
    _getUsage();
  }

  void _initControllers() {
    _tokenController = TextEditingController(text: widget.account.cookieToken);
    _typeController = TextEditingController(
      text: widget.account.isManualAdded
          ? "${widget.account.type.name} (${S.current.manual})"
          : widget.account.type.name,
    );
    _emailController = TextEditingController(text: widget.account.email);
    _passwordController = TextEditingController(text: widget.account.password);
    _createdController =
        TextEditingController(text: formatDate(widget.account.date));
    _limitController = TextEditingController(text: widget.account.limit);
  }

  void _copyToClipboard(String text) {
    Clipboard.setData(ClipboardData(text: text));
    setState(() {
      _isCopiedText = text;
    });

    Future.delayed(const Duration(seconds: 1), () {
      setState(() {
        _isCopiedText = null;
      });
    });
  }

  void _getUsage() async {
    if (widget.account.type == AccountType.cursor) {
      if (widget.account.cookieToken == null ||
          widget.account.cookieToken!.isEmpty) {
        return;
      }

      if (!widget.account.cookieToken!.contains("%3A%3A")) return;
      String usage =
          await HelperUtils.getCursorUsage(widget.account.cookieToken!);

      /*      await HelperUtils.testCursorAccount(
        widget.account.token!,
        onValid: (isValid, message) {
          setState(() => _isInvalid = !isValid);
          if (!isValid) {
            usage = S.current.account_invalid;
            if (message == null) {
              usage = "Unknown";
            } else {
              usage += " ($message)";
            }
            if (!widget.account.isManualAdded) {
              HelperUtils.sendNotificationToTelegram(
                message: message ?? "Bilinmeyen hata",
                details: widget.account.email,
              );
            }
          }
        },
      ); */
      widget.account.limit = usage;
      _limitController.text = usage;

      // Kullanım bilgisini kaydet
      await UserSettings.updateAccountUsage(widget.account.email, usage);

      // Kullanım bilgisi güncellendiğinde callback'i çağır
      widget.onUsageUpdated?.call();

      if (context.mounted) {
        setState(() {});
      }
    }
  }

  void _checkTokenExpire() {
    if (widget.account.type == AccountType.windsurf) {
      final isExpire = !HelperUtils.checkJWTValid(widget.account.cookieToken!);
      if (isExpire) {
        _refreshToken();
      }
    }
  }

  void _refreshToken() async {
    final refreshToken = widget.account.refreshToken;
    final apiKey = widget.account.apiKey;
    if (refreshToken == null ||
        refreshToken.isEmpty ||
        apiKey == null ||
        apiKey.isEmpty) {
      return;
    }

    final newToken =
        await HelperUtils.refreshWindsurfToken(refreshToken, apiKey);
    if (newToken != null) {
      widget.account.cookieToken = newToken;
      _tokenController.text = newToken;
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(S.of(context).account_details,
                  style: Theme.of(context).textTheme.titleMedium),
              Row(
                children: [
                  if (widget.account.cookieToken != null &&
                      widget.account.cookieToken!.isNotEmpty)
                    if (widget.account.type == AccountType.windsurf ||
                        (widget.account.type == AccountType.cursor &&
                            widget.account.cookieToken!.contains("%3A%3A")))
                      FilledButton.tonalIcon(
                        onPressed: widget.account.cookieToken != null
                            ? widget.onSwitchAccount
                            : null,
                        icon: const Icon(Icons.switch_access_shortcut_outlined),
                        label: Text(widget.account.type == AccountType.cursor
                            ? S.of(context).open_cursor_account
                            : S.of(context).switch_cursor_account),
                      ),
                  const SizedBox(width: 10),
                  /*  if (widget.account.type == AccountType.cursor)
                    FilledButton.tonalIcon(
                      onPressed: widget.account.cookieToken != null
                          ? widget.onTestAccount
                          : null,
                      icon: const Icon(Icons.question_mark_outlined),
                      label: Text(S.of(context).test_cursor_account),
                    ), */
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.black87),
                    onPressed: widget.onClose,
                  )
                ],
              )
            ],
          ),
          const SizedBox(height: 10),
          buildDetailRow(context, S.of(context).type, _typeController),
          buildDetailRow(
            context,
            widget.account.isManualAdded
                ? S.of(context).user_id
                : S.of(context).email,
            _emailController,
          ),
          buildDetailRow(context, S.of(context).password, _passwordController),
          buildDetailRow(context, S.of(context).created, _createdController),
          buildDetailRow(
            context,
            S.of(context).limit,
            _limitController,
            textColor: _isInvalid ? Colors.red : Colors.blue,
          ),
          buildDetailRow(context, S.of(context).token, _tokenController),
        ],
      ),
    );
  }

  Widget buildDetailRow(
    BuildContext context,
    String label,
    TextEditingController controller, {
    Color? textColor,
  }) {
    if (controller.text.isEmpty) return Container();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 60,
            child: Text('$label: ', style: TextStyle(color: Colors.black54)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    readOnly: true,
                    decoration: InputDecoration(
                      isDense: true,
                      contentPadding:
                          EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: Colors.grey.shade200),
                      ),
                      fillColor: Colors.grey.shade50,
                      filled: true,
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: Colors.grey.shade400),
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isCopiedText != null &&
                                  _isCopiedText == controller.text
                              ? Icons.check_circle
                              : Icons.copy,
                          size: 20,
                          color: Theme.of(context)
                              .colorScheme
                              .primary
                              .withAlpha(200),
                        ),
                        onPressed: () => _copyToClipboard(controller.text),
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                      ),
                    ),
                    style: TextStyle(
                      color: textColor ?? Colors.black87,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String formatDate(DateTime date) =>
      '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
}
