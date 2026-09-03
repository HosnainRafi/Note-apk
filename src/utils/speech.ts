import { DetectedLanguage, NoteCategory } from '../types';

// Detect whether text is predominantly Bangla, English, or Bilingual
export function detectLanguage(text: string): DetectedLanguage {
  if (!text) return 'en';
  // Bengali Unicode block is \u0980-\u09FF
  const bengaliChars = (text.match(/[\u0980-\u09FF]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;

  if (bengaliChars > 0 && englishChars > 0) {
    if (bengaliChars > englishChars * 1.5) return 'bn';
    if (englishChars > bengaliChars * 1.5) return 'en';
    return 'bilingual';
  }

  if (bengaliChars > 0) return 'bn';
  return 'en';
}

// Lightweight offline parser: detect if text is a checklist/list vs general note
export function parseNoteOffline(text: string): {
  isList: boolean;
  category: NoteCategory;
  title: string;
  items: string[];
  language: DetectedLanguage;
  summary: string;
} {
  const language = detectLanguage(text);
  const trimmed = text.trim();

  // Common list triggers in Bangla and English
  const listKeywords = [
    'list', 'to-do', 'todo', 'tasks', 'buy', 'shopping', 'groceries', 'items',
    'তালিকা', 'লিস্ট', 'কিনতে হবে', 'বাজার', 'বাজারের তালিকা', 'কাজ', 'দরকার'
  ];

  const lower = trimmed.toLowerCase();
  const hasListKeyword = listKeywords.some(kw => lower.includes(kw));

  // Check lines or commas
  const lines = trimmed.split(/[\n;]+/).map(s => s.trim()).filter(Boolean);
  const commaSeparated = trimmed.split(/[,]+/).map(s => s.trim()).filter(Boolean);

  let isList = false;
  let items: string[] = [];

  if (lines.length >= 2) {
    isList = true;
    items = lines.map(line => line.replace(/^[-*•\d+.)\s]+/, '').trim()).filter(Boolean);
  } else if (hasListKeyword && commaSeparated.length >= 2) {
    isList = true;
    items = commaSeparated.map(item => item.replace(/^(buy|get|and|need|কিনতে হবে|এবং)\s+/i, '').trim()).filter(Boolean);
  } else if (commaSeparated.length >= 3) {
    isList = true;
    items = commaSeparated;
  }

  let category: NoteCategory = 'note';
  if (isList) {
    category = 'list';
  } else if (/remember|remind|কালকে|মনে রাখবে|তারিখে/i.test(trimmed)) {
    category = 'reminder';
  } else if (/idea|what if|আইডিয়া|পরিকল্পনা|plan/i.test(trimmed)) {
    category = 'idea';
  }

  // Generate title
  let title = '';
  if (isList) {
    if (language === 'bn') {
      title = lower.includes('বাজার') ? 'বাজারের তালিকা' : 'কাজের তালিকা';
    } else {
      title = lower.includes('shop') || lower.includes('buy') ? 'Shopping List' : 'To-Do Checklist';
    }
  } else {
    // First 5-7 words
    const words = trimmed.split(/\s+/);
    title = words.slice(0, 6).join(' ');
    if (words.length > 6) title += '...';
  }

  return {
    isList,
    category,
    title: title || (language === 'bn' ? 'নতুন নোট' : 'Quick Note'),
    items,
    language,
    summary: trimmed.slice(0, 80) + (trimmed.length > 80 ? '...' : ''),
  };
}

// Web Speech Recognition wrapper supporting auto Bangla (bn-BD) and English (en-US)
export class SpeechListener {
  private recognition: any = null;
  private isListening = false;
  public onResult?: (transcript: string, isFinal: boolean, detectedLang: DetectedLanguage) => void;
  public onError?: (error: string) => void;
  public onEnd?: () => void;
  public onWakeWordDetected?: () => void;
  private currentLang: 'bn-BD' | 'en-US' | 'auto' = 'auto';

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece;
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        const lower = currentText.toLowerCase();

        // Check for wake word "Hey Note" or "হে নোট"
        if (
          lower.includes('hey note') ||
          lower.includes('hey notes') ||
          lower.includes('হে নোট') ||
          lower.includes('হ্যালো নোট')
        ) {
          if (this.onWakeWordDetected) {
            this.onWakeWordDetected();
          }
        }

        const lang = detectLanguage(currentText);
        if (this.onResult) {
          this.onResult(currentText, Boolean(finalTranscript), lang);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && this.onError) {
          this.onError(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEnd) this.onEnd();
      };
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public start(langMode: 'bn-BD' | 'en-US' | 'auto' = 'auto') {
    if (!this.recognition || this.isListening) return;
    this.currentLang = langMode;
    this.recognition.lang = langMode === 'auto' ? 'en-US' : langMode;
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e: any) {
      console.warn('SpeechRecognition start error:', e);
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

// PCM Audio Playback for Gemini TTS (24kHz PCM audio)
export async function playPcmAudio(base64Data: string, sampleRate = 24000): Promise<void> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate,
    });

    // Decode base64 to binary
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert 16-bit PCM little endian to Float32
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }

    const audioBuffer = audioContext.createBuffer(1, float32Array.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    return new Promise((resolve) => {
      source.onended = () => {
        audioContext.close();
        resolve();
      };
      source.start();
    });
  } catch (error) {
    console.error('Error playing PCM audio:', error);
    throw error;
  }
}

// Fallback Browser Speech Synthesis
export function speakBrowserSpeech(text: string, lang: 'bn' | 'en' = 'en'): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}
