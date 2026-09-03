import { useState, useEffect } from 'react';
import {
  Mic,
  Lock,
  Smartphone,
  Bot,
  Search,
  Download,
  Wifi,
  WifiOff,
  Filter,
  ListTodo,
  FileText,
  Sparkles,
  ExternalLink,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { ImageResolution, NoteCategory, NoteItem } from './types';
import {
  loadNotes,
  saveNotes,
  saveSingleNote,
  deleteNote,
  exportNotesAsJson,
} from './utils/storage';
import NoteCreator from './components/NoteCreator';
import NoteCard from './components/NoteCard';
import LockScreenOverlay from './components/LockScreenOverlay';
import ImageGeneratorModal from './components/ImageGeneratorModal';
import GeminiChatDrawer from './components/GeminiChatDrawer';
import DownloadApkModal from './components/DownloadApkModal';
import { usePWAInstall } from './hooks/usePWAInstall';

export default function App() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isLockScreenActive, setIsLockScreenActive] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [imageGenNote, setImageGenNote] = useState<NoteItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | NoteCategory>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'bn' | 'en'>('all');
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Initialize and load saved notes
  useEffect(() => {
    const loaded = loadNotes();
    setNotes(loaded);

    // Online / Offline network listeners
    const handleOnline = () => {
      setIsOnline(true);
      // Synchronize any pending offline notes
      setNotes((prev) => {
        const synced = prev.map((n) =>
          n.syncStatus === 'offline_saved' ? { ...n, syncStatus: 'synced' as const } : n
        );
        saveNotes(synced);
        return synced;
      });
      showToast('Back online • Synced local notes securely');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline mode active • Notes stored locally');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleSaveNote = (newNote: NoteItem) => {
    const updated = saveSingleNote(newNote);
    setNotes(updated);
    showToast(
      isOnline
        ? 'Note saved & synchronized'
        : 'Note saved securely to offline storage'
    );
  };

  const handleUpdateNote = (updatedNote: NoteItem) => {
    const updated = saveSingleNote(updatedNote);
    setNotes(updated);
  };

  const handleDeleteNote = (id: string) => {
    const updated = deleteNote(id);
    setNotes(updated);
    showToast('Note deleted');
  };

  const handleAttachImage = (
    noteId: string,
    imageUrl: string,
    resolution: ImageResolution,
    prompt: string
  ) => {
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              imageUrl,
              imageResolution: resolution,
              imagePrompt: prompt,
              updatedAt: new Date().toISOString(),
            }
          : n
      );
      saveNotes(updated);
      return updated;
    });
    showToast(`Attached ${resolution} illustration to note`);
  };

  const handleCreateNoteFromChat = (title: string, content: string) => {
    const newNote: NoteItem = {
      id: 'chat-note-' + Date.now(),
      title,
      content,
      category: 'note',
      language: 'bn',
      isList: false,
      checklist: [],
      summary: content.slice(0, 80),
      tags: ['ai-chat', 'gemini'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: isOnline ? 'synced' : 'offline_saved',
    };
    handleSaveNote(newNote);
  };

  // Filter and search logic
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      !searchQuery.trim() ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      n.checklist?.some((c) => c.text.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || n.category === categoryFilter;

    const matchesLanguage =
      languageFilter === 'all' ||
      n.language === languageFilter ||
      (languageFilter === 'bn' && n.language === 'bilingual');

    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const regularNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col selection:bg-gray-900 selection:text-white pb-20 sm:pb-8">
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 px-4 py-2.5 bg-gray-900 text-white text-xs rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Lock Screen Simulated Mode */}
      {isLockScreenActive && (
        <LockScreenOverlay
          onUnlock={() => setIsLockScreenActive(false)}
          onSaveNote={handleSaveNote}
          isOnline={isOnline}
        />
      )}

      {/* Mobile-First White Minimal Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3 transition">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Icon */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-xs shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-gray-900 tracking-tight">
                  HeyNote
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                  APK v1.0.4
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                Bilingual Bangla & English Voice Notes
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Online / Offline Toggle */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100'
              }`}
              title="Toggle network state to test offline transcription"
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
              <span className="hidden md:inline">{isOnline ? 'Keep Sync' : 'Offline Vault'}</span>
            </button>

            {/* Lock Screen simulation */}
            <button
              onClick={() => setIsLockScreenActive(true)}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition flex items-center gap-1.5 shadow-xs"
              title="Simulate Android Lock Screen with 'Hey Note' voice trigger"
            >
              <Lock className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">Lock Screen</span>
            </button>

            {/* AI Assistant Chat */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition flex items-center gap-1.5 shadow-xs"
              title="Open Gemini Bilingual Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-gray-600" />
              <span className="hidden sm:inline">AI Chat</span>
            </button>

            {/* Download APK / Install Button */}
            <button
              id="header-download-apk-button"
              onClick={() => setIsApkModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs active:scale-98"
              title="Download Android APK file or 1-Tap Install"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get APK</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Mobile App Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-5 space-y-6">
        {/* Mobile APK Status & Trigger Banner */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Voice Trigger Listening
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  Ready
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Say <strong className="text-gray-900 font-medium">"Hey Note"</strong> or <strong className="text-gray-900 font-medium">"হে নোট"</strong> to record hands-free even in lock screen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsApkModalOpen(true)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-gray-700" />
              <span>Download APK / Install</span>
            </button>
          </div>
        </div>

        {/* Note Creator Input */}
        <NoteCreator onSaveNote={handleSaveNote} isOnline={isOnline} />

        {/* Filter, Search & Export Bar */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/80 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
            {/* Search Field */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, shopping lists, or #tags..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition"
              />
            </div>

            {/* Export JSON Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => exportNotesAsJson(notes)}
                className="px-3 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-medium text-gray-700 transition flex items-center gap-1.5 shadow-xs"
                title="Export all notes to JSON backup"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>Export Backup</span>
              </button>
            </div>
          </div>

          {/* Chips: Category & Language */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-gray-100 text-xs">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All' },
                { id: 'list', label: 'Checklists' },
                { id: 'note', label: 'Notes' },
                { id: 'reminder', label: 'Reminders' },
                { id: 'idea', label: 'Ideas' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    categoryFilter === cat.id
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Language Chips */}
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'bn', label: 'বাংলা' },
                { id: 'en', label: 'EN' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguageFilter(lang.id as any)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    languageFilter === lang.id
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pinned Notes Section */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Pinned Notes ({pinnedNotes.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                  onOpenImageGen={(n) => setImageGenNote(n)}
                  onOpenKeepSync={() => {}}
                  isOnline={isOnline}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Notes Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recent Notes ({regularNotes.length})
            </h3>
            <span className="text-xs text-gray-400">
              {notes.length} Total • Saved Locally
            </span>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-gray-200 bg-white space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                <Mic className="w-6 h-6 text-gray-500" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">
                No notes saved yet
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Tap the microphone above or say <strong className="text-gray-900 font-medium">"Hey Note"</strong> / <strong className="text-gray-900 font-medium">"হে নোট"</strong> to capture your thoughts, tasks, or shopping lists.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsApkModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download APK to Device</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                  onOpenImageGen={(n) => setImageGenNote(n)}
                  onOpenKeepSync={() => {}}
                  isOnline={isOnline}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Floating Bottom Bar for quick phone navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 py-2 sm:hidden flex items-center justify-around shadow-lg">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center gap-1 text-gray-700 py-1"
        >
          <FileText className="w-4 h-4 text-gray-900" />
          <span className="text-[10px] font-medium">Notes</span>
        </button>

        <button
          onClick={() => setIsLockScreenActive(true)}
          className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 py-1"
        >
          <Lock className="w-4 h-4 text-gray-700" />
          <span className="text-[10px] font-medium">Lock Screen</span>
        </button>

        <button
          onClick={() => setIsChatOpen(true)}
          className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 py-1"
        >
          <Sparkles className="w-4 h-4 text-gray-700" />
          <span className="text-[10px] font-medium">AI Chat</span>
        </button>

        <button
          onClick={() => setIsApkModalOpen(true)}
          className="flex flex-col items-center gap-1 text-gray-900 py-1 font-semibold"
        >
          <Download className="w-4 h-4 text-gray-900" />
          <span className="text-[10px]">Get APK</span>
        </button>
      </nav>

      {/* Image Generator Modal */}
      {imageGenNote && (
        <ImageGeneratorModal
          note={imageGenNote}
          isOpen={Boolean(imageGenNote)}
          onClose={() => setImageGenNote(null)}
          onAttachImage={handleAttachImage}
        />
      )}

      {/* Gemini Chatbot Drawer */}
      <GeminiChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSaveAsNote={handleCreateNoteFromChat}
        activeNote={notes[0] || null}
      />

      {/* Download APK & WebAPK Modal */}
      <DownloadApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
}
