import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/models/account_model.dart';
import 'package:flutter/material.dart';

class AccountList extends StatelessWidget {
  final List<AccountModel> accounts;
  final Function(AccountModel account)? onAccountSelected;
  final Function(AccountModel account)? onRemoveAccount;
  const AccountList({
    super.key,
    required this.accounts,
    this.onAccountSelected,
    this.onRemoveAccount,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Expanded(
      child: Card(
        elevation: .5,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: colorScheme.primaryContainer,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(12)),
              ),
              child: Row(
                children: [
                  Text(
                    S.of(context).accounts,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: colorScheme.onPrimaryContainer,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: accounts.length,
                itemBuilder: (context, index) {
                  final AccountModel account =
                      accounts.reversed.toList()[index];
                  return ListTile(
                    dense: true,
                    onTap: () => onAccountSelected?.call(account),
                    leading: account.type.image == null
                        ? const Icon(Icons.mail)
                        : Image.asset(account.type.image!),
                    title: Text(
                      account.email,
                      style: TextStyle(
                        color: Colors.black87,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    subtitle: Text(
                        "${account.date.day.toString().padLeft(2, '0')}/${account.date.month.toString().padLeft(2, '0')}/${account.date.year}"),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete),
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: Text(S.of(context).delete_account),
                            content:
                                Text(S.of(context).delete_account_confirmation),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: Text(S.of(context).cancel),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(context);
                                  onRemoveAccount?.call(account);
                                },
                                child: Text(S.of(context).delete,
                                    style: TextStyle(color: Colors.red)),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
