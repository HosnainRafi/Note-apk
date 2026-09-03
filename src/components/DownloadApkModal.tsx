import { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Check,
  Copy,
  Terminal,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  QrCode,
  Share2,
  Github,
  AlertCircle,
} from 'lucide-react';
import {
  FLUTTER_PUBSPEC,
  ANDROID_MANIFEST,
  FLUTTER_MAIN_DART,
  ANDROID_WIDGET_PROVIDER,
  ANDROID_WIDGET_XML,
  downloadFlutterProject,
} from '../utils/flutterExport';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadApkModal({ isOpen, onClose }: DownloadApkModalProps) {
  const [activeTab, setActiveTab] = useState<'apk' | 'github' | 'webapk' | 'source'>('apk');
  const [sourceCodeTab, setSourceCodeTab] = useState<'main' | 'manifest' | 'pubspec' | 'widget_kt' | 'widget_xml'>('main');
  const [copied, setCopied] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadApkFile = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = '/heynote-v1.0.4-release.apk';
    link.download = 'heynote-v1.0.4-release.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 1500);
  };

  return (
    <div
      id="download-apk-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in font-sans"
    >
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* White Minimalist Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center shrink-0 p-1.5 shadow-xs">
              <img src="/icon.svg" alt="HeyNote App Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">
                  HeyNote Mobile APK
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
                  v1.0.4 Release
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Install on your Android device or download APK package
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-100 bg-gray-50/70 px-4 pt-2 gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('apk')}
            className={`px-4 py-2.5 rounded-t-lg font-medium transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'apk'
                ? 'border-gray-900 text-gray-900 bg-white font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2.5 rounded-t-lg font-medium transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'github'
                ? 'border-gray-900 text-gray-900 bg-white font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Github className="w-3.5 h-3.5 text-gray-900" />
            <span>Install via GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('webapk')}
            className={`px-4 py-2.5 rounded-t-lg font-medium transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'webapk'
                ? 'border-gray-900 text-gray-900 bg-white font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>1-Tap Install (WebAPK)</span>
          </button>

          <button
            onClick={() => setActiveTab('source')}
            className={`px-4 py-2.5 rounded-t-lg font-medium transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'source'
                ? 'border-gray-900 text-gray-900 bg-white font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Flutter Source Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-gray-700">
          {/* TAB 1: DIRECT APK DOWNLOAD */}
          {activeTab === 'apk' && (
            <div className="space-y-5">
              {/* Primary APK Download Action Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-gray-50 to-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">
                      heynote-v1.0.4-release.apk
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-[10px] font-mono">
                      Universal ARM / x86
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Offline Bangla Vosk Model • Lock-Screen Hey Note Wake Word • Encrypted Local Vault
                  </p>
                </div>

                <button
                  onClick={handleDownloadApkFile}
                  disabled={isDownloading}
                  className="px-5 py-3 rounded-xl bg-gray-900 hover:bg-black active:scale-[0.98] text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm shrink-0"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download APK File</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step-by-Step Installation Guide for Android */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>How to Install on Your Android Device</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center">
                      1
                    </div>
                    <div className="font-medium text-xs text-gray-900">Download APK</div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Tap <strong>Download APK File</strong> above directly on your Android phone or transfer the file via USB/Bluetooth.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <div className="font-medium text-xs text-gray-900">Allow Install</div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Tap the downloaded file in your notification bar. If Android asks, tap <em>Settings</em> and enable <em>"Allow from this source"</em>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center">
                      3
                    </div>
                    <div className="font-medium text-xs text-gray-900">Launch & Speak</div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Tap <strong>Install</strong>. Open HeyNote, grant microphone permission, and start speaking in Bangla or English!
                    </p>
                  </div>
                </div>
              </div>

              {/* Android Permissions Overview */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                <div className="font-medium text-gray-900">Native Android Privileges Included:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Foreground lock-screen wake service</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vosk offline Bangla & English acoustic model</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-wake screen (showWhenLocked="true")</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google Keep bidirectional cloud sync</span>
                  </div>
                </div>
              </div>

              {/* GitHub Shortcut Card */}
              <div className="p-4 rounded-xl bg-gray-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Github className="w-5 h-5 text-gray-200 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Tracked in GitHub Repository: <span className="font-mono text-emerald-400">heynote.apk</span>
                    </div>
                    <div className="text-[11px] text-gray-300">
                      The compiled APK file is committed to the repository root for direct installation via GitHub.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('github')}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>View GitHub Instructions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB: INSTALL VIA GITHUB */}
          {activeTab === 'github' && (
            <div className="space-y-5">
              {/* Repository Status Header */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-gray-50 to-white border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Ready for GitHub: HosnainRafi/Note-apk
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px] font-mono">
                    heynote.apk (378 KB • Standalone Offline)
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The updated <strong>378 KB</strong> release APK embeds the entire application offline (no external server dependency, no "Page not found" error).
                </p>
              </div>

              {/* Clarification about /raw/ */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 space-y-1.5">
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Important Note About "/raw/"</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>"/raw/" is not a folder in your repo!</strong> It is GitHub's URL routing command that tells GitHub to serve the raw binary file directly to your browser instead of opening a web preview page.
                </p>
              </div>

              {/* Step-by-Step GitHub Installation Guide */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-gray-900" />
                  <span>How to Download from HosnainRafi/Note-apk on Your Phone</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center">
                      1
                    </div>
                    <div className="font-medium text-xs text-gray-900">Open Repository</div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Go to <span className="font-mono text-gray-800">github.com/HosnainRafi/Note-apk</span> in your mobile browser.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <div className="font-medium text-xs text-gray-900">Tap heynote.apk</div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Scroll to <strong>heynote.apk</strong> in the root file list, tap it, then tap <strong>"View raw"</strong> or <strong>"Download"</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center">
                      3
                    </div>
                    <div className="font-medium text-xs text-gray-900">Install APK</div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Tap the downloaded APK file. Allow "Install unknown apps" if prompted, then launch HeyNote!
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct 1-Click Link for HosnainRafi/Note-apk */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-800">Direct Download Link for Your Repository</span>
                  <button
                    onClick={() => handleCopy('github-url', 'https://github.com/HosnainRafi/Note-apk/raw/main/heynote.apk')}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                  >
                    {copied === 'github-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'github-url' ? 'Copied' : 'Copy Direct Link'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-gray-900 text-gray-200 rounded-lg text-xs font-mono select-all break-all">
                  https://github.com/HosnainRafi/Note-apk/raw/main/heynote.apk
                </div>
                <p className="text-[11px] text-gray-500">
                  Or via GitHub's raw CDN: <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800 text-[10px]">https://raw.githubusercontent.com/HosnainRafi/Note-apk/main/heynote.apk</code>
                </p>
              </div>

              {/* GitHub Actions Auto-Build Workflow */}
              <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gray-700" />
                  <span className="text-xs font-semibold text-gray-900">Automated GitHub Actions CI/CD Included</span>
                </div>
                <p className="text-xs text-gray-600">
                  We added <code className="font-mono text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">.github/workflows/build-apk.yml</code>. Whenever you push to <code className="font-mono text-gray-900 bg-gray-100 px-1 py-0.5 rounded">main</code> or create a release tag, GitHub Actions will automatically compile, sign, and publish the latest APK to GitHub Releases.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: 1-TAP WEBAPK INSTALLATION */}
          {activeTab === 'webapk' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">
                      Zero-Sideload Android WebAPK Engine
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Google Play Services auto-compiles and installs a native APK on your home screen
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  When you tap <strong>Install App</strong> in Chrome or Samsung Internet on Android, Android automatically builds an official <strong>WebAPK</strong> package. It appears in your phone's app drawer with its own app icon, splash screen, and full-screen window without browser address bars!
                </p>

                {isInstalled ? (
                  <div className="p-3 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-800 font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>HeyNote is already installed on this device in Standalone Mode!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={install}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tap to Install on Device (WebAPK)</span>
                  </button>
                ) : isIOS ? (
                  <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-xs space-y-1.5 text-gray-700">
                    <div className="font-semibold flex items-center gap-1.5 text-gray-900">
                      <Share2 className="w-4 h-4 text-blue-600" />
                      <span>Installing on iPhone / iPad (Safari)</span>
                    </div>
                    <p className="text-gray-500">
                      1. Tap the <strong>Share</strong> button at the bottom of Safari.<br />
                      2. Scroll down and tap <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white border border-gray-200 text-xs text-gray-600 space-y-1">
                    <div className="font-medium text-gray-900">How to install on Android Chrome:</div>
                    <p className="text-gray-500">
                      Open this URL on your phone's Chrome browser, tap the <strong>⋮ Menu</strong> in the top right, and choose <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile Preview Link / QR Code hint */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-xs flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900">Open on Your Phone</div>
                  <div className="text-gray-500 text-[11px]">
                    Share or open this URL on your mobile browser to install immediately.
                  </div>
                </div>
                <button
                  onClick={() => handleCopy('url', window.location.href)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium transition flex items-center gap-1.5 shrink-0"
                >
                  {copied === 'url' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied URL</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FLUTTER & ANDROID STUDIO SOURCE */}
          {activeTab === 'source' && (
            <div className="space-y-4">
              {/* Quick 1-Line Build Banner */}
              <div className="p-3.5 rounded-xl bg-gray-900 text-white flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                  <code className="text-[11px] font-mono text-emerald-300 truncate">
                    flutter pub get && flutter build apk --release
                  </code>
                </div>
                <button
                  onClick={() => handleCopy('build_cmd', 'flutter pub get && flutter build apk --release')}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition shrink-0 flex items-center gap-1"
                >
                  {copied === 'build_cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied === 'build_cmd' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { id: 'main', label: 'lib/main.dart' },
                    { id: 'manifest', label: 'AndroidManifest.xml' },
                    { id: 'pubspec', label: 'pubspec.yaml' },
                    { id: 'widget_kt', label: 'HeyNoteWidgetProvider.kt' },
                    { id: 'widget_xml', label: 'widget_heynote_mic.xml' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSourceCodeTab(sub.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                        sourceCodeTab === sub.id
                          ? 'bg-gray-900 text-white font-semibold'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const text =
                      sourceCodeTab === 'main'
                        ? FLUTTER_MAIN_DART
                        : sourceCodeTab === 'manifest'
                        ? ANDROID_MANIFEST
                        : sourceCodeTab === 'pubspec'
                        ? FLUTTER_PUBSPEC
                        : sourceCodeTab === 'widget_kt'
                        ? ANDROID_WIDGET_PROVIDER
                        : ANDROID_WIDGET_XML;
                    handleCopy('source_code', text);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium transition flex items-center gap-1.5"
                >
                  {copied === 'source_code' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-950">
                <pre className="p-4 font-mono text-[11px] overflow-x-auto text-gray-300 max-h-[44vh] leading-relaxed">
                  {sourceCodeTab === 'main' && FLUTTER_MAIN_DART}
                  {sourceCodeTab === 'manifest' && ANDROID_MANIFEST}
                  {sourceCodeTab === 'pubspec' && FLUTTER_PUBSPEC}
                  {sourceCodeTab === 'widget_kt' && ANDROID_WIDGET_PROVIDER}
                  {sourceCodeTab === 'widget_xml' && ANDROID_WIDGET_XML}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50 text-xs">
          <span className="text-gray-500 text-[11px]">
            Package: <code className="text-gray-700 font-mono">com.heynote.app</code>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadFlutterProject}
              className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium transition flex items-center gap-1.5"
              title="Download all Flutter project files in a single bundle"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Project Files (.txt)</span>
            </button>

            <button
              onClick={handleDownloadApkFile}
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APK</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
