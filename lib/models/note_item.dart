import 'dart:convert';

enum NoteCategory { personal, work, shopping, checklist, idea, memo }

class ChecklistItem {
  final String id;
  String text;
  bool isDone;

  ChecklistItem({
    required this.id,
    required this.text,
    this.isDone = false,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'text': text,
        'isDone': isDone,
      };

  factory ChecklistItem.fromJson(Map<String, dynamic> json) => ChecklistItem(
        id: json['id'] as String? ?? UniqueKey().toString(),
        text: json['text'] as String? ?? '',
        isDone: json['isDone'] as bool? ?? false,
      );
}

class NoteItem {
  final String id;
  String title;
  String content;
  NoteCategory category;
  String language; // 'bn' or 'en'
  bool isList;
  List<ChecklistItem> checklist;
  List<String> tags;
  String? summary;
  DateTime createdAt;
  DateTime updatedAt;
  bool isPinned;

  NoteItem({
    required this.id,
    required this.title,
    required this.content,
    this.category = NoteCategory.memo,
    this.language = 'en',
    this.isList = false,
    List<ChecklistItem>? checklist,
    List<String>? tags,
    this.summary,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.isPinned = false,
  })  : checklist = checklist ?? [],
        tags = tags ?? [],
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'content': content,
        'category': category.name,
        'language': language,
        'isList': isList,
        'checklist': checklist.map((i) => i.toJson()).toList(),
        'tags': tags,
        'summary': summary,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
        'isPinned': isPinned,
      };

  factory NoteItem.fromJson(Map<String, dynamic> json) {
    NoteCategory parseCategory(String? cat) {
      if (cat == null) return NoteCategory.memo;
      return NoteCategory.values.firstWhere(
        (c) => c.name.toLowerCase() == cat.toLowerCase(),
        orElse: () => NoteCategory.memo,
      );
    }

    var clList = <ChecklistItem>[];
    if (json['checklist'] != null && json['checklist'] is List) {
      clList = (json['checklist'] as List)
          .map((item) => ChecklistItem.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }

    var tgList = <String>[];
    if (json['tags'] != null && json['tags'] is List) {
      tgList = List<String>.from(json['tags']);
    }

    return NoteItem(
      id: json['id'] as String? ?? DateTime.now().millisecondsSinceEpoch.toString(),
      title: json['title'] as String? ?? 'Untitled Note',
      content: json['content'] as String? ?? '',
      category: parseCategory(json['category'] as String?),
      language: json['language'] as String? ?? 'en',
      isList: json['isList'] as bool? ?? false,
      checklist: clList,
      tags: tgList,
      summary: json['summary'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      isPinned: json['isPinned'] as bool? ?? false,
    );
  }
}
