import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:ai_auto_free/widgets/custom_appbar.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../generated/l10n.dart';

class NoticePage extends StatelessWidget {
  const NoticePage({super.key});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    // 16:9 oranını koruma
    final cardWidth = size.width * 0.85;
    final cardHeight = cardWidth * 9 / 16;

    return Scaffold(
      appBar: CustomAppBar(),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFF5F7FF), Color(0xFFEEF1F9)],
          ),
        ),
        child: Center(
          child: Container(
            width: cardWidth,
            height: cardHeight,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF6750A4).withOpacity(0.08),
                  offset: const Offset(0, 8),
                  blurRadius: 20,
                  spreadRadius: 0,
                ),
              ],
            ),
            child: Column(
              children: [
                // Başlık Bandı
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: const BoxDecoration(
                    color: Color(0xFF6750A4),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(24),
                      topRight: Radius.circular(24),
                    ),
                  ),
                  child: Center(
                    child: Text(
                      S.of(context).notice_title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),

                // İçerik Bölümü
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        // Üst Kısım - Bilgilendirme
                        Column(
                          children: [
                            // Başlık
                            Text(
                              S.of(context).desktop_support_ending,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1D1B20),
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),

                            // Alt Açıklama
                            Text(
                              S.of(context).continue_on_web,
                              style: const TextStyle(
                                fontSize: 15,
                                color: Color(0xFF49454F),
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),

                        // Orta Kısım - Web ve Kredi Transferi
                        Column(
                          children: [
                            // Web Adresi
                            GestureDetector(
                              onTap: () {
                                Clipboard.setData(ClipboardData(
                                  text: S.of(context).web_site_url,
                                ));
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.check_circle_outline,
                                            color: Colors.white, size: 16),
                                        const SizedBox(width: 8),
                                        Text(S.of(context).copied_to_clipboard),
                                      ],
                                    ),
                                    backgroundColor: const Color(0xFF6750A4),
                                    duration: const Duration(seconds: 2),
                                    behavior: SnackBarBehavior.floating,
                                    width: 220,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 10,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF2EEFF),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: const Color(0xFF6750A4)
                                        .withOpacity(0.3),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    TextButton(
                                      onPressed: () {
                                        HelperUtils.launchURL(
                                            S.of(context).web_site_url);
                                      },
                                      child: Text(
                                        S.of(context).web_site_url,
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w500,
                                          color: Color(0xFF6750A4),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    const Icon(
                                      Icons.content_copy,
                                      size: 16,
                                      color: Color(0xFF6750A4),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Kredi Aktarma Bilgisi - Kompakt
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFFBFE),
                                borderRadius: BorderRadius.circular(12),
                                border:
                                    Border.all(color: const Color(0xFFE4E1E6)),
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.credit_card,
                                        color: Color(0xFF6750A4),
                                        size: 16,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        S.of(context).transfer_credits_info,
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF1D1B20),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    S.of(context).credits_transfer_steps,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      color: Color(0xFF49454F),
                                    ),
                                    textAlign: TextAlign.center,
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),

                        // Alt Kısım - Teşekkür ve Devam Et
                        Column(
                          children: [
                            // Teşekkür Mesajı
                            Text(
                              S.of(context).thank_you_for_support,
                              style: const TextStyle(
                                fontSize: 14,
                                fontStyle: FontStyle.italic,
                                color: Color(0xFF79747E),
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 12),

                            // Devam Et Butonu
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () {
                                  context.go('/setup');
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF6750A4),
                                  foregroundColor: Colors.white,
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(24),
                                  ),
                                  elevation: 0,
                                ),
                                child: Text(
                                  S.of(context).continue_to_app,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
