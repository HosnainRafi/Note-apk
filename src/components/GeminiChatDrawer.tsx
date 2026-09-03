import { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  PlusCircle,
  Check,
  Cpu,
  Brain,
  Zap,
} from 'lucide-react';
import { ChatMessage, ChatbotPersona, GeminiChatModel, NoteItem } from '../types';

interface GeminiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsNote: (title: string, content: string) => void;
  activeNote?: NoteItem | null;
}

export default function GeminiChatDrawer({
  isOpen,
  onClose,
  onSaveAsNote,
  activeNote,
}: GeminiChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your HeyNote AI assistant. I understand both Bangla (বাংলা) and English. How can I assist you with your thoughts, checklists, or brainstorms today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GeminiChatModel>('gemini-3.5-flash');
  const [selectedPersona, setSelectedPersona] = useState<ChatbotPersona>('note_organizer');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Send chat history to backend endpoint
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          role: selectedPersona,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const assistantMessage: ChatMessage = {
        id: 'reply-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'No response from model.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: `Error: ${error.message || 'Something went wrong.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateNoteFromReply = (id: string, content: string) => {
    const title = content.slice(0, 30).trim() + '...';
    onSaveAsNote(title, content);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleInjectActiveNote = () => {
    if (!activeNote) return;
    const injection = `Please review and help organize this note:\nTitle: ${activeNote.title}\nContent: ${activeNote.content}`;
    setInputText(injection);
  };

  return (
    <div
      id="gemini-chat-drawer"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 text-gray-900 flex items-center justify-center rounded-xl shrink-0">
            <Sparkles className="w-4 h-4 text-gray-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">
                HeyNote AI Assistant
              </h3>
              <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 font-medium rounded-full">
                Gemini
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Bilingual Assistant • বাংলা + English
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Model & Persona Selection Controls */}
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70 space-y-2.5">
        {/* Model Selector */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 text-xs font-medium flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-gray-400" />
            Model:
          </span>
          <div className="flex items-center bg-gray-200/80 p-0.5 rounded-lg">
            {[
              { id: 'gemini-3.1-flash-lite', label: 'Flash Lite', icon: Zap },
              { id: 'gemini-3.5-flash', label: '3.5 Flash', icon: Sparkles },
              { id: 'gemini-3.1-pro-preview', label: '3.1 Pro', icon: Brain },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id as GeminiChatModel)}
                title={m.label}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  selectedModel === m.id
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <m.icon className="w-3 h-3" />
                <span>{m.id === 'gemini-3.1-flash-lite' ? 'Lite' : m.id === 'gemini-3.5-flash' ? 'Flash' : 'Pro'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Role / System Instruction selector */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium">Persona:</span>
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value as ChatbotPersona)}
            className="bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-gray-900 shadow-xs"
          >
            <option value="note_organizer">Note Organizer (তালিকা ও নোট)</option>
            <option value="creative_brainstormer">Creative Brainstormer (আইডিয়া)</option>
            <option value="bilingual_translator">Bangla ⇄ English Translator (অনুবাদ)</option>
          </select>
        </div>

        {/* Active Note Context Pill */}
        {activeNote && (
          <div className="pt-1 flex items-center justify-between text-xs text-gray-600">
            <span className="truncate max-w-[230px]">
              Active: <strong className="text-gray-900 font-semibold">{activeNote.title}</strong>
            </span>
            <button
              onClick={handleInjectActiveNote}
              className="text-gray-900 hover:underline text-xs font-semibold shrink-0"
            >
              Analyze Note
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-50 border border-gray-200 text-gray-800 shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">{msg.content}</div>

              <div
                className={`mt-2 flex items-center justify-between text-[11px] border-t pt-2 ${
                  msg.role === 'user' ? 'text-gray-300 border-gray-800' : 'text-gray-400 border-gray-200'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && (
                      <span className="text-[10px] uppercase font-medium text-gray-400">
                        {msg.modelUsed.includes('pro')
                          ? 'Pro'
                          : msg.modelUsed.includes('lite')
                          ? 'Lite'
                          : 'Flash'}
                      </span>
                    )}
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-gray-900 transition"
                      title="Copy to clipboard"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCreateNoteFromReply(msg.id, msg.content)}
                      className="hover:text-gray-900 transition"
                      title="Save as new note"
                    >
                      {savedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <PlusCircle className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs leading-relaxed justify-start">
            <div className="bg-gray-50 border border-gray-200 text-gray-600 p-3.5 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" />
              <span className="text-xs">Processing query with {selectedModel}...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask AI in Bangla or English..."
            className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 bg-gray-900 hover:bg-black disabled:opacity-30 text-white rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-gray-400 text-center">
          Bengali (বাংলা) 🇧🇩 + English 🇺🇸 • Powered by Gemini
        </p>
      </div>
    </div>
  );
}
