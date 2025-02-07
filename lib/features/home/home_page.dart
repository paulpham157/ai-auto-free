import 'package:ai_auto_free/common/l10n_dyanmic.dart';
import 'package:ai_auto_free/features/home/widgets/console_view.dart';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/models/account_model.dart';
import 'package:ai_auto_free/services/python/run/run_py.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../widgets/custom_appbar.dart';
import 'home_provider.dart';
import 'widgets/account_list.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Consumer<HomeProvider>(
      builder: (context, viewModel, child) {
        return Scaffold(
          backgroundColor: colorScheme.surface,
          appBar: const CustomAppBar(),
          body: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Üst menü butonları
                if (viewModel.isRunning)
                  FilledButton.icon(
                    onPressed: viewModel.onClickStop,
                    icon: const Icon(Icons.stop),
                    label: Text(S.of(context).stop),
                    style: FilledButton.styleFrom(
                      backgroundColor: colorScheme.error,
                      foregroundColor: colorScheme.onError,
                    ),
                  ),
                if (!viewModel.isRunning)
                  Row(
                    children: [
                      if (RunPy.instance.services?.features
                              .any((e) => e.addon != null) ??
                          false)
                        ...RunPy.instance.services?.features
                                .where((e) => e.addon != null)
                                .map((a) {
                              return Padding(
                                padding: const EdgeInsets.only(right: 12),
                                child: Tooltip(
                                  message: a.addon!.hint,
                                  child: FilledButton.icon(
                                    onPressed: () => viewModel.onClickAddon(a),
                                    icon: const Icon(Icons.play_arrow),
                                    label: Text(l10nDynamic[a.addon!.nameKey] ??
                                        a.addon!.name),
                                    style: FilledButton.styleFrom(
                                      backgroundColor: colorScheme.primary,
                                      foregroundColor: colorScheme.onPrimary,
                                    ),
                                  ),
                                ),
                              );
                            }).toList() ??
                            [],
                      Expanded(
                        child: SizedBox(
                          height: 32,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount:
                                RunPy.instance.services?.features.length ?? 0,
                            itemBuilder: (context, index) {
                              final feature =
                                  RunPy.instance.services!.features[index];
                              return Padding(
                                padding: const EdgeInsets.only(right: 12),
                                child: FilledButton.icon(
                                  onPressed: () =>
                                      viewModel.onClickFeature(feature),
                                  icon:
                                      const Icon(Icons.control_camera_outlined),
                                  label: Text(feature.name),
                                  style: FilledButton.styleFrom(
                                    backgroundColor:
                                        colorScheme.primary.withAlpha(220),
                                    foregroundColor: colorScheme.onSecondary,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                      if (viewModel.updateAvailable() != null)
                        FilledButton.tonalIcon(
                          onPressed: viewModel.update,
                          icon: const Icon(Icons.download),
                          label: Text(
                            S.of(context).update(viewModel.updateAvailable()!),
                          ),
                        ),
                      const SizedBox(width: 12),
                      FilledButton.tonalIcon(
                        onPressed: () => context.push("/settings"),
                        icon: const Icon(Icons.settings),
                        label: Text(S.of(context).settings),
                      ),
                    ],
                  ),

                const SizedBox(height: 24),

                // Hesap listesi
                AccountList(
                  onAccountSelected: (account) =>
                      viewModel.selectAccount(context, account),
                  onRemoveAccount: (account) =>
                      viewModel.removeAccount(account),
                  accounts: [
                    if (viewModel.accounts.isEmpty)
                      AccountModel(
                        email: "example@mail.com",
                        password: "123456",
                        type: AccountType.cursor,
                        date: DateTime.now(),
                        token: "token",
                      ),
                    ...viewModel.accounts,
                  ],
                ),

                const SizedBox(height: 8),

                if (viewModel.consoleMessage.isNotEmpty)
                  ConsoleView(
                    scrollController: viewModel.scrollController,
                    consoleMinimized: viewModel.consoleMinimized,
                    consoleMessage: viewModel.consoleMessage,
                    onConsoleMinimized: viewModel.setConsoleMinimized,
                    onCopyConsoleMessage: viewModel.copyConsoleMessages,
                  )
              ],
            ),
          ),
        );
      },
    );
  }
}
