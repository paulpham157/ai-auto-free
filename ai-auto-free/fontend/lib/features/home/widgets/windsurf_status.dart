import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:ai_auto_free/generated/l10n.dart';

class WindsurfStatus extends StatefulWidget {
  const WindsurfStatus({super.key});

  @override
  State<WindsurfStatus> createState() => _WindsurfStatusState();
}

class _WindsurfStatusState extends State<WindsurfStatus> {
  bool _isLoading = true;
  String _statusDescription = '';
  String _statusIndicator = 'none';
  final Dio _dio = Dio();
  bool _isOverlayLoading = false;
  Response? _summaryData;

  @override
  void initState() {
    super.initState();
    _fetchWindsurfStatus();
  }

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _fetchWindsurfStatus() async {
    try {
      final response =
          await _dio.get('https://status.windsurf.com/api/v2/status.json');
      if (response.statusCode == 200) {
        final data = response.data;
        setState(() {
          _statusDescription = data['status']['description'];
          _statusIndicator = data['status']['indicator'];
          _isLoading = false;
        });
      } else {
        setState(() {
          _statusDescription = 'Status not available';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _statusDescription = 'Connection error';
        _isLoading = false;
      });
    }
  }

  Future<Response?> _fetchSummaryData() async {
    if (_summaryData != null) {
      return _summaryData;
    }

    try {
      final response =
          await _dio.get('https://status.windsurf.com/api/v2/summary.json');
      if (response.statusCode == 200) {
        _summaryData = response;
        return response;
      }
    } catch (e) {
      debugPrint('Error fetching summary data: $e');
    }
    return null;
  }

  Color _getStatusColor() {
    switch (_statusIndicator) {
      case 'none':
        return Colors.green;
      case 'minor':
        return Colors.orange;
      case 'major':
        return Colors.red;
      case 'critical':
        return Colors.deepPurple;
      default:
        return Colors.grey;
    }
  }

  void _showStatusDialog(BuildContext context) async {
    _isOverlayLoading = true;
    final summaryData = await _fetchSummaryData();
    _isOverlayLoading = false;

    if (!context.mounted) return;

    showDialog(
      context: context,
      builder: (dialogContext) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          child: Container(
            width: 320,
            padding: const EdgeInsets.all(16),
            child: _buildDialogContent(dialogContext, summaryData),
          ),
        );
      },
    );
  }

  Widget _buildDialogContent(BuildContext context, Response? summaryData) {
    if (_isOverlayLoading) {
      return const SizedBox(
        height: 100,
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (summaryData == null) {
      return Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(S.of(context).status_details_not_available),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(S.of(context).close),
            ),
          ],
        ),
      );
    }

    try {
      final data = summaryData.data;
      final components = data['components'] as List;
      final incidents = data['incidents'] as List;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: _getStatusColor(),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Windsurf ${S.of(context).status}: $_statusDescription',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          const Divider(),
          Text(
            S.of(context).components,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
          const SizedBox(height: 8),
          ...components.map((component) {
            final status = component['status'] as String;
            Color statusColor;

            switch (status) {
              case 'operational':
                statusColor = Colors.green;
                break;
              case 'degraded_performance':
              case 'partial_outage':
                statusColor = Colors.orange;
                break;
              case 'major_outage':
                statusColor = Colors.red;
                break;
              default:
                statusColor = Colors.grey;
            }

            return Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: statusColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      component['name'],
                      style: const TextStyle(fontSize: 12),
                    ),
                  ),
                  Text(
                    _formatStatus(status),
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              ),
            );
          }),
          if (incidents.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              S.of(context).active_incidents,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 8),
            ...incidents.map((incident) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      incident['name'],
                      style: const TextStyle(
                        fontWeight: FontWeight.w500,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      incident['incident_updates'][0]['body'],
                      style: const TextStyle(fontSize: 11),
                    ),
                  ],
                ),
              );
            }),
          ],
          const SizedBox(height: 16),
          Align(
            alignment: Alignment.center,
            child: TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(S.of(context).close),
            ),
          ),
        ],
      );
    } catch (e) {
      return Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(S.of(context).status_details_not_available),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(S.of(context).close),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: () => _showStatusDialog(context),
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: _isLoading ? Colors.grey : _getStatusColor(),
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 4),
            Text(
              'Windsurf ${S.of(context).status}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.info_outline,
              size: 14,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ],
        ),
      ),
    );
  }

  String _formatStatus(String status) {
    switch (status) {
      case 'operational':
        return S.of(context).operational;
      case 'degraded_performance':
        return S.of(context).degraded_performance;
      case 'partial_outage':
        return S.of(context).partial_outage;
      case 'major_outage':
        return S.of(context).major_outage;
      default:
        return status.replaceAll('_', ' ');
    }
  }
}
