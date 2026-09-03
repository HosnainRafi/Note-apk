import 'package:flutter/material.dart';
import '../models/note_item.dart';
import '../services/storage_service.dart';
import '../services/speech_service.dart';
import '../widgets/note_card.dart';
import '../widgets/voice_capture_dialog.dart';
import 'note_editor_screen.dart';
import 'lock_screen_screen.dart';

class HomeScreen extends StatefulWidget {
  final bool initialRecordTrigger;

  const HomeScreen({Key? key, this.initialRecordTrigger = false}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final StorageService _storageService = StorageService();
  List<NoteItem> _notes = [];
  String _searchQuery = '';
  NoteCategory? _selectedCategory;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotes();

    if (widget.initialRecordTrigger) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _openVoiceModal(autoStart: true);
      });
    }
  }

  Future<void> _loadNotes() async {
    setState(() => _isLoading = true);
    final loaded = await _storageService.loadNotes();
    setState(() {
      _notes = loaded;
      _isLoading = false;
    });
  }

  void _openVoiceModal({bool autoStart = true}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => VoiceCaptureDialog(
        autoStart: autoStart,
        onSaveNote: (newNote) async {
          await _storageService.addNote(newNote);
          _loadNotes();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Note Saved: "${newNote.title}"'),
              backgroundColor: Colors.black87,
              behavior: SnackBarBehavior.floating,
            ),
          );
        },
      ),
    );
  }

  void _openEditor({NoteItem? note}) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (ctx) => NoteEditorScreen(
          initialNote: note,
          onSave: (savedNote) async {
            if (note == null) {
              await _storageService.addNote(savedNote);
            } else {
              await _storageService.updateNote(savedNote);
            }
            _loadNotes();
          },
        ),
      ),
    );
  }

  void _openLockScreen() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (ctx) => LockScreenScreen(
          onSaveNote: (newNote) async {
            await _storageService.addNote(newNote);
            _loadNotes();
          },
        ),
      ),
    );
  }

  List<NoteItem> get _filteredNotes {
    return _notes.where((note) {
      final matchesCat = _selectedCategory == null || note.category == _selectedCategory;
      final q = _searchQuery.toLowerCase();
      final matchesSearch = q.isEmpty ||
          note.title.toLowerCase().contains(q) ||
          note.content.toLowerCase().contains(q) ||
          note.tags.any((t) => t.toLowerCase().contains(q));
      return matchesCat && matchesSearch;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.mic, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'HeyNote',
                  style: TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  'হে নোট • Bilingual Voice Vault',
                  style: TextStyle(color: Colors.grey, fontSize: 10),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Lock Screen launcher button
          TextButton.icon(
            style: TextButton.styleFrom(
              foregroundColor: Colors.black87,
              backgroundColor: Colors.grey.shade100,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.lock_clock, size: 16),
            label: const Text('Lock Mode', style: TextStyle(fontSize: 12)),
            onPressed: _openLockScreen,
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Column(
              children: [
                // Search Input Field
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: const InputDecoration(
                      hintText: 'Search notes, checklists, or tags...',
                      hintStyle: TextStyle(fontSize: 13, color: Colors.grey),
                      prefixIcon: Icon(Icons.search, size: 20, color: Colors.grey),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Category Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildCategoryChip('All Notes', null),
                      _buildCategoryChip('Shopping (বাজার)', NoteCategory.shopping),
                      _buildCategoryChip('Work (কাজ)', NoteCategory.work),
                      _buildCategoryChip('Checklist', NoteCategory.checklist),
                      _buildCategoryChip('Ideas (আইডিয়া)', NoteCategory.idea),
                      _buildCategoryChip('Personal', NoteCategory.personal),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Notes List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredNotes.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.mic_none, size: 54, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            Text(
                              _notes.isEmpty
                                  ? 'No voice notes yet'
                                  : 'No notes match your search',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey.shade700,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Tap the microphone below to record in Bangla or English',
                              style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadNotes,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(top: 8, bottom: 84),
                          itemCount: _filteredNotes.length,
                          itemBuilder: (context, index) {
                            final note = _filteredNotes[index];
                            return NoteCard(
                              note: note,
                              onTap: () => _openEditor(note: note),
                              onDelete: () async {
                                await _storageService.deleteNote(note.id);
                                _loadNotes();
                              },
                              onShare: () => _storageService.shareToGoogleKeepOrExternal(note),
                              onToggleCheckItem: (itemId) async {
                                await _storageService.toggleChecklistItem(note.id, itemId);
                                _loadNotes();
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Add Text Note
          FloatingActionButton.extended(
            heroTag: 'fab_text',
            backgroundColor: Colors.white,
            foregroundColor: Colors.black87,
            elevation: 3,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            icon: const Icon(Icons.edit_note, size: 20),
            label: const Text('Text Note', style: TextStyle(fontWeight: FontWeight.bold)),
            onPressed: () => _openEditor(),
          ),
          const SizedBox(width: 12),

          // Primary Mic Trigger
          FloatingActionButton.extended(
            heroTag: 'fab_mic',
            backgroundColor: Colors.black,
            foregroundColor: Colors.white,
            elevation: 4,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            icon: const Icon(Icons.mic, size: 22),
            label: const Text(
              'Voice Mic • হে নোট',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            onPressed: () => _openVoiceModal(autoStart: true),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String label, NoteCategory? category) {
    final isSelected = _selectedCategory == category;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: Colors.black,
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: BorderSide(
            color: isSelected ? Colors.black : Colors.grey.shade300,
          ),
        ),
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : Colors.grey.shade800,
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
        ),
        onSelected: (selected) {
          setState(() {
            _selectedCategory = selected ? category : null;
          });
        },
      ),
    );
  }
}
