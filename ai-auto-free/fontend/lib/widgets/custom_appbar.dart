import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../common/constants.dart';

class CustomAppBar extends StatefulWidget implements PreferredSizeWidget {
  final String title;
  final bool center;
  final List<Widget> actions;

  const CustomAppBar({
    super.key,
    this.title = Constants.name,
    this.center = false,
    this.actions = const [],
  });

  const CustomAppBar.center({
    super.key,
    this.title = Constants.name,
    this.center = true,
    this.actions = const [],
  });

  @override
  State<CustomAppBar> createState() => _CustomAppBarState();

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight - 8);
}

class _CustomAppBarState extends State<CustomAppBar> {
  String _version = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _getAppVersion();
  }

  Future<void> _getAppVersion() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      if (mounted) {
        setState(() {
          _version = packageInfo.version;
          _isLoading = false;
        });
      }
    } catch (e) {
      // Hata durumunda versiyon bilgisini boş bırak
      if (mounted) {
        setState(() {
          _version = '';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: (details) {
        windowManager.startDragging();
      },
      child: AppBar(
        centerTitle: widget.center,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              widget.title,
              style: TextStyle(color: Theme.of(context).colorScheme.onPrimary),
            ),
            if (!_isLoading && _version.isNotEmpty) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.onPrimary.withAlpha(40),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  "v$_version",
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onPrimary,
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ),
            ],
          ],
        ),
        backgroundColor: Theme.of(context).colorScheme.primary,
        actions: [
          ...widget.actions,
          const SizedBox(width: 24),
          if (!widget.center)
            IconButton(
              icon: Icon(
                Icons.remove_rounded,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
              onPressed: () async {
                await windowManager.minimize();
              },
            ),
          const SizedBox(width: 4),
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
}
