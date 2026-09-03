import { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Pin,
  Trash2,
  CheckSquare,
  Square,
  Copy,
  Check,
  ExternalLink,
  Tag,
  Clock,
  Wifi,
  WifiOff,
  Image as ImageIcon,
  Plus,
} from 'lucide-react';
import { NoteItem } from '../types';
import { playPcmAudio, speakBrowserSpeech } from '../utils/speech';
import { formatForGoogleKeep } from '../utils/storage';

interface NoteCardProps {
  key?: string;
  note: NoteItem;
  onUpdateNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  onOpenImageGen: (note: NoteItem) => void;
  onOpenKeepSync: (note: NoteItem) => void;
  isOnline: boolean;
}

export default function NoteCard({
  note,
  onUpdateNote,
  onDeleteNote,
  onOpenImageGen,
  isOnline,
}: NoteCardProps) {
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [ttsVoice, setTtsVoice] = useState<'Kore' | 'Puck' | 'Zephyr' | 'Fenrir'>('Kore');
  const [copied, setCopied] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  // Toggle checklist item status
  const handleToggleChecklist = (itemId: string) => {
    const updatedChecklist = note.checklist.map((it) =>
      it.id === itemId ? { ...it, completed: !it.completed } : it
    );
    onUpdateNote({
      ...note,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newItem = {
      id: `item-${Date.now()}`,
      text: newChecklistItem.trim(),
      completed: false,
    };
    onUpdateNote({
      ...note,
      checklist: [...note.checklist, newItem],
      updatedAt: new Date().toISOString(),
    });
    setNewChecklistItem('');
    setShowAddInput(false);
  };

  // Read note with Gemini TTS (gemini-3.1-flash-tts-preview)
  const handlePlayTts = async () => {
    if (isPlayingTts) return;
    setIsPlayingTts(true);

    const speechText = note.isList
      ? `${note.title}. ${note.checklist.map((i) => i.text).join(', ')}`
      : `${note.title}. ${note.content}`;

    try {
      if (isOnline) {
        const response = await fetch('/api/gemini/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: speechText,
            voiceName: ttsVoice,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audioBase64) {
            await playPcmAudio(data.audioBase64);
            setIsPlayingTts(false);
            return;
          }
        }
      }

      // Offline or fallback to browser speech synthesis
      await speakBrowserSpeech(speechText, note.language === 'bn' ? 'bn' : 'en');
    } catch (err) {
      console.warn('TTS playback error, trying browser synthesis:', err);
      await speakBrowserSpeech(speechText, note.language === 'bn' ? 'bn' : 'en');
    } finally {
      setIsPlayingTts(false);
    }
  };

  const handleCopyContent = () => {
    const formatted = formatForGoogleKeep(note);
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGoogleKeep = () => {
    const text = encodeURIComponent(formatForGoogleKeep(note));
    // Open keep.google.com with note text copied and instructions
    handleCopyContent();
    window.open('https://keep.google.com', '_blank');
  };

  const togglePin = () => {
    onUpdateNote({
      ...note,
      isPinned: !note.isPinned,
    });
  };

  return (
    <div
      id={`note-card-${note.id}`}
      className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
        note.isPinned
          ? 'bg-white border-gray-900 shadow-sm'
          : 'bg-white border-gray-200/80 hover:border-gray-300 shadow-xs'
      }`}
    >
      {/* Top Card Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {/* Category & Language Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                note.category === 'list'
                  ? 'bg-gray-900 text-white'
                  : note.category === 'reminder'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : note.category === 'idea'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {note.category === 'list'
                ? 'Checklist'
                : note.category === 'reminder'
                ? 'Alert'
                : note.category === 'idea'
                ? 'Idea'
                : 'Note'}
            </span>

            <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-500">
              {note.language === 'bn' ? 'বাংলা' : note.language === 'en' ? 'EN' : 'Bilingual'}
            </span>

            {/* Sync Badge */}
            <span
              className="text-[10px] px-1.5 py-0.5 flex items-center gap-1 text-gray-400"
              title={note.syncStatus === 'synced' ? 'Synced to Google Keep & Hive' : 'Saved to local cache'}
            >
              {note.syncStatus === 'synced' ? (
                <Wifi className="w-2.5 h-2.5 text-emerald-600" />
              ) : (
                <WifiOff className="w-2.5 h-2.5 text-amber-500" />
              )}
            </span>
          </div>

          {/* Pin & Delete */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
            <button
              onClick={togglePin}
              className={`p-1.5 rounded-lg hover:bg-gray-100 transition ${
                note.isPinned ? 'text-gray-900 font-bold' : 'text-gray-400 hover:text-gray-700'
              }`}
              title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteNote(note.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug mb-2 font-sans">
          {note.title}
        </h3>

        {/* AI Generated Image Thumbnail if available */}
        {note.imageUrl && (
          <div className="relative mb-3 overflow-hidden rounded-xl border border-gray-200 group/img shadow-xs">
            <img
              src={note.imageUrl}
              alt={note.title}
              className="w-full h-36 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-[10px] font-medium text-gray-800 rounded-md border border-gray-200">
              {note.imageResolution || '1K'} • Gemini Pro
            </div>
          </div>
        )}

        {/* Note Content: Checklist or Paragraph */}
        {note.isList && note.checklist ? (
          <div className="space-y-1.5 my-2.5">
            {note.checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item.id)}
                className="flex items-center gap-2 text-xs text-gray-700 hover:text-gray-900 cursor-pointer select-none py-0.5"
              >
                <div
                  className={`w-3.5 h-3.5 rounded shrink-0 border flex items-center justify-center transition-colors ${
                    item.completed
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'border-gray-300 bg-white hover:border-gray-500'
                  }`}
                >
                  {item.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className={item.completed ? 'line-through text-gray-400' : ''}>
                  {item.text}
                </span>
              </div>
            ))}

            {/* Quick Add item inline */}
            {showAddInput ? (
              <div className="flex items-center gap-1.5 pt-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  placeholder="New item..."
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-gray-900 flex-1"
                  autoFocus
                />
                <button
                  onClick={handleAddChecklistItem}
                  className="px-3 py-1.5 bg-gray-900 text-white rounded-lg font-medium text-xs hover:bg-black transition"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddInput(true)}
                className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-900 pt-1 transition"
              >
                <Plus className="w-3 h-3" /> Add item
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed my-2 whitespace-pre-wrap font-sans">
            {note.content}
          </p>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2.5 border-t border-gray-100">
            {note.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5 text-gray-500 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        {/* Gemini TTS Audio Player */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePlayTts}
            disabled={isPlayingTts}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 text-[11px] font-medium ${
              isPlayingTts
                ? 'bg-gray-900 text-white border-gray-900 animate-pulse'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
            title="Read note aloud with Gemini TTS"
          >
            <Volume2 className="w-3 h-3" />
            <span>{isPlayingTts ? 'Reading...' : 'Listen'}</span>
          </button>

          {/* Voice selector */}
          <select
            value={ttsVoice}
            onChange={(e) => setTtsVoice(e.target.value as any)}
            className="bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-gray-600 px-1.5 py-1 focus:outline-none font-medium"
            title="Gemini 3.1 Voice"
          >
            <option value="Kore">Kore</option>
            <option value="Puck">Puck</option>
            <option value="Zephyr">Zephyr</option>
            <option value="Fenrir">Fenrir</option>
          </select>
        </div>

        {/* Tools: Image Gen, Copy, Keep */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenImageGen(note)}
            className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition"
            title="Generate illustration using Gemini Pro"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopyContent}
            className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition"
            title="Copy formatted note"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={handleOpenGoogleKeep}
            className="px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition flex items-center gap-1 text-[11px] font-medium"
            title="Sync & Open in Google Keep"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Keep</span>
          </button>
        </div>
      </div>
    </div>
  );
}
