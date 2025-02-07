import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../models/account_model.dart';

class AccountInfo extends StatefulWidget {
  final AccountModel account;
  final VoidCallback? onClose;
  final VoidCallback? onSwitchAccount;
  const AccountInfo({
    super.key,
    required this.account,
    this.onClose,
    this.onSwitchAccount,
  });

  @override
  State<AccountInfo> createState() => _AccountInfoState();
}

class _AccountInfoState extends State<AccountInfo> {
  String? _isCopiedText;

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

  @override
  void initState() {
    _getUsage();
    super.initState();
  }

  void _getUsage() async {
    final usage = await HelperUtils.getCursorUsage(widget.account.token!);
    widget.account.limit = usage;
    setState(() {});
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
                  if (widget.account.type == AccountType.cursor)
                    FilledButton.tonalIcon(
                      onPressed: widget.onSwitchAccount,
                      icon: const Icon(Icons.switch_access_shortcut_outlined),
                      label: Text(S.of(context).switch_cursor_account),
                    ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.black87),
                    onPressed: widget.onClose,
                  )
                ],
              )
            ],
          ),
          const SizedBox(height: 10),
          _buildDetailRow(
              context, S.of(context).type, widget.account.type.name),
          _buildDetailRow(context, S.of(context).email, widget.account.email),
          _buildDetailRow(
              context, S.of(context).password, widget.account.password),
          _buildDetailRow(
              context, S.of(context).created, _formatDate(widget.account.date)),
          _buildDetailRow(context, S.of(context).limit, widget.account.limit),
          _buildDetailRow(context, S.of(context).token, widget.account.token),
        ],
      ),
    );
  }

  Widget _buildDetailRow(BuildContext context, String label, String? value) {
    if (value == null) return Container();
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
                  child: TextFormField(
                    initialValue: value,
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
                          _isCopiedText != null && _isCopiedText == value
                              ? Icons.check_circle
                              : Icons.copy,
                          size: 20,
                          color: Theme.of(context)
                              .colorScheme
                              .primary
                              .withAlpha(200),
                        ),
                        onPressed: () => _copyToClipboard(value),
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                      ),
                    ),
                    style: TextStyle(color: Colors.black87, fontSize: 14),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) =>
      '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
}
