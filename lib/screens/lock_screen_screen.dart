import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/note_item.dart';
import '../services/speech_service.dart';

class LockScreenScreen extends StatefulWidget {
  final Function(NoteItem) onSaveNote;

  const LockScreenScreen({Key? key, required this.onSaveNote}) : super(key: key);

  @override
  State<LockScreenScreen> createState() => _LockScreenScreenState();
}

class _LockScreenScreenState extends State<LockScreenScreen>
    with SingleTickerProviderStateMixin {
  final SpeechService _speechService = SpeechService();
  String _timeString = '';
  String _dateString = '';
  Timer? _timer;
  bool _isListening = false;
  String _transcript = '';
  late AnimationController _waveController;

  @override
  void initState() {
    super.initState();
    _updateTime();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) => _updateTime());

    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
  }

  void _updateTime() {
    final now = DateTime.now();
    if (mounted) {
      setState(() {
        _timeString = DateFormat('hh:mm').format(now);
        _dateString = DateFormat('EEEE, MMMM d').format(now);
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _waveController.dispose();
    _speechService.stopListening();
    super.dispose();
  }

  void _toggleLockRecording() async {
    if (_isListening) {
      await _speechService.stopListening();
      setState(() => _isListening = false);
      if (_transcript.trim().isNotEmpty) {
        _saveLockNote();
      }
    } else {
      setState(() {
        _transcript = '';
        _isListening = true;
      });
      await _speechService.startListening(
        localeId: 'auto',
        onResult: (text, isFinal, lang) {
          setState(() {
            _transcript = text;
            if (isFinal) {
              _isListening = false;
              _saveLockNote();
            }
          });
        },
      );
    }
  }

  void _saveLockNote() {
    if (_transcript.trim().isEmpty) return;

    final parsed = _speechService.parseTranscriptOffline(_transcript);
    final newNote = NoteItem(
      id: 'lock_note_${DateTime.now().millisecondsSinceEpoch}',
      title: parsed['title'] as String,
      content: _transcript,
      category: parsed['category'] as NoteCategory,
      language: parsed['language'] as String,
      isList: parsed['isList'] as bool,
      checklist: (parsed['items'] as List<String>)
          .map((item) => ChecklistItem(
                id: 'item_${DateTime.now().millisecondsSinceEpoch}',
                text: item,
              ))
          .toList(),
      tags: ['lockscreen', 'voice', parsed['language'] == 'bn' ? 'বাংলা' : 'english'],
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    widget.onSaveNote(newNote);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Saved from Lock Screen: "${newNote.title}"'),
        backgroundColor: Colors.white,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black, // Pure AMOLED Black
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Top Lock Screen status
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Icon(Icons.lock_outline, color: Colors.white70, size: 20),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),

              // Digital Clock
              Column(
                children: [
                  Text(
                    _timeString,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 72,
                      fontWeight: FontWeight.w200,
                      letterSpacing: -2,
                    ),
                  ),
                  Text(
                    _dateString,
                    style: const TextStyle(
                      color: Colors.white60,
                      fontSize: 16,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),

              // Center: Voice Trigger
              Column(
                children: [
                  if (_isListening)
                    Container(
                      margin: const EdgeInsets.only(bottom: 20),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white12,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        _transcript.isNotEmpty
                            ? _transcript
                            : 'Listening in Bangla or English...',
                        style: const TextStyle(color: Colors.white, fontSize: 16),
                        textAlign: TextAlign.center,
                      ),
                    ),

                  // Mic Button
                  GestureDetector(
                    onTap: _toggleLockRecording,
                    child: AnimatedBuilder(
                      animation: _waveController,
                      builder: (context, child) {
                        return Container(
                          width: 80 + (_isListening ? _waveController.value * 16 : 0),
                          height: 80 + (_isListening ? _waveController.value * 16 : 0),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _isListening ? Colors.redAccent : Colors.white,
                            boxShadow: [
                              BoxShadow(
                                color: (_isListening ? Colors.redAccent : Colors.white)
                                    .withOpacity(0.4),
                                blurRadius: 30,
                                spreadRadius: 4,
                              ),
                            ],
                          ),
                          child: Icon(
                            _isListening ? Icons.stop : Icons.mic,
                            color: _isListening ? Colors.white : Colors.black,
                            size: 36,
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _isListening
                        ? 'Tap to Stop & Save'
                        : 'Say "Hey Note" or "হে নোট"',
                    style: const TextStyle(
                      color: Colors.white60,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),

              // Bottom Swipe Hint
              const Column(
                children: [
                  Icon(Icons.keyboard_arrow_up, color: Colors.white38),
                  Text(
                    'Swipe up to unlock',
                    style: TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
