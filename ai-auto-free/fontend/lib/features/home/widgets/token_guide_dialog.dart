import 'package:ai_auto_free/common/constants.dart';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class TokenGuideDialog extends StatelessWidget {
  const TokenGuideDialog({
    super.key,
    required this.token,
  });

  final String token;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final size = MediaQuery.of(context).size;
    final maxWidth = size.width * 0.8; // Diyalog genişliğini sınırla

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      elevation: 0.5,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: maxWidth,
          maxHeight: size.height * 0.93,
        ),
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Text(
                      S.of(context).windsurf_token_guide_title,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: colorScheme.onSurface,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Flexible(
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildStep(
                            context: context,
                            index: 0,
                            message: S.of(context).windsurf_token_guide_1,
                            colorScheme: colorScheme,
                          ),
                          _buildStep(
                            context: context,
                            index: 1,
                            message: S.of(context).windsurf_token_guide_2,
                            colorScheme: colorScheme,
                          ),
                          _buildStep(
                            context: context,
                            index: 2,
                            message: S.of(context).windsurf_token_guide_3,
                            imagePath: Constants.windsurfToken1Png,
                            colorScheme: colorScheme,
                          ),
                          _buildStep(
                            context: context,
                            index: 3,
                            message: S.of(context).windsurf_token_guide_4,
                            colorScheme: colorScheme,
                          ),
                          _buildStep(
                            context: context,
                            index: 4,
                            message: S.of(context).windsurf_token_guide_5,
                            imagePath: Constants.windsurfToken2Png,
                            hasToken: true,
                            colorScheme: colorScheme,
                            isLastStep: true,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Positioned(
              top: 8,
              right: 8,
              child: InkWell(
                onTap: () {
                  Navigator.of(context).pop();
                },
                borderRadius: BorderRadius.circular(16),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Icon(
                    Icons.close,
                    size: 20,
                    color: colorScheme.onSurface.withAlpha(180),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep({
    required BuildContext context,
    required int index,
    required String message,
    String? imagePath,
    bool hasToken = false,
    required ColorScheme colorScheme,
    bool isLastStep = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: colorScheme.primary,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: colorScheme.primary.withAlpha(60),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    '${index + 1}',
                    style: TextStyle(
                      color: colorScheme.onPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 2.0),
                  child: Text(
                    message,
                    style: TextStyle(
                      fontSize: 14,
                      color: colorScheme.onSurface.withAlpha(220),
                    ),
                  ),
                ),
              ),
            ],
          ),
          if (hasToken) ...[
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.only(left: 32.0, right: 16, bottom: 10),
              child: InkWell(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: token));
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(S.of(context).token_copied),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  decoration: BoxDecoration(
                    color: colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(4),
                    border:
                        Border.all(color: colorScheme.primary.withAlpha(100)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Flexible(
                        child: Text(
                          token,
                          style: TextStyle(
                            fontSize: 11,
                            fontFamily: 'monospace',
                            color: colorScheme.onPrimaryContainer,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Icon(
                        Icons.copy,
                        size: 14,
                        color: colorScheme.primary,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
          if (imagePath != null) ...[
            const SizedBox(height: 4),
            Padding(
              padding: const EdgeInsets.only(left: 24.0),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: Image.asset(
                  imagePath,
                  width: 740,
                  fit: BoxFit.contain,
                ),
              ),
            ),
          ],
          if (!isLastStep)
            Padding(
              padding: const EdgeInsets.only(left: 9.0, top: 3.0, bottom: 3.0),
              child: Container(
                width: 1,
                height: 8,
                color: colorScheme.primary.withAlpha(100),
              ),
            ),
        ],
      ),
    );
  }
}
