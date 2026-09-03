import { useState, useEffect } from 'react';
import {
  Mic,
  Lock,
  Unlock,
  Volume2,
  CheckCircle,
  ListTodo,
  FileText,
  Wifi,
  WifiOff,
  BatteryCharging,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { NoteItem } from '../types';
import { SpeechListener, parseNoteOffline, playPcmAudio, speakBrowserSpeech } from '../utils/speech';

interface LockScreenOverlayProps {
  onUnlock: () => void;
  onSaveNote: (note: NoteItem) => void;
  isOnline: boolean;
}

export default function LockScreenOverlay({
  onUnlock,
  onSaveNote,
  isOnline,
}: LockScreenOverlayProps) {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedLang, setDetectedLang] = useState<'bn' | 'en' | 'bilingual'>('en');
  const [speechListener, setSpeechListener] = useState<SpeechListener | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<NoteItem | null>(null);
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);
  const [hotwordActive, setHotwordActive] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(
        now.toLocaleDateString([], {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const listener = new SpeechListener();
    listener.onResult = (text, isFinal, lang) => {
      setTranscript(text);
      setDetectedLang(lang);
    };

    listener.onWakeWordDetected = () => {
      // Woke up by "Hey Note" or "হে নোট"
      if (!isListening) {
        setIsListening(true);
      }
    };

    listener.onError = (err) => {
      console.warn('Lockscreen speech error:', err);
      setIsListening(false);
    };

    listener.onEnd = () => {
      setIsListening(false);
    };

    setSpeechListener(listener);

    return () => {
      listener.stop();
    };
  }, []);

  const toggleRecording = () => {
    if (!speechListener) return;
    if (isListening) {
      speechListener.stop();
      setIsListening(false);
      handleProcessAndSave(transcript);
    } else {
      setTranscript('');
      setSavedFeedback(null);
      speechListener.start('auto');
      setIsListening(true);
    }
  };

  const handleProcessAndSave = async (text: string) => {
    if (!text.trim()) return;

    // Use fast offline parser first for instantaneous response
    const offlineParsed = parseNoteOffline(text);

    let newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title: offlineParsed.title,
      content: text,
      category: offlineParsed.category,
      language: offlineParsed.language,
      isList: offlineParsed.isList,
      checklist: offlineParsed.items.map((it, idx) => ({
        id: `item-${idx}`,
        text: it,
        completed: false,
      })),
      summary: offlineParsed.summary,
      tags: [offlineParsed.category, offlineParsed.language === 'bn' ? 'বাংলা' : 'english'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: isOnline ? 'synced' : 'offline_saved',
    };

    // If online, optionally refine with server-side Gemini 3.1 Flash Lite
    if (isOnline) {
      try {
        const res = await fetch('/api/gemini/analyze-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: text, fallbackLanguage: offlineParsed.language }),
        });
        if (res.ok) {
          const aiData = await res.json();
          newNote = {
            ...newNote,
            title: aiData.title || newNote.title,
            category: aiData.category || newNote.category,
            language: aiData.language || newNote.language,
            isList: Boolean(aiData.isList),
            checklist: Array.isArray(aiData.items) && aiData.items.length > 0
              ? aiData.items.map((it: string, idx: number) => ({
                  id: `ai-item-${idx}`,
                  text: it,
                  completed: false,
                }))
              : newNote.checklist,
            summary: aiData.summary || newNote.summary,
            tags: Array.isArray(aiData.tags) && aiData.tags.length > 0 ? aiData.tags : newNote.tags,
          };
        }
      } catch (e) {
        console.warn('AI refinement fallback to offline parse:', e);
      }
    }

    onSaveNote(newNote);
    setSavedFeedback(newNote);
    setTranscript('');

    // Optional quick voice feedback with Gemini TTS
    if (isOnline) {
      try {
        setIsSpeakingTts(true);
        const confirmText = newNote.language === 'bn'
          ? `নোট সংরক্ষিত হয়েছে: ${newNote.title}`
          : `Note saved: ${newNote.title}`;
        const ttsRes = await fetch('/api/gemini/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: confirmText, voiceName: 'Kore' }),
        });
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          if (ttsData.audioBase64) {
            await playPcmAudio(ttsData.audioBase64);
          }
        } else {
          await speakBrowserSpeech(confirmText, newNote.language === 'bn' ? 'bn' : 'en');
        }
      } catch (err) {
        console.warn('TTS preview feedback failed:', err);
      } finally {
        setIsSpeakingTts(false);
      }
    }
  };

  return (
    <div
      id="lock-screen-container"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-gray-50 text-gray-900 p-6 lg:p-10 select-none overflow-hidden font-sans"
    >
      {/* Top Status Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-gray-700" />
          <span className="font-semibold text-gray-800">HeyNote Mobile APK</span>
          <span className="text-[11px] text-gray-400 font-normal">• Lock Screen Service</span>
        </div>
        <div className="flex items-center gap-4">
          {isOnline ? (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <Wifi className="w-3.5 h-3.5" />
              <span>Online Sync</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Cache</span>
            </span>
          )}
          <span className="flex items-center gap-1 text-gray-600 font-medium">
            <BatteryCharging className="w-3.5 h-3.5 text-gray-800" /> 98%
          </span>
        </div>
      </div>

      {/* Center Clock & Lock Display */}
      <div className="flex flex-col items-center justify-center my-auto space-y-4">
        <div className="text-7xl sm:text-8xl md:text-9xl font-light tracking-tight text-gray-900 font-sans">
          {time || '12:00'}
        </div>
        <div className="text-sm md:text-base font-medium tracking-widest uppercase text-gray-500">
          {dateStr}
        </div>

        {/* Hotword status indicator */}
        <div className="mt-2 flex items-center gap-2.5 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-xs text-xs text-gray-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>
            Voice Trigger: Say <strong className="text-gray-900 font-semibold">"Hey Note"</strong> or <strong className="text-gray-900 font-semibold">"হে নোট"</strong>
          </span>
        </div>

        {/* Active Speech Recording Card */}
        {isListening && (
          <div className="w-full max-w-md mt-4 p-5 sm:p-6 rounded-2xl border border-gray-300 bg-white shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                Listening (Bangla & English)
              </span>
              <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {detectedLang === 'bn' ? 'বাংলা' : detectedLang === 'en' ? 'English' : 'Bilingual'}
              </span>
            </div>

            <p className="text-base text-gray-900 min-h-[50px] font-sans leading-relaxed">
              {transcript || 'Speak your note, shopping list, or reminder...'}
            </p>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
              <span>Auto-detecting list vs note</span>
              <button
                onClick={() => handleProcessAndSave(transcript)}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold text-xs hover:bg-black transition shadow-xs"
              >
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* Saved Note Card Notification */}
        {savedFeedback && !isListening && (
          <div className="w-full max-w-md mt-4 p-5 rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-lg animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Saved to Local Vault
              </span>
              <span className="text-[10px] font-medium uppercase rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                {savedFeedback.isList ? 'Checklist' : 'Note'}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 mt-2 text-base">
              {savedFeedback.title}
            </h4>
            {savedFeedback.isList && savedFeedback.checklist.length > 0 ? (
              <ul className="mt-2 space-y-1.5 text-xs text-gray-600">
                {savedFeedback.checklist.slice(0, 3).map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {savedFeedback.content}
              </p>
            )}
            {isSpeakingTts && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
                <Volume2 className="w-3.5 h-3.5 text-gray-900 animate-pulse" />
                <span>Reading aloud via Gemini TTS...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls: Concentric Voice Trigger & Unlock Button */}
      <div className="flex flex-col items-center space-y-4 pb-2">
        {/* Concentric Circle Mic Trigger */}
        <div className="w-24 h-24 rounded-full border border-gray-200 flex items-center justify-center relative bg-white shadow-xs">
          <div
            className={`w-18 h-18 rounded-full border border-gray-200 flex items-center justify-center transition-transform ${
              isListening ? 'scale-110 border-rose-300' : ''
            }`}
          >
            <button
              id="lock-screen-mic-button"
              onClick={toggleRecording}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                  : 'bg-gray-900 hover:bg-black active:scale-95 text-white shadow-md shadow-gray-900/15'
              }`}
              title="Tap to speak note (Bangla or English)"
            >
              {isListening ? (
                <div className="w-3.5 h-3.5 bg-white rounded-xs" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          {isListening
            ? 'Tap mic to save note immediately'
            : 'Tap mic or say "Hey Note" / "হে নোট" to record'}
        </p>

        {/* Unlock Button */}
        <button
          id="unlock-phone-button"
          onClick={onUnlock}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold text-gray-800 transition shadow-xs active:scale-98"
        >
          <Unlock className="w-3.5 h-3.5 text-gray-700" />
          <span>Unlock & View Notes</span>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
