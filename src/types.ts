export type NoteCategory = 'list' | 'note' | 'reminder' | 'idea';
export type DetectedLanguage = 'bn' | 'en' | 'bilingual';
export type SyncStatus = 'synced' | 'pending' | 'offline_saved';
export type ImageResolution = '1K' | '2K' | '4K';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  language: DetectedLanguage;
  isList: boolean;
  checklist: ChecklistItem[];
  summary?: string;
  tags: string[];
  audioUrl?: string;
  audioDuration?: number;
  imageUrl?: string;
  imageResolution?: ImageResolution;
  imagePrompt?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
  keepSynced?: boolean;
  isPinned?: boolean;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export type GeminiChatModel = 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
export type ChatbotPersona = 'note_organizer' | 'creative_brainstormer' | 'bilingual_translator';
