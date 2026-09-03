import 'package:flutter/foundation.dart';
import 'package:home_widget/home_widget.dart';
import '../models/note_item.dart';

class WidgetService {
  static const String appGroupId = 'group.com.heynote.app';
  static const String androidWidgetProvider = 'HeyNoteWidgetProvider';

  static Future<void> initialize() async {
    try {
      await HomeWidget.setAppGroupId(appGroupId);
    } catch (e) {
      debugPrint('WidgetService init error: $e');
    }
  }

  /// Updates Android Home Screen Widget with latest note info
  static Future<void> updateWidgetData(List<NoteItem> notes) async {
    try {
      final activeNotes = notes;
      final recentTitle = activeNotes.isNotEmpty ? activeNotes.first.title : 'No notes yet';
      final count = activeNotes.length.toString();

      await HomeWidget.saveWidgetData<String>('widget_title', 'HeyNote Voice Mic');
      await HomeWidget.saveWidgetData<String>('widget_recent_note', recentTitle);
      await HomeWidget.saveWidgetData<String>('widget_count', count);

      await HomeWidget.updateWidget(
        androidName: androidWidgetProvider,
      );
    } catch (e) {
      debugPrint('Error updating home widget data: $e');
    }
  }

  /// Registers background callback for widget clicks
  static Future<void> registerInteractivity(Function(Uri?) callback) async {
    try {
      HomeWidget.initiallyLaunchedFromHomeWidget().then(callback);
      HomeWidget.widgetClicked.listen(callback);
    } catch (e) {
      debugPrint('Error registering widget callback: $e');
    }
  }
}
