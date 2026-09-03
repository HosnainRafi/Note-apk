import { useState } from 'react';
import { X, Smartphone, Download, Copy, Check, Terminal, ShieldCheck } from 'lucide-react';
import {
  FLUTTER_PUBSPEC,
  ANDROID_MANIFEST,
  FLUTTER_MAIN_DART,
  downloadFlutterProject,
} from '../utils/flutterExport';

interface FlutterApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FlutterApkModal({ isOpen, onClose }: FlutterApkModalProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'main' | 'manifest' | 'pubspec'>('guide');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      id="flutter-apk-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in font-sans"
    >
      <div className="w-full max-w-3xl bg-[#080808] border border-[#222222] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#222222] bg-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm shrink-0">
              <Smartphone className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-white flex items-center gap-2 font-mono">
                <span>Flutter APK Builder</span>
                <span className="px-2 py-0.5 bg-white text-black text-[10px] font-mono font-bold">
                  v1.0.0
                </span>
              </h3>
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#888888]">
                Foreground Lock-Screen Service • Vosk Offline Bangla STT • Local Hive Vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[#333333] text-[#888888] hover:text-white hover:border-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-[#222222] bg-[#050505] text-xs font-mono">
          {[
            { id: 'guide', label: 'Build Guide', icon: Terminal },
            { id: 'main', label: 'lib/main.dart', icon: Smartphone },
            { id: 'manifest', label: 'AndroidManifest.xml', icon: ShieldCheck },
            { id: 'pubspec', label: 'pubspec.yaml', icon: Smartphone },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 uppercase font-mono text-[10px] tracking-wider transition flex items-center gap-1.5 border ${
                activeTab === tab.id
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-[#0A0A0A] border-[#222222] text-[#888888] hover:text-white hover:border-[#444444]'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 font-sans text-xs text-[#CCCCCC]">
          {activeTab === 'guide' && (
            <div className="space-y-4 font-mono">
              <div className="p-4 border border-[#333333] bg-[#0A0A0A] text-[#E0E0E0]">
                <h4 className="font-bold text-xs uppercase tracking-wider mb-2 text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rotate-45" />
                  Android Lock Screen Voice Architecture
                </h4>
                <p className="leading-relaxed text-xs text-[#AAAAAA] font-sans">
                  The generated Flutter application leverages an Android foreground service configured with{' '}
                  <code className="px-1.5 py-0.5 bg-[#151515] border border-[#333333] text-white font-mono text-[11px]">
                    android:showWhenLocked="true"
                  </code>{' '}
                  and{' '}
                  <code className="px-1.5 py-0.5 bg-[#151515] border border-[#333333] text-white font-mono text-[11px]">
                    android:turnScreenOn="true"
                  </code>
                  . Coupled with a low-power offline Bangla/English voice model (Vosk lightweight), you simply say <strong className="text-white">"Hey Note"</strong> or <strong className="text-white">"হে নোট"</strong> to capture audio even while the phone is locked.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-2">
                  Terminal Commands to Compile Release APK:
                </h4>
                <div className="relative p-4 bg-[#050505] border border-[#222222] font-mono text-[11px] text-[#CCCCCC] space-y-2">
                  <button
                    onClick={() =>
                      handleCopy(
                        'commands',
                        'flutter create heynote\ncd heynote\nflutter pub get\nflutter build apk --release'
                      )
                    }
                    className="absolute top-3 right-3 px-2 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] text-white text-[10px] uppercase font-mono tracking-wider"
                    title="Copy commands"
                  >
                    {copied === 'commands' ? (
                      <span className="text-emerald-400">COPIED</span>
                    ) : (
                      <span>COPY</span>
                    )}
                  </button>
                  <p className="text-[#555555]"># 1. Initialize Flutter Project</p>
                  <p className="text-white">flutter create heynote</p>
                  <p className="text-white">cd heynote</p>
                  <p className="text-[#555555]"># 2. Add dependencies & Lockscreen Permissions</p>
                  <p className="text-[#888888]">(Copy the provided pubspec.yaml and AndroidManifest.xml)</p>
                  <p className="text-white">flutter pub get</p>
                  <p className="text-[#555555]"># 3. Build Release APK</p>
                  <p className="text-white">flutter build apk --release</p>
                  <p className="text-[#555555]">
                    # Target: build/app/outputs/flutter-apk/app-release.apk
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-4 bg-[#0A0A0A] border border-[#222222] space-y-1">
                  <span className="font-bold uppercase tracking-wider text-white text-xs">Offline Recognition</span>
                  <p className="text-[#888888] text-xs font-sans">
                    Powered by Vosk Bangla & English lightweight acoustic models. Zero cloud latency and total privacy.
                  </p>
                </div>
                <div className="p-4 bg-[#0A0A0A] border border-[#222222] space-y-1">
                  <span className="font-bold uppercase tracking-wider text-white text-xs">Cloud Synchronization</span>
                  <p className="text-[#888888] text-xs font-sans">
                    Includes Google OAuth2 integration to push synchronized notes directly to keep.google.com.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'main' && (
            <div className="relative font-mono">
              <button
                onClick={() => handleCopy('main_dart', FLUTTER_MAIN_DART)}
                className="absolute top-3 right-3 px-2 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] text-white text-[10px] uppercase tracking-wider z-10 flex items-center gap-1"
              >
                {copied === 'main_dart' ? (
                  <span className="text-emerald-400">COPIED</span>
                ) : (
                  <span>COPY CODE</span>
                )}
              </button>
              <pre className="p-4 bg-[#050505] border border-[#222222] font-mono text-[11px] overflow-x-auto text-[#CCCCCC] max-h-[50vh]">
                {FLUTTER_MAIN_DART}
              </pre>
            </div>
          )}

          {activeTab === 'manifest' && (
            <div className="relative font-mono">
              <button
                onClick={() => handleCopy('manifest_xml', ANDROID_MANIFEST)}
                className="absolute top-3 right-3 px-2 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] text-white text-[10px] uppercase tracking-wider z-10 flex items-center gap-1"
              >
                {copied === 'manifest_xml' ? (
                  <span className="text-emerald-400">COPIED</span>
                ) : (
                  <span>COPY CODE</span>
                )}
              </button>
              <pre className="p-4 bg-[#050505] border border-[#222222] font-mono text-[11px] overflow-x-auto text-[#CCCCCC] max-h-[50vh]">
                {ANDROID_MANIFEST}
              </pre>
            </div>
          )}

          {activeTab === 'pubspec' && (
            <div className="relative font-mono">
              <button
                onClick={() => handleCopy('pubspec_yaml', FLUTTER_PUBSPEC)}
                className="absolute top-3 right-3 px-2 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] text-white text-[10px] uppercase tracking-wider z-10 flex items-center gap-1"
              >
                {copied === 'pubspec_yaml' ? (
                  <span className="text-emerald-400">COPIED</span>
                ) : (
                  <span>COPY CODE</span>
                )}
              </button>
              <pre className="p-4 bg-[#050505] border border-[#222222] font-mono text-[11px] overflow-x-auto text-[#CCCCCC] max-h-[50vh]">
                {FLUTTER_PUBSPEC}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#222222] bg-[#0A0A0A]">
          <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
            Format: Android Studio & Flutter SDK
          </span>
          <button
            onClick={downloadFlutterProject}
            className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All Project Files (.txt)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
