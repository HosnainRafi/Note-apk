import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:share_plus/share_plus.dart';
import '../models/note_item.dart';
import 'widget_service.dart';
import 'google_sync_service.dart';

class StorageService {
  static const String _notesKey = 'heynote_saved_notes_v1';

  Future<List<NoteItem>> loadNotes() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = prefs.getString(_notesKey);
      if (jsonString == null || jsonString.isEmpty) {
        return _getInitialSampleNotes();
      }

      final List<dynamic> decoded = jsonDecode(jsonString);
      return decoded.map((item) => NoteItem.fromJson(Map<String, dynamic>.from(item))).toList();
    } catch (e) {
      debugPrint('Error loading notes: $e');
      return _getInitialSampleNotes();
    }
  }

  Future<void> saveNotes(List<NoteItem> notes) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = jsonEncode(notes.map((n) => n.toJson()).toList());
      await prefs.setString(_notesKey, jsonString);

      // Sync latest note & count to Android Home Widget
      await WidgetService.updateWidgetData(notes);
    } catch (e) {
      debugPrint('Error saving notes: $e');
    }
  }

  Future<void> addNote(NoteItem note) async {
    final list = await loadNotes();
    list.insert(0, note);
    await saveNotes(list);
    
    // Background Sync to Google Tasks
    GoogleSyncService.syncNoteToGoogleTasks(note);
  }

  Future<void> updateNote(NoteItem updatedNote) async {
    final list = await loadNotes();
    final index = list.indexWhere((n) => n.id == updatedNote.id);
    if (index != -1) {
      list[index] = updatedNote;
      await saveNotes(list);
      
      // Background Sync to Google Tasks
      GoogleSyncService.syncNoteToGoogleTasks(updatedNote);
    }
  }

  Future<void> deleteNote(String id) async {
    final list = await loadNotes();
    list.removeWhere((n) => n.id == id);
    await saveNotes(list);
  }

  Future<void> toggleChecklistItem(String noteId, String itemId) async {
    final list = await loadNotes();
    final noteIndex = list.indexWhere((n) => n.id == noteId);
    if (noteIndex != -1) {
      final itemIndex = list[noteIndex].checklist.indexWhere((i) => i.id == itemId);
      if (itemIndex != -1) {
        list[noteIndex].checklist[itemIndex].isDone = !list[noteIndex].checklist[itemIndex].isDone;
        list[noteIndex].updatedAt = DateTime.now();
        await saveNotes(list);
      }
    }
  }

  Future<void> shareToGoogleKeepOrExternal(NoteItem note) async {
    final buffer = StringBuffer();
    buffer.writeln(note.title);
    buffer.writeln();
    if (note.isList && note.checklist.isNotEmpty) {
      for (var item in note.checklist) {
        buffer.writeln('${item.isDone ? '☑' : '☐'} ${item.text}');
      }
    } else {
      buffer.writeln(note.content);
    }

    if (note.summary != null && note.summary!.isNotEmpty) {
      buffer.writeln();
      buffer.writeln('AI Summary: ${note.summary}');
    }

    try {
      await Share.share(
        buffer.toString().trim(),
        subject: 'HeyNote: ${note.title}',
      );
    } catch (e) {
      debugPrint('Share error: $e');
    }
  }

  List<NoteItem> _getInitialSampleNotes() {
    return [
      NoteItem(
        id: 'sample-1',
        title: 'বাজারের তালিকা (Grocery List)',
        content: 'ডিম ১ ডজন, দুধ ২ লিটার, চাল ৫ কেজি, চিনি ১ কেজি',
        category: NoteCategory.shopping,
        language: 'bn',
        isList: true,
        checklist: [
          ChecklistItem(id: 'item-1', text: 'ডিম ১ ডজন', isDone: false),
          ChecklistItem(id: 'item-2', text: 'দুধ ২ লিটার', isDone: true),
          ChecklistItem(id: 'item-3', text: 'চাল ৫ কেজি', isDone: false),
          ChecklistItem(id: 'item-4', text: 'চিনি ১ কেজি', isDone: false),
        ],
        tags: ['বাজার', 'মুদিদোকান', 'জরুরি'],
        isPinned: true,
        summary: 'দৈনন্দিন মুদি বাজার সামগ্রী তালিকা।',
      ),
      NoteItem(
        id: 'sample-2',
        title: 'Project Standup Sync',
        content: 'Review Flutter Android APK, test Home Screen Widget, verify Bangla speech recognition.',
        category: NoteCategory.work,
        language: 'en',
        isList: false,
        tags: ['flutter', 'apk', 'android'],
        isPinned: false,
        summary: 'Technical sprint priorities for Flutter APK release.',
      ),
    ];
  }
}
