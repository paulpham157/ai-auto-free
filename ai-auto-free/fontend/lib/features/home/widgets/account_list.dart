import 'package:ai_auto_free/generated/l10n.dart';
import 'package:ai_auto_free/models/account_model.dart';
import 'package:flutter/material.dart';

class AccountList extends StatelessWidget {
  final List<AccountModel> accounts;
  final Function(AccountModel account)? onAccountSelected;
  final Function(AccountModel account)? onRemoveAccount;
  final Function(int oldIndex, int newIndex)? onReorder;
  const AccountList({
    super.key,
    required this.accounts,
    this.onAccountSelected,
    this.onRemoveAccount,
    this.onReorder,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Expanded(
      child: Card(
        elevation: 0.5,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
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
                  const SizedBox(width: 8),
                  Text(
                    "(${accounts.length})",
                    style: TextStyle(
                      color: colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: accounts.isEmpty
                  ? Center(
                      child: Text(
                        S.of(context).no_accounts_found,
                        style: TextStyle(
                          color: colorScheme.onSurfaceVariant.withAlpha(180),
                        ),
                      ),
                    )
                  : ReorderableListView.builder(
                      itemCount: accounts.length,
                      onReorder: onReorder ?? (_, __) {},
                      buildDefaultDragHandles: false,
                      itemBuilder: (context, index) {
                        // Hesapları önce türlerine göre, sonra listeye eklenme sırasına göre sırala
                        final sortedAccounts =
                            List<AccountModel>.from(accounts);

                        // Tür önceliği: Cursor > Windsurf > Other
                        sortedAccounts.sort((a, b) {
                          // Önce türlere göre sırala
                          if (a.type != b.type) {
                            // Cursor en üstte
                            if (a.type == AccountType.cursor) return -1;
                            if (b.type == AccountType.cursor) return 1;

                            // Windsurf ikinci sırada
                            if (a.type == AccountType.windsurf) return -1;
                            if (b.type == AccountType.windsurf) return 1;
                          }

                          // Aynı türdeyse listeye eklenme sırasını koruyalım
                          // accounts listesi zaten eklenme sırasında olduğundan, indeksleri kullanabiliriz
                          // Ters sıralama için indeksleri ters karşılaştırıyoruz (en son eklenen üstte olacak)
                          return accounts.indexOf(b) - accounts.indexOf(a);
                        });

                        final AccountModel account = sortedAccounts[index];
                        return Dismissible(
                          key: Key(account.email),
                          background: Container(
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 20.0),
                            color: colorScheme.errorContainer,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Icon(
                                  Icons.delete_rounded,
                                  color: colorScheme.error,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  S.of(context).delete,
                                  style: TextStyle(
                                    color: colorScheme.error,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          direction: DismissDirection.endToStart,
                          confirmDismiss: (direction) async {
                            return await showDialog(
                              context: context,
                              builder: (context) => AlertDialog(
                                title: Text(S.of(context).delete_account),
                                content: Text(
                                    S.of(context).delete_account_confirmation),
                                actions: [
                                  TextButton(
                                    onPressed: () =>
                                        Navigator.pop(context, false),
                                    child: Text(S.of(context).cancel),
                                  ),
                                  TextButton(
                                    onPressed: () {
                                      Navigator.pop(context, true);
                                      onRemoveAccount?.call(account);
                                    },
                                    child: Text(
                                      S.of(context).delete,
                                      style: TextStyle(
                                        color: colorScheme.error,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                          child: ListTile(
                            tileColor: account.lastUsageStatus == null ||
                                    !account.lastUsageStatus!
                                        .contains(S.current.account_invalid)
                                ? null
                                : colorScheme.errorContainer.withAlpha(127),
                            dense: true,
                            onTap: () => onAccountSelected?.call(account),
                            leading: account.type.image == null
                                ? Icon(Icons.mail, color: colorScheme.primary)
                                : Image.asset(
                                    account.type.image!,
                                    width: 24,
                                    height: 24,
                                  ),
                            title: Row(
                              children: [
                                Expanded(
                                  flex: 2,
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        account.email,
                                        style: TextStyle(
                                          color: colorScheme.onSurface,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      Builder(
                                        builder: (_) {
                                          final difference = DateTime.now()
                                              .difference(account.date)
                                              .inDays;
                                          final date =
                                              "${account.date.day.toString().padLeft(2, '0')}/${account.date.month.toString().padLeft(2, '0')}/${account.date.year}";
                                          return Text(
                                            "$date (${difference > 0 ? "$difference ${S.of(context).days}" : S.of(context).today})",
                                            style: TextStyle(
                                              color: colorScheme
                                                  .onSurfaceVariant
                                                  .withAlpha(200),
                                              fontSize: 12,
                                            ),
                                          );
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                                if (account.lastUsageStatus != null)
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        Icon(
                                          account.lastUsageStatus!.contains(
                                                  S.current.account_invalid)
                                              ? Icons.error_outline
                                              : Icons.check_circle_outline,
                                          size: 14,
                                          color: account.lastUsageStatus!
                                                  .contains(
                                                      S.current.account_invalid)
                                              ? colorScheme.error
                                              : colorScheme.primary,
                                        ),
                                        const SizedBox(width: 4),
                                        Flexible(
                                          child: Text(
                                            account.lastUsageStatus!,
                                            style: TextStyle(
                                              color: account.lastUsageStatus!
                                                      .contains(S.current
                                                          .account_invalid)
                                                  ? colorScheme.error
                                                  : colorScheme.primary,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w500,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                            trailing: ReorderableDragStartListener(
                              index: index,
                              child: Icon(
                                Icons.drag_handle,
                                color: colorScheme.primary.withAlpha(153),
                                size: 20,
                              ),
                            ),
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
