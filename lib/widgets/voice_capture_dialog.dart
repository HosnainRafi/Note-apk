import 'package:flutter/material.dart';
import '../models/note_item.dart';
import '../services/speech_service.dart';

class VoiceCaptureDialog extends StatefulWidget {
  final Function(NoteItem) onSaveNote;
  final bool autoStart;

  const VoiceCaptureDialog({
    Key? key,
    required this.onSaveNote,
    this.autoStart = true,
  }) : super(key: key);

  @override
  State<VoiceCaptureDialog> createState() => _VoiceCaptureDialogState();
}

class _VoiceCaptureDialogState extends State<VoiceCaptureDialog>
    with SingleTickerProviderStateMixin {
  final SpeechService _speechService = SpeechService();
  String _transcript = '';
  String _detectedLang = 'en';
  String _localeMode = 'auto'; // 'auto', 'bn_BD', 'en_US'
  bool _isListening = false;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    if (widget.autoStart) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _startRecording();
      });
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _speechService.stopListening();
    super.dispose();
  }

  Future<void> _startRecording() async {
    if (!mounted) return;
    setState(() {
      _transcript = '';
      _isListening = true;
    });

    await _speechService.startListening(
      localeId: _localeMode,
      onResult: (text, isFinal, lang) {
        if (!mounted) return;
        setState(() {
          _transcript = text;
          _detectedLang = lang;
          if (isFinal) {
            _isListening = false;
          }
        });
      },
    );
  }

  Future<void> _stopRecording() async {
    await _speechService.stopListening();
    if (!mounted) return;
    setState(() {
      _isListening = false;
    });
  }

  void _handleSave({bool forceList = false}) {
    if (_transcript.trim().isEmpty) return;

    final parsed = _speechService.parseTranscriptOffline(_transcript);

    final List<ChecklistItem> clItems = [];
    final itemsList = parsed['items'] as List<String>;
    for (int i = 0; i < itemsList.length; i++) {
      clItems.add(ChecklistItem(
        id: 'item_${DateTime.now().millisecondsSinceEpoch}_$i',
        text: itemsList[i],
        isDone: false,
      ));
    }

    final newNote = NoteItem(
      id: 'note_${DateTime.now().millisecondsSinceEpoch}',
      title: parsed['title'] as String,
      content: _transcript,
      category: parsed['category'] as NoteCategory,
      language: parsed['language'] as String,
      isList: forceList || (parsed['isList'] as bool),
      checklist: clItems,
      tags: [
        'voice',
        parsed['language'] == 'bn' ? 'বাংলা' : 'english',
        if (forceList || (parsed['isList'] as bool)) 'checklist'
      ],
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    widget.onSaveNote(newNote);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      backgroundColor: const Color(0xFF1E2022),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Top Bar: Language Mode and Close
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.mic, color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                    const Text(
                      'HeyNote Mic',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                // Language Mode Selector
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _localeMode,
                      dropdownColor: const Color(0xFF2C2F33),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                      icon: const Icon(Icons.arrow_drop_down, color: Colors.white70, size: 16),
                      items: const [
                        DropdownMenuItem(value: 'auto', child: Text('Auto BN/EN')),
                        DropdownMenuItem(value: 'bn_BD', child: Text('বাংলা (BD)')),
                        DropdownMenuItem(value: 'en_US', child: Text('English (US)')),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _localeMode = val;
                          });
                          _startRecording();
                        }
                      },
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Pulsing Voice Waveform / Mic
            GestureDetector(
              onTap: () {
                if (_isListening) {
                  _stopRecording();
                } else {
                  _startRecording();
                }
              },
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  return Container(
                    width: 90 + (_isListening ? _pulseController.value * 16 : 0),
                    height: 90 + (_isListening ? _pulseController.value * 16 : 0),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isListening
                          ? Colors.redAccent.withOpacity(0.85)
                          : Colors.white.withOpacity(0.12),
                      boxShadow: _isListening
                          ? [
                              BoxShadow(
                                color: Colors.redAccent.withOpacity(0.5),
                                blurRadius: 24,
                                spreadRadius: 4,
                              ),
                            ]
                          : [],
                    ),
                    child: Center(
                      child: Icon(
                        _isListening ? Icons.stop : Icons.mic,
                        color: Colors.white,
                        size: 38,
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),

            // Live status & Detected Language
            Text(
              _isListening
                  ? 'Listening (${_detectedLang == 'bn' ? 'বাংলা' : 'English'})...'
                  : 'Tap microphone to start speaking',
              style: TextStyle(
                color: _isListening ? Colors.redAccent : Colors.white60,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 16),

            // Realtime Transcription Box
            Container(
              constraints: const BoxConstraints(minHeight: 70, maxHeight: 160),
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.black38,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _isListening
                      ? Colors.redAccent.withOpacity(0.4)
                      : Colors.white12,
                ),
              ),
              child: SingleChildScrollView(
                child: Text(
                  _transcript.isNotEmpty
                      ? _transcript
                      : 'Speak in Bangla or English...\ne.g. "দুধ, ডিম ও রুটি কিনব" or "Finish Flutter APK build"',
                  style: TextStyle(
                    color: _transcript.isNotEmpty ? Colors.white : Colors.white38,
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white70,
                      side: const BorderSide(color: Colors.white24),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    icon: const Icon(Icons.checklist, size: 18),
                    label: const Text('As Checklist', style: TextStyle(fontSize: 12)),
                    onPressed: _transcript.trim().isEmpty
                        ? null
                        : () => _handleSave(forceList: true),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    icon: const Icon(Icons.check, size: 18),
                    label: const Text(
                      'Save Note',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    onPressed: _transcript.trim().isEmpty
                        ? null
                        : () => _handleSave(forceList: false),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
