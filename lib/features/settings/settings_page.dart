import 'package:ai_auto_free/common/constants.dart';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/services/helper_utils.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../widgets/custom_appbar.dart';
import 'settings_provider.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final settings = context.watch<SettingsProvider>();
    return Scaffold(
      appBar: CustomAppBar.center(title: S.of(context).settings),
      body: SingleChildScrollView(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildGeneralSettingsCard(context, theme, settings),
                    if (settings.emailValidatorType == EmailValidatorType.imap)
                      _buildImapSettingsCard(context, theme, settings),
                  ],
                ),
              ),
            ),
            if (settings.about != null)
              Expanded(
                flex: 1,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(
                        left: 0,
                        right: 16,
                        bottom: 16,
                        top: 16,
                      ),
                      child: Card(
                        elevation: 0,
                        color:
                            theme.colorScheme.secondaryContainer.withAlpha(200),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: _buildAboutCard(context, theme, settings),
                      ),
                    )
                  ],
                ),
              )
          ],
        ),
      ),
    );
  }

  Widget _buildGeneralSettingsCard(
      BuildContext context, ThemeData theme, SettingsProvider settings) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SwitchListTile.adaptive(
              title: Text(S.of(context).browser_visibility),
              value: settings.browserVisibility,
              onChanged: settings.setBrowserVisibility,
              secondary: const Icon(Icons.visibility),
              dense: true,
            ),
            const Divider(height: 30),
            Text(S.of(context).email_validator_type,
                style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            _buildCustomDropdown(theme, settings),
          ],
        ),
      ),
    );
  }

  Widget _buildCustomDropdown(ThemeData theme, SettingsProvider settings) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Row(
        children: EmailValidatorType.values.map((type) {
          bool isSelected = settings.emailValidatorType == type;
          return Expanded(
            child: InkWell(
              onTap: () => settings.setEmailValidatorType(type),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 9),
                decoration: BoxDecoration(
                  color: isSelected
                      ? theme.colorScheme.primary
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  type.name.toUpperCase(),
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color:
                        isSelected ? theme.colorScheme.onPrimary : Colors.black,
                    fontWeight:
                        isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildImapSettingsCard(
      BuildContext context, ThemeData theme, SettingsProvider settings) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      margin: const EdgeInsets.only(top: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(S.of(context).imap_settings,
                style: theme.textTheme.titleMedium),
            const SizedBox(height: 16),
            _buildTextField(
              controller: settings.imapServerController,
              label: S.of(context).server,
              icon: Icons.dns,
            ),
            const SizedBox(height: 12),
            _buildTextField(
              controller: settings.imapUserController,
              label: S.of(context).username,
              icon: Icons.person,
            ),
            const SizedBox(height: 12),
            _buildTextField(
              controller: settings.imapPasswordController,
              label: S.of(context).password,
              icon: Icons.lock,
              obscureText: true,
            ),
            const SizedBox(height: 12),
            _buildTextField(
              controller: settings.imapPortController,
              label: S.of(context).port,
              icon: Icons.numbers,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                settings.saveAll();
                ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(S.of(context).imap_settings_saved)));
              },
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
                elevation: 2,
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Theme.of(context).colorScheme.onPrimary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(S.of(context).save_imap_settings,
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscureText = false,
    TextInputType? keyboardType,
  }) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20, color: Colors.black54),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.blue.shade300, width: 2),
        ),
        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        isDense: true,
        floatingLabelBehavior: FloatingLabelBehavior.auto,
      ),
      style: TextStyle(fontSize: 14),
      obscureText: obscureText,
      keyboardType: keyboardType,
    );
  }

  Widget _buildAboutCard(
      BuildContext context, ThemeData theme, SettingsProvider settings) {
    final about = settings.about!;
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(S.of(context).about, style: theme.textTheme.titleMedium),
          const SizedBox(height: 16),
          _buildAboutRow(Icons.person, about.author),
          _buildAboutRow(Icons.numbers,
              "${S.of(context).version} ${Constants.versionCode.toString()}"),
          _buildAboutRow(Icons.description, about.description),
          const Divider(height: 24),
          _buildLinkRow(
            theme,
            Icons.code,
            'GitHub',
            about.repo,
            onTap: () => HelperUtils.launchURL(about.repo),
          ),
          _buildLinkRow(
            theme,
            Icons.coffee,
            'Buy Me A Coffee',
            about.buyMeACoffee,
            onTap: () => HelperUtils.launchURL(about.buyMeACoffee),
          ),
          if (about.btc.isNotEmpty) ...[
            const SizedBox(height: 12),
            _buildBtcAddress(theme, about.btc),
          ],
        ],
      ),
    );
  }

  Widget _buildAboutRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.black54),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLinkRow(
    ThemeData theme,
    IconData icon,
    String label,
    String url, {
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        child: Row(
          children: [
            Icon(icon, size: 20, color: theme.colorScheme.primary),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: theme.colorScheme.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBtcAddress(ThemeData theme, String btcAddress) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.tertiaryFixedDim.withAlpha(60),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.currency_bitcoin, size: 20, color: Colors.green),
              const SizedBox(width: 8),
              const Text(
                'USDT TRC20 Address',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SelectableText(
            btcAddress,
            style: const TextStyle(fontSize: 12),
          ),
        ],
      ),
    );
  }
}
