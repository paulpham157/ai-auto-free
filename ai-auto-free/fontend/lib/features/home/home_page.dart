import 'package:ai_auto_free/features/gift_code/gift_code_dialog.dart';
import 'package:ai_auto_free/features/home/widgets/console_view.dart';
import 'package:ai_auto_free/features/home/widgets/cursor_status.dart';
import 'package:ai_auto_free/features/home/widgets/feature_popup.dart';
import 'package:ai_auto_free/features/home/widgets/windsurf_status.dart';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/services/python/run_py.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../widgets/custom_appbar.dart';
import 'home_provider.dart';
import 'widgets/account_list.dart';
import 'widgets/notifications_popup.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Consumer<HomeProvider>(
      builder: (context, viewModel, child) {
        return Scaffold(
          backgroundColor: colorScheme.surface,
          appBar: CustomAppBar(
            actions: [
              NotificationButton(
                onStateChanged: () => setState(() {}),
              ),
            ],
          ),
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
                              return FeatureButton(
                                feature: feature,
                                onClickFeature: viewModel.onClickFeature,
                                onClickAddon: viewModel.onClickAddon,
                              );
                            },
                          ),
                        ),
                      ),
                      /* const SizedBox(width: 12),
                      FilledButton.tonalIcon(
                        onPressed: () => context.push("/settings"),
                        icon: const Icon(Icons.settings),
                        label: Text(S.of(context).settings),
                      ), */
                      FilledButton.tonalIcon(
                        onPressed: () {
                          showDialog(
                            context: context,
                            builder: (context) => GiftCodeDialog(
                              homeProvider: viewModel,
                            ),
                          );
                        },
                        icon: const Icon(Icons.card_giftcard),
                        label: Text(S.of(context).gift_code),
                      ),
                      const SizedBox(width: 6),
                      FilledButton.tonalIcon(
                        onPressed: () => context.push("/pricing"),
                        style: FilledButton.styleFrom(
                          backgroundColor: viewModel.changeCreditButtonColor
                              ? colorScheme.errorContainer
                              : colorScheme.secondaryContainer,
                        ),
                        icon: const Icon(
                          Icons.credit_card,
                          size: 20,
                        ),
                        label: Text(
                          viewModel.changeCreditButtonColor
                              ? S.of(context).buy_credits
                              : "${S.of(context).remaining_credits} ${viewModel.remainingCredits}",
                        ),
                      ),
                    ],
                  ),

                const SizedBox(height: 24),

                // Hesap listesi - AccountList widget'ı kendi içinde zaten Expanded içeriyor
                AccountList(
                  onAccountSelected: (account) =>
                      viewModel.selectAccount(context, account),
                  onRemoveAccount: (account) =>
                      viewModel.removeAccount(account),
                  accounts: viewModel.accounts,
                  onReorder: viewModel.reorderAccounts,
                ),

                // Konsol mesajları ve Cursor Status
                if (viewModel.consoleMessage.isNotEmpty)
                  ConsoleView(
                    scrollController: viewModel.scrollController,
                    consoleMinimized: viewModel.consoleMinimized,
                    consoleMessage: viewModel.consoleMessage,
                    onConsoleMinimized: viewModel.setConsoleMinimized,
                    onCopyConsoleMessage: viewModel.copyConsoleMessages,
                  ),

                // CursorStatus ve WindsurfStatus widget'ları yan yana
                Align(
                  alignment: Alignment.centerRight,
                  child: Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Günlük giriş sayısı göstergesi
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: colorScheme.primaryContainer.withAlpha(153),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            RunPy.instance.services?.dailyLoginCount != null
                                ? "${S.of(context).daily_login}: ${RunPy.instance.services!.dailyLoginCount}"
                                : "",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: colorScheme.onPrimaryContainer,
                            ),
                          ),
                        ),
                        // Sağ taraftaki durum göstergeleri
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            WindsurfStatus(),
                            SizedBox(width: 8),
                            CursorStatus(),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
