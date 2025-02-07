import 'package:ai_auto_free/features/setup/setup_provider.dart';
import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/widgets/custom_appbar.dart';
import 'package:ai_auto_free/widgets/loading_widget.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class SetupPage extends StatelessWidget {
  const SetupPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar.center(title: S.of(context).welcome_to_ai_auto_free),
      body: Consumer<SetupProvider>(
        builder: (context, viewModel, child) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(),
                Text(
                  S.of(context).settings_are_being_configured,
                  style: TextStyle(fontSize: 24),
                ),
                const SizedBox(height: 30),
                if (viewModel.needRestart)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 30),
                    child: Text(
                      S.of(context).you_should_restart_your_computer,
                      style: TextStyle(fontSize: 22, color: Colors.black54),
                    ),
                  ),
                if (!viewModel.needRestart) ...[
                  LoadingWidget(size: 25),
                  const Spacer(),
                  if (viewModel.retryButton) ...[
                    Text(
                      viewModel.retryMessage,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 18,
                        color: Theme.of(context).colorScheme.tertiary,
                      ),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () => viewModel.check(context),
                      child: Text(S.of(context).retry),
                    ),
                    const SizedBox(height: 40),
                  ],
                  Text(
                    textAlign: TextAlign.center,
                    viewModel.checkingMessage,
                    style: TextStyle(
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 40),
                ]
              ],
            ),
          );
        },
      ),
    );
  }
}
