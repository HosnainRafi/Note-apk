import 'package:flutter/foundation.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../models/note_item.dart';

class SpeechService {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isAvailable = false;
  bool _isListening = false;

  bool get isAvailable => _isAvailable;
  bool get isListening => _isListening;

  Future<bool> initialize() async {
    try {
      _isAvailable = await _speech.initialize(
        onError: (error) => debugPrint('Speech error: $error'),
        onStatus: (status) => debugPrint('Speech status: $status'),
      );
      return _isAvailable;
    } catch (e) {
      debugPrint('Speech initialization failed: $e');
      _isAvailable = false;
      return false;
    }
  }

  Future<void> startListening({
    required Function(String text, bool isFinal, String detectedLang) onResult,
    String localeId = 'auto', // 'bn_BD', 'en_US', or 'auto'
  }) async {
    if (!_isAvailable) {
      final ok = await initialize();
      if (!ok) return;
    }

    _isListening = true;

    // Pick locale
    String targetLocale = 'en_US';
    if (localeId == 'bn_BD' || localeId == 'bn') {
      targetLocale = 'bn_BD';
    } else if (localeId == 'auto') {
      targetLocale = 'bn_BD'; // Default to Bangla with auto-switch fallback
    }

    try {
      await _speech.listen(
        onResult: (result) {
          final words = result.recognizedWords;
          final isBangla = _hasBanglaCharacters(words);
          final lang = isBangla ? 'bn' : 'en';

          onResult(words, result.finalResult, lang);
        },
        localeId: targetLocale,
        listenMode: stt.ListenMode.dictation,
        cancelOnError: false,
        partialResults: true,
      );
    } catch (e) {
      debugPrint('Error starting speech listen: $e');
      _isListening = false;
    }
  }

  Future<void> stopListening() async {
    _isListening = false;
    await _speech.stop();
  }

  bool _hasBanglaCharacters(String text) {
    // Unicode block for Bengali: U+0980 to U+09FF
    final regex = RegExp(r'[\u0980-\u09FF]');
    return regex.hasMatch(text);
  }

  /// Parses voice transcripts into checklists or notes offline
  Map<String, dynamic> parseTranscriptOffline(String text) {
    final clean = text.trim();
    if (clean.isEmpty) {
      return {
        'title': 'Empty Note',
        'isList': false,
        'items': <String>[],
        'category': NoteCategory.memo,
        'language': 'en',
      };
    }

    final isBangla = _hasBanglaCharacters(clean);
    final lang = isBangla ? 'bn' : 'en';

    // Checklist triggers
    final isShopping = isBangla
        ? clean.contains('কিনব') ||
            clean.contains('বাজার') ||
            clean.contains('দোকান') ||
            clean.contains('লিস্ট')
        : clean.toLowerCase().contains('buy') ||
            clean.toLowerCase().contains('grocery') ||
            clean.toLowerCase().contains('market') ||
            clean.toLowerCase().contains('shopping');

    final isChecklist = clean.contains('\n') ||
        clean.contains(',') ||
        clean.contains('এবং') ||
        clean.contains(' ও ') ||
        clean.toLowerCase().contains(' and ') ||
        isShopping;

    List<String> items = [];
    if (isChecklist) {
      // Split by commas, and, এবং, or newlines
      final splitRegex = RegExp(r'[\n,]|(\s+(এবং|ও|and)\s+)');
      items = clean
          .split(splitRegex)
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty && s != 'এবং' && s != 'ও' && s.toLowerCase() != 'and')
          .toList();
    }

    // Auto title
    String title = clean;
    if (clean.length > 35) {
      title = clean.substring(0, 32) + '...';
    }

    NoteCategory cat = NoteCategory.memo;
    if (isShopping) {
      cat = NoteCategory.shopping;
    } else if (items.isNotEmpty) {
      cat = NoteCategory.checklist;
    } else if (clean.toLowerCase().contains('idea') || clean.contains('আইডিয়া')) {
      cat = NoteCategory.idea;
    } else if (clean.toLowerCase().contains('work') ||
        clean.toLowerCase().contains('task') ||
        clean.contains('কাজ')) {
      cat = NoteCategory.work;
    }

    return {
      'title': title,
      'isList': items.length > 1,
      'items': items,
      'category': cat,
      'language': lang,
    };
  }

  /// Hotword detection helper ("Hey Note" / "হে নোট")
  bool isHotword(String speech) {
    final lower = speech.toLowerCase();
    return lower.contains('hey note') ||
        lower.contains('heynote') ||
        lower.contains('হে নোট') ||
        lower.contains('হেই নোট');
  }
}
