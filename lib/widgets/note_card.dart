import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:intl/intl.dart';
import '../models/note_item.dart';

class NoteCard extends StatefulWidget {
  final NoteItem note;
  final VoidCallback onTap;
  final VoidCallback onDelete;
  final VoidCallback onShare;
  final Function(String itemId) onToggleCheckItem;

  const NoteCard({
    Key? key,
    required this.note,
    required this.onTap,
    required this.onDelete,
    required this.onShare,
    required this.onToggleCheckItem,
  }) : super(key: key);

  @override
  State<NoteCard> createState() => _NoteCardState();
}

class _NoteCardState extends State<NoteCard> {
  final FlutterTts _tts = FlutterTts();
  bool _isPlayingAudio = false;

  @override
  void initState() {
    super.initState();
    _tts.setCompletionHandler(() {
      if (mounted) setState(() => _isPlayingAudio = false);
    });
  }

  Future<void> _speak() async {
    if (_isPlayingAudio) {
      await _tts.stop();
      setState(() => _isPlayingAudio = false);
      return;
    }

    setState(() => _isPlayingAudio = true);
    if (widget.note.language == 'bn') {
      await _tts.setLanguage('bn-BD');
    } else {
      await _tts.setLanguage('en-US');
    }

    String textToSpeak = widget.note.title + '. ';
    if (widget.note.isList && widget.note.checklist.isNotEmpty) {
      textToSpeak += widget.note.checklist.map((i) => i.text).join(', ');
    } else {
      textToSpeak += widget.note.content;
    }

    await _tts.speak(textToSpeak);
  }

  Color _getCategoryColor(NoteCategory cat) {
    switch (cat) {
      case NoteCategory.shopping:
        return const Color(0xFFF59E0B);
      case NoteCategory.work:
        return const Color(0xFF3B82F6);
      case NoteCategory.checklist:
        return const Color(0xFF10B981);
      case NoteCategory.idea:
        return const Color(0xFF8B5CF6);
      case NoteCategory.personal:
        return const Color(0xFFEC4899);
      case NoteCategory.memo:
      default:
        return const Color(0xFF6B7280);
    }
  }

  @override
  Widget build(BuildContext context) {
    final note = widget.note;
    final catColor = _getCategoryColor(note.category);
    final formattedDate = DateFormat('MMM d, h:mm a').format(note.createdAt);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: widget.onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Category, Language & Actions
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: catColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      note.category.name.toUpperCase(),
                      style: TextStyle(
                        color: catColor,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      note.language == 'bn' ? 'বাংলা' : 'EN',
                      style: TextStyle(
                        color: Colors.grey.shade700,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const Spacer(),
                  // TTS Read Aloud
                  IconButton(
                    iconSize: 18,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    icon: Icon(
                      _isPlayingAudio ? Icons.stop_circle : Icons.volume_up_outlined,
                      color: _isPlayingAudio ? Colors.redAccent : Colors.grey.shade600,
                    ),
                    onPressed: _speak,
                  ),
                  const SizedBox(width: 8),
                  // Share
                  IconButton(
                    iconSize: 18,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    icon: Icon(Icons.share_outlined, color: Colors.grey.shade600),
                    onPressed: widget.onShare,
                  ),
                  const SizedBox(width: 8),
                  // Delete
                  IconButton(
                    iconSize: 18,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    icon: Icon(Icons.delete_outline, color: Colors.grey.shade400),
                    onPressed: widget.onDelete,
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Title
              Text(
                note.title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF111827),
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),

              // Checklist preview or Content
              if (note.isList && note.checklist.isNotEmpty) ...[
                Column(
                  children: note.checklist.take(4).map((item) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          GestureDetector(
                            onTap: () => widget.onToggleCheckItem(item.id),
                            child: Icon(
                              item.isDone ? Icons.check_circle : Icons.radio_button_unchecked,
                              size: 16,
                              color: item.isDone ? Colors.emerald : Colors.grey.shade400,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              item.text,
                              style: TextStyle(
                                fontSize: 13,
                                color: item.isDone ? Colors.grey.shade400 : Colors.grey.shade800,
                                decoration: item.isDone ? TextDecoration.lineThrough : null,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
                if (note.checklist.length > 4)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      '+ ${note.checklist.length - 4} more items',
                      style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                    ),
                  ),
              ] else ...[
                Text(
                  note.content,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade700,
                    height: 1.4,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ],

              // Footer Date
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    formattedDate,
                    style: TextStyle(fontSize: 11, color: Colors.grey.shade400),
                  ),
                  if (note.summary != null && note.summary!.isNotEmpty)
                    Row(
                      children: [
                        Icon(Icons.auto_awesome, size: 12, color: Colors.amber.shade700),
                        const SizedBox(width: 4),
                        Text(
                          'AI Summary',
                          style: TextStyle(fontSize: 10, color: Colors.amber.shade800),
                        ),
                      ],
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
