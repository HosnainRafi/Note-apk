import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class GeminiService {
  // Can be set by the user or passed from environment
  static String? apiKey;

  static const String _geminiEndpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  static Future<String?> summarizeNote({
    required String text,
    String language = 'bn',
  }) async {
    if (apiKey == null || apiKey!.isEmpty) {
      // Fallback offline summary
      if (text.length > 50) {
        return text.substring(0, 48) + '...';
      }
      return text;
    }

    try {
      final prompt = language == 'bn'
          ? 'নিম্নলিখিত ভয়েস নোটটির ১ বা ২ লাইনের সংক্ষেপ এবং মূল করণীয় কাজগুলো বের করো:\n"$text"'
          : 'Summarize the following voice note in 1 or 2 concise sentences with key action points:\n"$text"';

      final response = await http.post(
        Uri.parse('$_geminiEndpoint?key=$apiKey'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'contents': [
            {
              'parts': [
                {'text': prompt}
              ]
            }
          ]
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final candidates = data['candidates'] as List?;
        if (candidates != null && candidates.isNotEmpty) {
          final content = candidates[0]['content'];
          final parts = content['parts'] as List?;
          if (parts != null && parts.isNotEmpty) {
            return parts[0]['text'] as String?;
          }
        }
      }
    } catch (e) {
      debugPrint('Gemini API Error: $e');
    }
    return null;
  }

  static Future<List<String>> extractChecklistItems({
    required String text,
    String language = 'bn',
  }) async {
    if (apiKey == null || apiKey!.isEmpty) {
      return [];
    }

    try {
      final prompt =
          'Extract all distinct checklist or to-do items from this text. Return strictly a JSON array of strings without formatting. Text:\n"$text"';

      final response = await http.post(
        Uri.parse('$_geminiEndpoint?key=$apiKey'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'contents': [
            {
              'parts': [
                {'text': prompt}
              ]
            }
          ]
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final textOut = data['candidates'][0]['content']['parts'][0]['text'] as String;
        final clean = textOut.replaceAll('```json', '').replaceAll('```', '').trim();
        final decoded = jsonDecode(clean);
        if (decoded is List) {
          return decoded.map((e) => e.toString()).toList();
        }
      }
    } catch (e) {
      debugPrint('Gemini Checklist Extraction Error: $e');
    }
    return [];
  }
}
