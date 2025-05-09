import 'package:ai_auto_free/generated/l10n.dart';
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
            if (settings.emailValidatorType == EmailValidatorType.imap)
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
                        child: _buildImapRedirectedMailsCard(
                            context, theme, settings),
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

  Widget _buildImapRedirectedMailsCard(
      BuildContext context, ThemeData theme, SettingsProvider settings) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            S.of(context).redirected_emails,
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            S.of(context).redirected_email_info,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 200,
            child: ListView.separated(
              shrinkWrap: true,
              physics: const AlwaysScrollableScrollPhysics(),
              itemCount: settings.imapRedirectedMails.length,
              separatorBuilder: (context, index) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final email = settings.imapRedirectedMails[index];
                return ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    email,
                    style: const TextStyle(fontSize: 14),
                  ),
                  trailing: IconButton(
                    icon: Icon(
                      Icons.remove_circle_outline,
                      size: 20,
                      color: theme.colorScheme.error,
                    ),
                    onPressed: () => settings.removeImapRedirectedMail(email),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 24),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: settings.newEmailController,
                  decoration: InputDecoration(
                    hintText: S.of(context).enter_email,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                  ),
                  style: const TextStyle(fontSize: 14),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: () {
                  if (settings.newEmailController.text.isNotEmpty) {
                    settings.addImapRedirectedMail(
                        settings.newEmailController.text);
                    settings.newEmailController.clear();
                  }
                },
                icon: Icon(
                  Icons.add_circle,
                  color: theme.colorScheme.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
