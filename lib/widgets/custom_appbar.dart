import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';

import '../common/constants.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool center;
  const CustomAppBar(
      {super.key, this.title = Constants.name, this.center = false});

  const CustomAppBar.center(
      {super.key, this.title = Constants.name, this.center = true});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: (details) {
        windowManager.startDragging();
      },
      child: AppBar(
        centerTitle: center,
        title: Text(
          title,
          style: TextStyle(color: Theme.of(context).colorScheme.onPrimary),
        ),
        backgroundColor: Theme.of(context).colorScheme.primary,
        actions: [
          if (!center)
            IconButton(
              icon: Icon(
                Icons.minimize,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
              onPressed: () async {
                await windowManager.minimize();
              },
            ),
          IconButton(
            icon: Icon(
              Icons.close,
              color: Theme.of(context).colorScheme.onPrimary,
            ),
            onPressed: () async {
              await windowManager.close();
            },
          ),
          const SizedBox(width: 5),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight - 8);
}
