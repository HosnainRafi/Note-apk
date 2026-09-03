import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  ListTodo,
  FileText,
  Clock,
  ArrowRight,
  Globe,
  Pin,
  Check,
  Save,
  Volume2,
} from 'lucide-react';
import { NoteItem, DetectedLanguage, NoteCategory } from '../types';
import { SpeechListener, parseNoteOffline } from '../utils/speech';

export type WidgetVariant = 'pill' | 'card' | 'dial';

interface HomeScreenWidgetProps {
  onSaveNote: (note: NoteItem) => void;
  isOnline: boolean;
  recentNotes?: NoteItem[];
  variant?: WidgetVariant;
  onOpenFullApp?: () => void;
  isPinnedToHeader?: boolean;
  onTogglePin?: () => void;
  className?: string;
  autoStartRecording?: boolean;
}

export default function HomeScreenWidget({
  onSaveNote,
  isOnline,
  recentNotes = [],
  variant = 'pill',
  onOpenFullApp,
  isPinnedToHeader,
  onTogglePin,
  className = '',
  autoStartRecording = false,
}: HomeScreenWidgetProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechListener, setSpeechListener] = useState<SpeechListener | null>(null);
  const [detectedLang, setDetectedLang] = useState<DetectedLanguage>('en');
  const [langMode, setLangMode] = useState<'auto' | 'bn-BD' | 'en-US'>('auto');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [savedSuccessNote, setSavedSuccessNote] = useState<NoteItem | null>(null);

  // Clock for the widget
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Speech Listener
  useEffect(() => {
    const listener = new SpeechListener();

    listener.onResult = (text, isFinal, lang) => {
      setTranscript(text);
      setDetectedLang(lang);
    };

    listener.onError = (err) => {
      console.warn('Widget mic error:', err);
      setIsListening(false);
    };

    listener.onEnd = () => {
      setIsListening(false);
    };

    setSpeechListener(listener);

    if (autoStartRecording) {
      setTimeout(() => {
        listener.start(langMode);
        setIsListening(true);
      }, 500);
    }

    return () => {
      listener.stop();
    };
  }, []);

  const toggleRecording = () => {
    if (!speechListener) return;

    if (isListening) {
      speechListener.stop();
      setIsListening(false);
      if (transcript.trim()) {
        handleSave(transcript);
      }
    } else {
      setTranscript('');
      setSavedSuccessNote(null);
      speechListener.start(langMode);
      setIsListening(true);
    }
  };

  const handleSave = (textToSave?: string) => {
    const text = (textToSave || transcript).trim();
    if (!text) return;

    if (isListening && speechListener) {
      speechListener.stop();
      setIsListening(false);
    }

    const parsed = parseNoteOffline(text);

    const newNote: NoteItem = {
      id: 'widget-note-' + Date.now(),
      title: parsed.title,
      content: text,
      category: parsed.category,
      language: parsed.language,
      isList: parsed.isList,
      checklist: parsed.items.map((item, idx) => ({
        id: `widget-item-${idx}`,
        text: item,
        completed: false,
      })),
      summary: parsed.summary,
      tags: ['widget', 'voice-capture', parsed.language === 'bn' ? 'বাংলা' : 'english'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: isOnline ? 'synced' : 'offline_saved',
    };

    onSaveNote(newNote);
    setSavedSuccessNote(newNote);
    setTranscript('');

    setTimeout(() => {
      setSavedSuccessNote(null);
    }, 4500);
  };

  // -------------------------------------------------------------
  // VARIANT 1: 4x1 Android Pill Widget (Ultra Compact & Fast)
  // -------------------------------------------------------------
  if (variant === 'pill') {
    return (
      <div
        id="heynote-pill-widget"
        className={`w-full bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-md p-3 sm:p-4 transition-all ${className}`}
      >
        <div className="flex items-center justify-between gap-2.5">
          {/* Left: Time & Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-xs">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-900">HeyNote</span>
                <span className="text-[10px] text-gray-400 font-medium">• {currentTime || '12:00'}</span>
              </div>
              <p className="text-[10px] text-gray-500 hidden sm:block">
                {currentDate || 'Today'} • Home Widget
              </p>
            </div>
          </div>

          {/* Center: Live Recording Indicator or Trigger Text */}
          <div className="flex-1 px-2 text-center truncate">
            {isListening ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Listening ({detectedLang === 'bn' ? 'বাংলা' : 'English'})...
              </span>
            ) : savedSuccessNote ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Saved: "{savedSuccessNote.title}"
              </span>
            ) : (
              <button
                type="button"
                onClick={toggleRecording}
                className="text-xs text-gray-400 hover:text-gray-600 truncate transition"
              >
                Tap mic or say <strong className="text-gray-700 font-medium">"Hey Note"</strong> / <strong className="text-gray-700 font-medium">"হে নোট"</strong>
              </button>
            )}
          </div>

          {/* Right: Language switch + Mic Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language toggle pill */}
            <button
              type="button"
              onClick={() =>
                setLangMode((prev) =>
                  prev === 'auto' ? 'bn-BD' : prev === 'bn-BD' ? 'en-US' : 'auto'
                )
              }
              title="Switch Voice Language mode"
              className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              {langMode === 'bn-BD' ? 'বাংলা' : langMode === 'en-US' ? 'EN' : 'BN/EN'}
            </button>

            {/* Mic Trigger Button with Concentric Audio Waves */}
            <div className="relative flex items-center justify-center">
              {isListening && (
                <span className="absolute w-11 h-11 rounded-full bg-rose-400/30 animate-ping" />
              )}
              <button
                type="button"
                id="widget-mic-pill-button"
                onClick={toggleRecording}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs ${
                  isListening
                    ? 'bg-rose-600 text-white scale-105 shadow-rose-600/30 ring-4 ring-rose-100'
                    : 'bg-gray-900 hover:bg-black text-white active:scale-95'
                }`}
                title={isListening ? 'Stop & Save Note' : '1-Tap Record Note'}
              >
                {isListening ? (
                  <div className="w-3.5 h-3.5 rounded-xs bg-white" />
                ) : (
                  <Mic className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            {/* Optional Pin toggle */}
            {onTogglePin && (
              <button
                type="button"
                onClick={onTogglePin}
                className={`p-1.5 rounded-lg text-xs transition hidden md:inline-flex ${
                  isPinnedToHeader
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title={isPinnedToHeader ? 'Unpin widget from header' : 'Pin widget to top'}
              >
                <Pin className={`w-3.5 h-3.5 ${isPinnedToHeader ? 'rotate-45 fill-gray-900' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Live speech preview dropdown when recording */}
        {isListening && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in">
            <p className="text-xs text-gray-800 font-medium italic flex-1 truncate">
              {transcript || 'Speak in Bangla or English... (e.g. "দুধ, ডিম ও পাউরুটি কিনবে" or "Buy groceries")'}
            </p>
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={!transcript.trim()}
                className="px-3 py-1 rounded-xl bg-gray-900 hover:bg-black disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition shadow-xs"
              >
                <Save className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARIANT 2: 4x2 Interactive Task Hub & Quick Voice Widget
  // -------------------------------------------------------------
  if (variant === 'card') {
    const displayNotes = recentNotes.slice(0, 2);

    return (
      <div
        id="heynote-card-widget"
        className={`w-full bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-md p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900">HeyNote Vault</span>
              <span className="text-[10px] text-gray-400 ml-1.5 font-medium">{currentTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-gray-500 font-medium">Bilingual Widget</span>
          </div>
        </div>

        {/* Live Active Voice Note or Recent Notes List */}
        {isListening ? (
          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/60 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs text-rose-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                Live Transcription
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-rose-700 uppercase">
                {detectedLang === 'bn' ? 'বাংলা' : 'English'}
              </span>
            </div>
            <p className="text-xs text-gray-900 min-h-[36px] font-medium leading-relaxed">
              {transcript || 'Listening to your voice note...'}
            </p>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={!transcript.trim()}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Save className="w-3 h-3" />
                <span>Save Note</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {displayNotes.length > 0 ? (
              displayNotes.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                >
                  <div className="flex items-center gap-2 truncate flex-1">
                    {n.isList ? (
                      <ListTodo className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    )}
                    <span className="text-gray-800 font-medium truncate">{n.title}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 ml-2 shrink-0">
                    {n.language === 'bn' ? 'বাংলা' : 'EN'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-gray-400">
                No active notes. Tap mic to speak your first note!
              </div>
            )}
          </div>
        )}

        {/* Quick Action Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 gap-2">
          <button
            type="button"
            onClick={toggleRecording}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-gray-900 hover:bg-black text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isListening ? 'Stop & Save' : 'Instant Mic'}</span>
          </button>

          {onOpenFullApp && (
            <button
              type="button"
              onClick={onOpenFullApp}
              className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium flex items-center gap-1 transition"
            >
              <span>Vault</span>
              <ArrowRight className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARIANT 3: 2x2 Radial Concentric Mic Dial (Pixel Style)
  // -------------------------------------------------------------
  return (
    <div
      id="heynote-dial-widget"
      className={`w-full max-w-[200px] aspect-square bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200/90 shadow-md p-4 flex flex-col items-center justify-between text-center transition-all ${className}`}
    >
      <div className="flex items-center justify-between w-full text-[10px] text-gray-500 font-medium">
        <span>{currentTime}</span>
        <span className="px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-700 font-semibold">
          {langMode === 'bn-BD' ? 'বাংলা' : langMode === 'en-US' ? 'EN' : 'AUTO'}
        </span>
      </div>

      {/* Concentric Voice Button */}
      <div className="relative flex items-center justify-center my-auto">
        <div
          className={`w-18 h-18 rounded-full border-2 flex items-center justify-center transition-all ${
            isListening
              ? 'border-rose-300 scale-110 animate-pulse'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <button
            type="button"
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
              isListening
                ? 'bg-rose-600 text-white shadow-rose-600/40 ring-4 ring-rose-100'
                : 'bg-gray-900 hover:bg-black text-white active:scale-95'
            }`}
            title="Tap to speak note"
          >
            {isListening ? (
              <div className="w-3.5 h-3.5 rounded-xs bg-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[11px] font-semibold text-gray-900 leading-tight">
          {isListening ? 'Listening...' : '"Hey Note"'}
        </p>
        <p className="text-[9px] text-gray-400 mt-0.5">
          {isListening ? 'Tap to save' : '1-Tap Voice Dial'}
        </p>
      </div>
    </div>
  );
}
