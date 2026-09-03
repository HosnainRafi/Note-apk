import { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, Download, Check, AlertCircle } from 'lucide-react';
import { ImageResolution, NoteItem } from '../types';

interface ImageGeneratorModalProps {
  note: NoteItem;
  isOpen: boolean;
  onClose: () => void;
  onAttachImage: (noteId: string, imageUrl: string, resolution: ImageResolution, prompt: string) => void;
}

export default function ImageGeneratorModal({
  note,
  isOpen,
  onClose,
  onAttachImage,
}: ImageGeneratorModalProps) {
  const [prompt, setPrompt] = useState<string>(
    note.summary || note.title ? `Minimalist modern illustration representing: ${note.title}. ${note.content.slice(0, 100)}` : ''
  );
  const [imageSize, setImageSize] = useState<ImageResolution>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '16:9' | '3:4'>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageSize, // Mandated 1K, 2K, 4K affordance
          aspectRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Image generation failed');
      }

      setGeneratedImageUrl(data.imageUrl);
    } catch (err: any) {
      console.error('Image gen error:', err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttach = () => {
    if (generatedImageUrl) {
      onAttachImage(note.id, generatedImageUrl, imageSize, prompt);
      onClose();
    }
  };

  return (
    <div
      id="image-generator-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in font-sans"
    >
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 text-gray-800 flex items-center justify-center rounded-xl shrink-0">
              <Sparkles className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  AI Illustration Engine
                </h3>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-[10px] font-medium">
                  Gemini Pro
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Generate 1K / 2K / 4K resolution note artwork
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs text-gray-700">
          {/* Prompt input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">
              Visual Description Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe the image prompt for this note..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition resize-none"
            />
          </div>

          {/* Resolution Affordance (1K, 2K, 4K) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">
                Resolution Target
              </label>
              <span className="text-[11px] text-gray-400">
                Ultra-HD Fidelity
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as ImageResolution[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setImageSize(res)}
                  className={`py-2 px-3 text-xs rounded-xl border transition flex flex-col items-center gap-0.5 ${
                    imageSize === res
                      ? 'bg-gray-900 text-white border-gray-900 font-semibold shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-semibold">{res}</span>
                  <span className="text-[10px] opacity-75">
                    {res === '1K' ? '1024 px' : res === '2K' ? '2048 px' : '4096 px (HD)'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '1:1', label: '1:1' },
                { id: '4:3', label: '4:3' },
                { id: '16:9', label: '16:9' },
                { id: '3:4', label: '3:4' },
              ].map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setAspectRatio(ar.id as any)}
                  className={`py-2 px-2 text-xs rounded-xl border transition text-center font-medium ${
                    aspectRatio === ar.id
                      ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Image Preview Result */}
          {generatedImageUrl && (
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> Generated {imageSize} Illustration
              </label>
              <div className="relative rounded-xl border border-gray-200 bg-gray-50 max-h-64 flex items-center justify-center p-2 overflow-hidden">
                <img
                  src={generatedImageUrl}
                  alt={prompt}
                  className="w-full h-full object-contain max-h-60 rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {generatedImageUrl ? (
              <>
                <a
                  href={generatedImageUrl}
                  download={`heynote-${note.id}-${imageSize}.png`}
                  className="px-3.5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  type="button"
                  onClick={handleAttach}
                  className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-white" /> Attach to Note
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold disabled:opacity-40 transition flex items-center gap-1.5 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Artwork</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
