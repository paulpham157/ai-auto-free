import 'package:ai_auto_free/features/gift_code/gift_code_provider.dart';
import 'package:ai_auto_free/features/home/home_provider.dart';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/models/gift_code_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

class GiftCodeDialog extends StatefulWidget {
  final HomeProvider homeProvider;

  const GiftCodeDialog({
    super.key,
    required this.homeProvider,
  });

  @override
  State<GiftCodeDialog> createState() => _GiftCodeDialogState();
}

class _GiftCodeDialogState extends State<GiftCodeDialog>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return ChangeNotifierProvider(
      create: (_) {
        final provider = GiftCodeProvider();
        // Krediler güncellendiğinde HomeProvider'ı da güncelle
        provider.onCreditsUpdated = widget.homeProvider.refreshCredits;
        return provider;
      },
      child: Consumer<GiftCodeProvider>(
        builder: (context, provider, child) {
          return Dialog(
            insetPadding: const EdgeInsets.symmetric(horizontal: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            elevation: 0,
            backgroundColor: colorScheme.surface,
            child: Container(
              width: 520,
              constraints: const BoxConstraints(maxWidth: 520),
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: colorScheme.primaryContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          Icons.card_giftcard,
                          color: colorScheme.primary,
                          size: 28,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        S.of(context).gift_code,
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: colorScheme.onSurface,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: Icon(Icons.close,
                            color: colorScheme.onSurfaceVariant),
                        onPressed: () => Navigator.of(context).pop(),
                        style: IconButton.styleFrom(
                          backgroundColor: colorScheme.surfaceContainerHighest
                              .withAlpha(128),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Tab Bar
                  Container(
                    decoration: BoxDecoration(
                      color: colorScheme.surfaceContainerHighest.withAlpha(128),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: TabBar(
                      controller: _tabController,
                      tabs: [
                        Tab(
                          icon: const Icon(Icons.add_circle_outline),
                          text: S.of(context).create_gift_code,
                        ),
                        Tab(
                          icon: const Icon(Icons.redeem),
                          text: S.of(context).redeem_gift_code,
                        ),
                      ],
                      labelColor: colorScheme.primary,
                      unselectedLabelColor: colorScheme.onSurfaceVariant,
                      indicatorSize: TabBarIndicatorSize.tab,
                      dividerColor: Colors.transparent,
                      indicator: BoxDecoration(
                        color: colorScheme.primaryContainer.withAlpha(128),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.all(4),
                    ),
                  ),

                  // Tab Content
                  SizedBox(
                    height: 380, // Yüksekliği biraz artırdım
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        // Create Tab
                        _buildCreateTab(context, provider),

                        // Redeem Tab
                        _buildRedeemTab(context, provider),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCreateTab(BuildContext context, GiftCodeProvider provider) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.only(top: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Mevcut Krediler
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: colorScheme.primaryContainer.withAlpha(77),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: colorScheme.primary.withAlpha(51)),
            ),
            child: Row(
              children: [
                Icon(Icons.monetization_on_outlined,
                    color: colorScheme.primary),
                const SizedBox(width: 12),
                Text(
                  '${S.of(context).remaining_credits}: ${provider.remainingCredits}',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Kredi girişi
          TextField(
            controller: provider.creditsController,
            decoration: InputDecoration(
              labelText: S.of(context).credits_amount,
              hintText: S.of(context).enter_credits_amount,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: colorScheme.outline),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: colorScheme.outline),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: colorScheme.primary, width: 2),
              ),
              prefixIcon: Icon(Icons.credit_score, color: colorScheme.primary),
              filled: true,
              fillColor: colorScheme.surfaceContainerHighest.withAlpha(77),
            ),
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          ),
          const SizedBox(height: 12),

          // Hata ve başarı mesajları
          if (provider.errorMessage.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: colorScheme.errorContainer.withAlpha(179),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.error_outline, color: colorScheme.error, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      provider.errorMessage,
                      style: TextStyle(color: colorScheme.error, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          if (provider.successMessage.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: colorScheme.primaryContainer.withAlpha(179),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.check_circle_outline,
                      color: colorScheme.primary, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      provider.successMessage,
                      style:
                          TextStyle(color: colorScheme.primary, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 12),

          // Oluştur butonu
          SizedBox(
            width: double.infinity,
            height: 46,
            child: FilledButton.icon(
              onPressed:
                  provider.isCreatingCode ? null : provider.createGiftCode,
              icon: provider.isCreatingCode
                  ? SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: colorScheme.onPrimary,
                      ),
                    )
                  : const Icon(Icons.add, size: 20),
              label: Text(
                S.of(context).generate_code,
                style: const TextStyle(fontSize: 15),
              ),
              style: FilledButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Oluşturulan kodların listesi
          Expanded(
            child: provider.createdCodes.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.card_giftcard_outlined,
                          size: 40,
                          color: colorScheme.onSurfaceVariant.withAlpha(128),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          S.of(context).no_gift_codes_created,
                          style: TextStyle(
                            color: colorScheme.onSurfaceVariant.withAlpha(179),
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: provider.createdCodes.length,
                    padding: const EdgeInsets.only(top: 4),
                    itemBuilder: (context, index) {
                      final code =
                          provider.createdCodes.reversed.toList()[index];
                      return _buildGiftCodeItem(context, code);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildRedeemTab(BuildContext context, GiftCodeProvider provider) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.only(top: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Kod giriş alanı
          TextField(
            controller: provider.redeemCodeController,
            decoration: InputDecoration(
              labelText: S.of(context).gift_code,
              hintText: 'XXXX-XXXX',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: colorScheme.outline),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: colorScheme.outline),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: colorScheme.primary, width: 2),
              ),
              prefixIcon: Icon(Icons.vpn_key, color: colorScheme.primary),
              filled: true,
              fillColor: colorScheme.surfaceContainerHighest.withAlpha(77),
            ),
            onChanged: (value) {
              // XXXX-XXXX formatı için otomatik tire ekleme
              if (value.length == 4 && !value.contains('-')) {
                provider.redeemCodeController.text = '$value-';
                provider.redeemCodeController.selection =
                    TextSelection.fromPosition(
                  TextPosition(
                      offset: provider.redeemCodeController.text.length),
                );
              }
            },
          ),
          const SizedBox(height: 12),

          // Hata ve başarı mesajları
          if (provider.errorMessage.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: colorScheme.errorContainer.withAlpha(179),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.error_outline, color: colorScheme.error, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      provider.errorMessage,
                      style: TextStyle(color: colorScheme.error, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          if (provider.successMessage.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: colorScheme.primaryContainer.withAlpha(179),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.check_circle_outline,
                      color: colorScheme.primary, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      provider.successMessage,
                      style:
                          TextStyle(color: colorScheme.primary, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 12),

          // Kullan butonu
          SizedBox(
            width: double.infinity,
            height: 46,
            child: FilledButton.icon(
              onPressed:
                  provider.isRedeemingCode ? null : provider.redeemGiftCode,
              icon: provider.isRedeemingCode
                  ? SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: colorScheme.onPrimary,
                      ),
                    )
                  : const Icon(Icons.redeem, size: 20),
              label: Text(
                S.of(context).redeem_code,
                style: const TextStyle(fontSize: 15),
              ),
              style: FilledButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),

          const SizedBox(height: 20),

          // Bilgilendirme
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: colorScheme.surfaceContainerHighest.withAlpha(128),
              borderRadius: BorderRadius.circular(12),
              border:
                  Border.all(color: colorScheme.outlineVariant.withAlpha(128)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: colorScheme.primary,
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      S.of(context).gift_code_info_title,
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: colorScheme.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  S.of(context).gift_code_info_description,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGiftCodeItem(BuildContext context, GiftCodeModel code) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final dateFormat = DateFormat('dd.MM.yyyy HH:mm');

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: colorScheme.outlineVariant.withAlpha(128)),
      ),
      color: colorScheme.surfaceContainerHighest.withAlpha(77),
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    code.code,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                      color: colorScheme.primary,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: Icon(Icons.copy, size: 16, color: colorScheme.primary),
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: code.code));
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(S.of(context).copied_to_clipboard),
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    );
                  },
                  style: IconButton.styleFrom(
                    backgroundColor:
                        colorScheme.primaryContainer.withAlpha(128),
                    padding: const EdgeInsets.all(6),
                    minimumSize: const Size(32, 32),
                  ),
                ),
                const Spacer(),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: colorScheme.secondaryContainer,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.credit_score,
                        size: 14,
                        color: colorScheme.secondary,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        '${code.credits}',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: colorScheme.secondary,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '${S.of(context).created_at}: ${dateFormat.format(code.createdAt)}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
