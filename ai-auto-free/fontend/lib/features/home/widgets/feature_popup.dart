import 'package:ai_auto_free/common/l10n_dyanmic.dart';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/models/services_model.dart';
import 'package:flutter/material.dart';

class FeaturePopup extends StatelessWidget {
  final FeatureModel feature;
  final Function(FeatureModel) onClickFeature;
  final Function(FeatureModel) onClickAddon;

  const FeaturePopup({
    super.key,
    required this.feature,
    required this.onClickFeature,
    required this.onClickAddon,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDeactivated = feature.pool && feature.poolAccountCount == 0;
    final hasActiveFeature = feature.isActive;
    final hasActiveAddon = feature.addon != null && feature.addon!.isActive;

    // Eğer hiçbir aktif özellik yoksa boş bir widget döndür
    if (!hasActiveFeature && !hasActiveAddon) {
      return Container(
        height: 100,
        width: 300,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: colorScheme.surface,
        ),
        child: const Center(
          child: Text(
            "No active feature",
            style: TextStyle(
              fontStyle: FontStyle.italic,
              color: Colors.grey,
              fontSize: 14,
            ),
          ),
        ),
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (hasActiveFeature)
          _buildFeatureItem(
            context,
            colorScheme,
            isDeactivated,
            isAddon: false,
          ),
        if (hasActiveAddon)
          _buildFeatureItem(
            context,
            colorScheme,
            false,
            isAddon: true,
          ),
      ],
    );
  }

  Widget _buildFeatureItem(
    BuildContext context,
    ColorScheme colorScheme,
    bool isDeactivated, {
    required bool isAddon,
  }) {
    final FeatureAddonModel? addonFeature = feature.addon;
    final String title = isAddon && addonFeature != null
        ? l10nDynamic[addonFeature.nameKey] ?? addonFeature.name
        : feature.name;
    final String subtitle = isDeactivated
        ? S.of(context).pool_deactivated
        : isAddon && addonFeature != null
            ? addonFeature.hint ?? ""
            : "${feature.hint} ${!isAddon && feature.pool ? "\n\n${S.of(context).pool_account_count(feature.poolAccountCount)}" : ""}";
    final int credit =
        isAddon && addonFeature != null ? addonFeature.credit : feature.credit;

    return PopupMenuItem(
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: !isAddon && feature.credit > 0
              ? colorScheme.primaryContainer.withAlpha(160)
              : isAddon && credit > 0
                  ? colorScheme.secondaryContainer.withAlpha(120)
                  : colorScheme.surfaceContainerHighest.withAlpha(80),
          boxShadow: [
            BoxShadow(
              color: colorScheme.shadow.withAlpha(10),
              blurRadius: 3,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: ListTile(
          dense: true,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 8,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          title: Text(
            title,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 15,
              color: isDeactivated ? colorScheme.error : colorScheme.onSurface,
            ),
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              subtitle,
              style: TextStyle(
                fontSize: 12,
                height: 1.3,
                color: isDeactivated
                    ? colorScheme.error.withAlpha(200)
                    : colorScheme.onSurface.withAlpha(180),
              ),
            ),
          ),
          trailing: credit <= 0
              ? null
              : Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: isAddon
                        ? colorScheme.secondaryContainer
                        : colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: colorScheme.shadow.withAlpha(15),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.credit_card,
                        size: 16,
                        color: isAddon
                            ? colorScheme.secondary
                            : colorScheme.primary,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        "$credit ${S.of(context).credits}",
                        style: TextStyle(
                          color: isAddon
                              ? colorScheme.secondary
                              : colorScheme.primary,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
          onTap: isDeactivated
              ? null
              : () {
                  Navigator.pop(context);
                  if (isAddon) {
                    onClickAddon(feature);
                  } else {
                    onClickFeature(feature);
                  }
                },
        ),
      ),
    );
  }
}

class FeatureButton extends StatelessWidget {
  final FeatureModel feature;
  final Function(FeatureModel) onClickFeature;
  final Function(FeatureModel) onClickAddon;

  const FeatureButton({
    super.key,
    required this.feature,
    required this.onClickFeature,
    required this.onClickAddon,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final hasActiveFeature = feature.isActive;
    final hasActiveAddon = feature.addon != null && feature.addon!.isActive;

    final buttonColor = colorScheme.primary.withAlpha(230);

    final buttonTextColor = colorScheme.onPrimary;

    // İsimde (örnek) formatında bir etiket olup olmadığını kontrol et
    String displayName =
        !hasActiveFeature && hasActiveAddon && feature.addon != null
            ? l10nDynamic[feature.addon!.nameKey] ?? feature.addon!.name
            : feature.name;

    String? labelText;
    if (displayName.contains("(") && displayName.contains(")")) {
      final startIndex = displayName.indexOf("(");
      final endIndex = displayName.indexOf(")");
      if (startIndex < endIndex) {
        labelText = displayName.substring(startIndex + 1, endIndex);
        displayName = displayName.substring(0, startIndex).trim();
      }
    }

    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: PopupMenuButton<String>(
        position: PopupMenuPosition.under,
        offset: const Offset(0, 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        enabled: hasActiveFeature || hasActiveAddon,
        child: Container(
          height: 44,
          padding: const EdgeInsets.symmetric(
            horizontal: 16,
          ),
          decoration: BoxDecoration(
            color: buttonColor,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: colorScheme.shadow.withAlpha(25),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                !hasActiveFeature && hasActiveAddon
                    ? Icons.add_circle_outline
                    : Icons.control_camera_outlined,
                color: buttonTextColor,
                size: 18,
              ),
              const SizedBox(width: 10),
              Text(
                displayName,
                style: TextStyle(
                  color: buttonTextColor,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (labelText != null) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: colorScheme.onPrimaryFixedVariant.withAlpha(160),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    labelText,
                    style: TextStyle(
                      color: colorScheme.onPrimary,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
        itemBuilder: (context) => [
          PopupMenuItem(
            padding: EdgeInsets.zero,
            child: FeaturePopup(
              feature: feature,
              onClickFeature: onClickFeature,
              onClickAddon: onClickAddon,
            ),
          ),
        ],
      ),
    );
  }
}
