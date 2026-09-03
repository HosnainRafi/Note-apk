import { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  ListTodo,
  FileText,
  Send,
  Globe,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { DetectedLanguage, NoteCategory, NoteItem } from '../types';
import { SpeechListener, detectLanguage, parseNoteOffline } from '../utils/speech';

interface NoteCreatorProps {
  onSaveNote: (note: NoteItem) => void;
  isOnline: boolean;
}

export default function NoteCreator({ onSaveNote, isOnline }: NoteCreatorProps) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechListener, setSpeechListener] = useState<SpeechListener | null>(null);
  const [selectedLanguageMode, setSelectedLanguageMode] = useState<'auto' | 'bn-BD' | 'en-US'>('auto');
  const [detectedLang, setDetectedLang] = useState<DetectedLanguage>('en');
  const [detectedCategory, setDetectedCategory] = useState<NoteCategory>('note');
  const [isListDetected, setIsListDetected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const listener = new SpeechListener();
    listener.onResult = (transcript, isFinal, lang) => {
      setInputText((prev) => {
        // If start of new recording, update cleanly
        return transcript;
      });
      setDetectedLang(lang);
    };

    listener.onError = (err) => {
      console.warn('Speech recognition error:', err);
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

  // Update dynamic language and list categorization as text changes
  useEffect(() => {
    if (!inputText.trim()) {
      setIsListDetected(false);
      setDetectedCategory('note');
      return;
    }
    const parsed = parseNoteOffline(inputText);
    setDetectedLang(parsed.language);
    setIsListDetected(parsed.isList);
    setDetectedCategory(parsed.category);
  }, [inputText]);

  const toggleListening = () => {
    if (!speechListener) return;
    if (isListening) {
      speechListener.stop();
      setIsListening(false);
    } else {
      speechListener.start(selectedLanguageMode);
      setIsListening(true);
    }
  };

  const handleSave = async () => {
    if (!inputText.trim()) return;

    // Fast offline parsing
    const offlineParsed = parseNoteOffline(inputText);

    let noteToSave: NoteItem = {
      id: 'note-' + Date.now(),
      title: offlineParsed.title,
      content: inputText.trim(),
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

    // If online, optionally refine with Gemini 3.1 Flash Lite
    if (isOnline) {
      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/gemini/analyze-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawText: inputText.trim(),
            fallbackLanguage: offlineParsed.language,
          }),
        });

        if (res.ok) {
          const aiData = await res.json();
          noteToSave = {
            ...noteToSave,
            title: aiData.title || noteToSave.title,
            category: aiData.category || noteToSave.category,
            language: aiData.language || noteToSave.language,
            isList: Boolean(aiData.isList),
            checklist:
              Array.isArray(aiData.items) && aiData.items.length > 0
                ? aiData.items.map((it: string, idx: number) => ({
                    id: `ai-item-${idx}`,
                    text: it,
                    completed: false,
                  }))
                : noteToSave.checklist,
            summary: aiData.summary || noteToSave.summary,
            tags: Array.isArray(aiData.tags) && aiData.tags.length > 0 ? aiData.tags : noteToSave.tags,
          };
        }
      } catch (e) {
        console.warn('AI analysis failed, saved with offline parser:', e);
      } finally {
        setIsAnalyzing(false);
      }
    }

    onSaveNote(noteToSave);
    setInputText('');
    if (isListening && speechListener) {
      speechListener.stop();
      setIsListening(false);
    }
  };

  return (
    <div
      id="note-creator"
      className="w-full border border-gray-200/90 bg-white rounded-2xl p-5 sm:p-6 shadow-xs relative transition-all"
    >
      {/* Top Controls: Language Detection & Mode */}
      <div className="flex items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-gray-100 text-xs">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-[11px] font-medium text-gray-500">Voice Mode:</span>
          <select
            value={selectedLanguageMode}
            onChange={(e) => setSelectedLanguageMode(e.target.value as any)}
            className="bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-gray-900 transition font-medium"
          >
            <option value="auto">Auto (Bangla + English) 🌐</option>
            <option value="bn-BD">বাংলা (Bengali) 🇧🇩</option>
            <option value="en-US">English (US) 🇺🇸</option>
          </select>
        </div>

        {/* Real-time category badge */}
        <div className="flex items-center gap-2">
          {inputText && (
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-gray-900 text-white">
              {isListDetected ? (
                <>
                  <ListTodo className="w-3 h-3" /> List
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3" /> Memo
                </>
              )}
            </span>
          )}
          <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {detectedLang === 'bn' ? 'বাংলা' : detectedLang === 'en' ? 'English' : 'Bilingual'}
          </span>
        </div>
      </div>

      {/* Voice Centerpiece */}
      <div className="flex flex-col items-center justify-center my-3 py-1">
        <div className="w-24 h-24 rounded-full border border-gray-100 flex items-center justify-center relative">
          <div
            className={`w-18 h-18 rounded-full border border-gray-200 flex items-center justify-center transition-all ${
              isListening ? 'scale-110 border-rose-400' : ''
            }`}
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                  : 'bg-gray-900 hover:bg-black active:scale-95 text-white shadow-md shadow-gray-900/15'
              }`}
              title={isListening ? 'Click to stop recording' : 'Click to start voice recording'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
          {isListening && (
            <div className="absolute -top-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-semibold text-rose-700 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
              <span>RECORDING</span>
            </div>
          )}
        </div>

        <p className="text-xs font-medium text-gray-700 mt-3 text-center">
          {isListening
            ? 'Listening to your voice in Bangla or English...'
            : 'Tap the mic or say "Hey Note" / "হে নোট" to speak'}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5 text-center">
          “কাল সকালে বাজারে যাব আলু আর পেঁয়াজ কিনতে” • "Review design specs"
        </p>
      </div>

      {/* Input Text Area */}
      <div className="relative mt-2">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              handleSave();
            }
          }}
          placeholder={
            isListening
              ? 'কথা বলুন, আপনার বক্তব্য রূপান্তরিত হচ্ছে... (Speaking in Bangla or English...)'
              : 'Or type your thoughts, tasks, or list items here (বাংলা বা ইংরেজি)...'
          }
          rows={3}
          className={`w-full p-3.5 rounded-xl bg-gray-50 border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition resize-none font-sans leading-relaxed ${
            isListening
              ? 'border-gray-900 ring-1 ring-gray-900/20 bg-white'
              : 'border-gray-200 focus:border-gray-900'
          }`}
        />
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span>Offline Bangla & English STT Active</span>
        </div>

        {/* Right: Save & Clear */}
        <div className="flex items-center gap-2">
          {inputText.trim() && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!inputText.trim() || isAnalyzing}
            className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black disabled:opacity-30 text-white text-xs font-semibold flex items-center gap-2 transition shadow-xs"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Structuring...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Save Note
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
