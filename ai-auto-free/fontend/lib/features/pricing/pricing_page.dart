import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/models/pricing_model.dart';
import 'package:ai_auto_free/services/auth_service.dart';
import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:ai_auto_free/widgets/custom_appbar.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'pricing_provider.dart';

enum ContactMethod {
  telegram(name: 'Telegram', icon: Icons.telegram, color: Color(0xFF0088cc)),
  github(
      name: 'Github Ticket',
      icon: Icons.bug_report_outlined,
      color: Color(0xFF333333)),
  instagram(
      name: 'Instagram',
      icon: Icons.camera_alt_outlined,
      color: Color(0xFFE1306C)),
  discord(name: 'Discord', icon: Icons.discord, color: Color(0xFF5865F2));

  final String name;
  final IconData icon;
  final Color color;

  const ContactMethod({
    required this.name,
    required this.icon,
    required this.color,
  });
}

class PricingPage extends StatefulWidget {
  const PricingPage({super.key});

  @override
  State<PricingPage> createState() => _PricingPageState();
}

class _PricingPageState extends State<PricingPage> {
  @override
  Widget build(BuildContext context) {
    // Ekran boyutlarını al
    final screenSize = MediaQuery.of(context).size;
    final isWideScreen = screenSize.width > 600;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: CustomAppBar.center(),
      body: Consumer<PricingProvider>(
        builder: (context, provider, child) {
          if (provider.error != null) {
            return Center(
              child: Text(
                provider.error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            );
          }

          if (provider.pricingModel == null) {
            return const Center(child: CircularProgressIndicator());
          }

          final pricingModel = provider.pricingModel!;

          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Başlık
                  Text(
                    S.of(context).pricing_title,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    pricingModel.message,
                    style: TextStyle(
                      fontSize: 14,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 30),

                  // Ana içerik - Responsive tasarım
                  Expanded(
                    child: isWideScreen
                        ? _buildWideLayout(context, provider, pricingModel)
                        : _buildNarrowLayout(context, provider, pricingModel),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // Geniş ekranlar için yan yana yerleşim (16:9 oranı için ideal)
  Widget _buildWideLayout(BuildContext context, PricingProvider provider,
      PricingModel pricingModel) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Sol taraf - Kredi seçimi
        Expanded(
          flex: 5,
          child: _buildCreditSelector(context, provider, pricingModel),
        ),
        const SizedBox(width: 16),
        // Sağ taraf - Kullanıcı ID'si ve İletişim
        Expanded(
          flex: 4,
          child: Column(
            children: [
              _buildUserIdSection(context),
              const SizedBox(height: 16),
              _buildContactSection(context, pricingModel),
            ],
          ),
        ),
      ],
    );
  }

  // Dar ekranlar için dikey yerleşim
  Widget _buildNarrowLayout(BuildContext context, PricingProvider provider,
      PricingModel pricingModel) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCreditSelector(context, provider, pricingModel),
          const SizedBox(height: 16),
          _buildUserIdSection(context),
          const SizedBox(height: 16),
          _buildContactSection(context, pricingModel),
        ],
      ),
    );
  }

  Widget _buildCreditSelector(BuildContext context, PricingProvider provider,
      PricingModel pricingModel) {
    final creditOptions = [
      7,
      10,
      15,
      20,
      25,
      30,
      35,
      40,
      45,
      50,
      60,
      70,
      80,
      100
    ];

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Kredi seçenekleri
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.credit_card_outlined,
                      size: 18,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      S.of(context).pricing_credits_amount,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Kredi seçenekleri butonları - Yeniden düzenlenmiş
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: creditOptions.map((credit) {
                    final isSelected = provider.selectedCredits == credit;

                    return InkWell(
                      onTap: () =>
                          provider.setSelectedCredits(credit.toDouble()),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        width: 60,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? Theme.of(context).colorScheme.primaryContainer
                              : Theme.of(context)
                                  .colorScheme
                                  .surfaceContainerHighest
                                  .withAlpha(128),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected
                                ? Theme.of(context).colorScheme.primary
                                : Colors.transparent,
                            width: 1.5,
                          ),
                        ),
                        child: Column(
                          children: [
                            Text(
                              "$credit",
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: isSelected
                                    ? Theme.of(context).colorScheme.primary
                                    : Theme.of(context).colorScheme.onSurface,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              S.of(context).credits,
                              style: TextStyle(
                                fontSize: 12,
                                color: Theme.of(context)
                                    .colorScheme
                                    .onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),

          // Fiyat gösterimi
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context)
                  .colorScheme
                  .surfaceContainerHighest
                  .withAlpha(128),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      S.of(context).pricing_total_price,
                      style: TextStyle(
                        fontSize: 14,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "\$${(provider.selectedCredits * pricingModel.creditPrice).toStringAsFixed(2)}",
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                  ],
                ),
                Text(
                  "${provider.selectedCredits.toInt()} ${S.of(context).credits}",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUserIdSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.person_outline,
                size: 18,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(width: 8),
              Text(
                S.of(context).your_id,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
              const Spacer(),
              IconButton(
                onPressed: () {
                  Clipboard.setData(ClipboardData(
                    text: SecureAuthStorage.instance.userInfo?.uuid ?? "",
                  ));
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      behavior: SnackBarBehavior.floating,
                      width: MediaQuery.of(context).size.width * 0.7,
                      duration: const Duration(milliseconds: 800),
                      content: Text(S.of(context).your_id_copied),
                      backgroundColor: Theme.of(context).colorScheme.secondary,
                    ),
                  );
                },
                icon: Icon(
                  Icons.copy_outlined,
                  size: 18,
                  color: Theme.of(context).colorScheme.primary,
                ),
                visualDensity: VisualDensity.compact,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(
                  minWidth: 36,
                  minHeight: 36,
                ),
                tooltip: S.of(context).pricing_payment_id_copy,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Theme.of(context)
                  .colorScheme
                  .surfaceContainerHighest
                  .withAlpha(128),
              borderRadius: BorderRadius.circular(8),
            ),
            child: SelectableText(
              SecureAuthStorage.instance.userInfo?.uuid ?? "",
              style: TextStyle(
                fontSize: 13,
                fontFamily: "monospace",
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            S.of(context).pricing_payment_id_note,
            style: TextStyle(
              fontSize: 12,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactSection(BuildContext context, PricingModel pricingModel) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(13),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.support_agent_outlined,
                  size: 18,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  S.of(context).pricing_contact,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              S.of(context).pricing_contact_message,
              style: TextStyle(
                fontSize: 14,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16),

            // İletişim butonları
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: pricingModel.socials.map((contact) {
                final contactMethod = ContactMethod.values.firstWhere(
                  (e) =>
                      e.name == contact.name ||
                      contact.name.toLowerCase().contains(e.name.toLowerCase()),
                );
                // URL'deki soru işaretinden sonraki kısmı kaldır
                String displayUrl = contact.url.contains('?')
                    ? contact.url.substring(0, contact.url.indexOf('?'))
                    : contact.url;

                return Tooltip(
                  message: displayUrl,
                  decoration: BoxDecoration(
                    color:
                        Theme.of(context).colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(20),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  textStyle: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  preferBelow: true,
                  waitDuration: const Duration(milliseconds: 500),
                  child: InkWell(
                    onTap: () => HelperUtils.launchURL(contact.url),
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: contactMethod.color.withAlpha(26),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: contactMethod.color.withAlpha(77),
                                width: 1,
                              ),
                            ),
                            child: Icon(
                              contactMethod.icon,
                              color: contactMethod.color,
                              size: 24,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            contactMethod.name,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: Theme.of(context).colorScheme.onSurface,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            // Boşluk ekleyerek alt kısmı doldur
            const Spacer(),
          ],
        ),
      ),
    );
  }
}
