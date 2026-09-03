import 'package:flutter/material.dart';
import '../models/note_item.dart';
import '../services/speech_service.dart';
import '../services/gemini_service.dart';

class NoteEditorScreen extends StatefulWidget {
  final NoteItem? initialNote;
  final Function(NoteItem) onSave;

  const NoteEditorScreen({
    Key? key,
    this.initialNote,
    required this.onSave,
  }) : super(key: key);

  @override
  State<NoteEditorScreen> createState() => _NoteEditorScreenState();
}

class _NoteEditorScreenState extends State<NoteEditorScreen> {
  late TextEditingController _titleController;
  late TextEditingController _contentController;
  late NoteCategory _category;
  late String _language;
  late bool _isList;
  List<ChecklistItem> _checklist = [];
  bool _isListening = false;
  bool _isLoadingAI = false;
  final SpeechService _speechService = SpeechService();

  @override
  void initState() {
    super.initState();
    final n = widget.initialNote;
    _titleController = TextEditingController(text: n?.title ?? '');
    _contentController = TextEditingController(text: n?.content ?? '');
    _category = n?.category ?? NoteCategory.memo;
    _language = n?.language ?? 'en';
    _isList = n?.isList ?? false;
    _checklist = n != null ? List.from(n.checklist) : [];
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _speechService.stopListening();
    super.dispose();
  }

  void _save() {
    final title = _titleController.text.trim().isEmpty
        ? 'Untitled Note'
        : _titleController.text.trim();

    final note = NoteItem(
      id: widget.initialNote?.id ?? 'note_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      content: _contentController.text.trim(),
      category: _category,
      language: _language,
      isList: _isList,
      checklist: _checklist,
      summary: widget.initialNote?.summary,
      createdAt: widget.initialNote?.createdAt ?? DateTime.now(),
      updatedAt: DateTime.now(),
    );

    widget.onSave(note);
    Navigator.of(context).pop();
  }

  void _toggleMic() async {
    if (_isListening) {
      await _speechService.stopListening();
      setState(() => _isListening = false);
    } else {
      setState(() => _isListening = true);
      await _speechService.startListening(
        localeId: _language == 'bn' ? 'bn_BD' : 'en_US',
        onResult: (text, isFinal, lang) {
          setState(() {
            _language = lang;
            if (_isList) {
              // Add as checklist item
              _checklist.add(ChecklistItem(
                id: 'item_${DateTime.now().millisecondsSinceEpoch}',
                text: text,
              ));
            } else {
              _contentController.text = (_contentController.text.isEmpty
                      ? ''
                      : _contentController.text + ' ') +
                  text;
            }
            if (isFinal) {
              _isListening = false;
            }
          });
        },
      );
    }
  }

  void _generateAISummary() async {
    final text = _contentController.text.isNotEmpty
        ? _contentController.text
        : _checklist.map((i) => i.text).join(', ');

    if (text.isEmpty) return;

    setState(() => _isLoadingAI = true);
    final summary = await GeminiService.summarizeNote(text: text, language: _language);
    setState(() => _isLoadingAI = false);

    if (summary != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('AI Insight: $summary'),
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Colors.black),
        title: Text(
          widget.initialNote == null ? 'New Note' : 'Edit Note',
          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 18),
        ),
        actions: [
          // AI Summarize Button
          IconButton(
            icon: _isLoadingAI
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.auto_awesome, color: Colors.amber),
            tooltip: 'Gemini AI Summary',
            onPressed: _isLoadingAI ? null : _generateAISummary,
          ),
          // Save Button
          IconButton(
            icon: const Icon(Icons.check, color: Colors.black),
            tooltip: 'Save Note',
            onPressed: _save,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category & List Toggle Bar
            Row(
              children: [
                // Category Picker
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<NoteCategory>(
                      value: _category,
                      style: const TextStyle(fontSize: 13, color: Colors.black, fontWeight: FontWeight.w600),
                      items: NoteCategory.values.map((cat) {
                        return DropdownMenuItem(
                          value: cat,
                          child: Text(cat.name.toUpperCase()),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _category = val);
                      },
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // Language toggle
                ActionChip(
                  label: Text(_language == 'bn' ? 'বাংলা' : 'English'),
                  backgroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.grey.shade300),
                  ),
                  onPressed: () {
                    setState(() {
                      _language = _language == 'bn' ? 'en' : 'bn';
                    });
                  },
                ),
                const Spacer(),

                // Checklist Mode Toggle
                ChoiceChip(
                  label: const Text('Checklist'),
                  selected: _isList,
                  selectedColor: Colors.black,
                  labelStyle: TextStyle(
                    color: _isList ? Colors.white : Colors.black,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                  onSelected: (selected) {
                    setState(() => _isList = selected);
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Title Field
            TextField(
              controller: _titleController,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              decoration: const InputDecoration(
                hintText: 'Note Title...',
                hintStyle: TextStyle(color: Colors.black38),
                border: InputBorder.none,
              ),
            ),
            const Divider(),

            // Content or Checklist Section
            if (!_isList) ...[
              TextField(
                controller: _contentController,
                maxLines: null,
                minLines: 8,
                style: const TextStyle(fontSize: 15, height: 1.5),
                decoration: const InputDecoration(
                  hintText: 'Type or speak your thoughts in Bangla or English...',
                  hintStyle: TextStyle(color: Colors.black38),
                  border: InputBorder.none,
                ),
              ),
            ] else ...[
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _checklist.length,
                itemBuilder: (context, index) {
                  final item = _checklist[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        Checkbox(
                          value: item.isDone,
                          onChanged: (val) {
                            setState(() => item.isDone = val ?? false);
                          },
                        ),
                        Expanded(
                          child: TextFormField(
                            initialValue: item.text,
                            style: TextStyle(
                              decoration: item.isDone ? TextDecoration.lineThrough : null,
                              color: item.isDone ? Colors.grey : Colors.black,
                            ),
                            onChanged: (val) => item.text = val,
                            decoration: const InputDecoration(
                              border: InputBorder.none,
                              isDense: true,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, size: 18, color: Colors.grey),
                          onPressed: () {
                            setState(() => _checklist.removeAt(index));
                          },
                        ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 10),
              TextButton.icon(
                icon: const Icon(Icons.add, size: 18, color: Colors.black),
                label: const Text('Add Checklist Item', style: TextStyle(color: Colors.black)),
                onPressed: () {
                  setState(() {
                    _checklist.add(ChecklistItem(
                      id: 'item_${DateTime.now().millisecondsSinceEpoch}',
                      text: '',
                    ));
                  });
                },
              ),
            ],
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: _isListening ? Colors.redAccent : Colors.black,
        onPressed: _toggleMic,
        tooltip: _isListening ? 'Stop Mic' : 'Voice Dictate',
        child: Icon(_isListening ? Icons.stop : Icons.mic, color: Colors.white),
      ),
    );
  }
}
