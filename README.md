# HeyNote: Smart Voice Notes (হে নোট) 🎙️📱

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-Flash_2.5-orange.svg)](https://ai.google.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple.svg)](https://web.dev/progressive-web-apps/)

> **HeyNote** is a modern, bilingual (Bangla & English) voice-first note and checklist application engineered for Android and web. It features hands-free hotword detection (`"Hey Note"` / `"হে নোট"`), an interactive lock screen launcher, home screen quick mic widgets, offline local-first storage, Google Keep export, Gemini 2.5 Flash intelligent summaries, AI image generation, and natural speech playback.

---

## ✨ Key Features

### 🎙️ 1. Bilingual Voice Capture (বাংলা ও ইংরেজি)
- **Continuous Voice Recognition**: Real-time voice-to-text in both Bengali (`bn-BD`) and English (`en-US`) with automatic language detection.
- **Hands-Free Hotword Detection**: Always listening for `"Hey Note"` or `"হে নোট"` to immediately trigger hands-free note recording.
- **Smart Formatting**: Automatic punctuation, cleanup, and natural paragraph layout.

### 📱 2. Android Home Screen Widgets & App Shortcuts
- **4x1 Quick Mic Pill Widget**: Instant 1-tap microphone launcher docked right on your Android home screen with real-time time & speech preview.
- **4x2 Task Hub Widget**: Live interactive card displaying pending checklist items with 1-tap capture.
- **2x2 Concentric Mic Dial**: Pixel-style speed dial for rapid voice memos.
- **Home Screen App Shortcuts**: Long-press the HeyNote app icon to access instant *"Record Voice Note (ভয়েস রেকর্ড)"* and *"New Checklist"* quick actions.
- **Ready Android Native XML & Kotlin**: Bundled `HeyNoteWidgetProvider.kt` and `widget_heynote_mic.xml` for custom native APK compilation.

### 🔒 3. Simulated Lock Screen Launcher
- **Instant AMOLED Lock Screen**: Access your voice notes immediately without unlocking your phone.
- **Microphone Hot-Trigger**: Tap or speak to start recording right from the ambient lock display.
- **Recent Voice Notes Preview**: View recent checklists and memos securely in low-light mode.

### ⚡ 4. Smart Checklist & Auto-Categorization
- **Automatic List Parsing**: Automatically identifies shopping items, to-do lists, and tasks separated by commas, conjunctions (`and`, `এবং`, `ও`), or newlines.
- **Interactive Checkboxes**: Mark items completed with a single tap, track progress bars, and filter active versus finished tasks.
- **Categorization**: Auto-sorts notes into *Personal*, *Work*, *Shopping*, *Checklist*, *Idea*, and *Memo*.

### 🧠 5. Server-Side Gemini 2.5 Intelligence
- **AI Note Insights**: Generate concise summaries, action items, tags, and titles using `gemini-2.5-flash`.
- **Text-to-Speech (TTS)**: Listen to any note read aloud with natural speech synthesis.
- **AI Visual Generation**: Generate custom illustrations or visual cover cards for your notes via Imagen 3.
- **Gemini Chat Assistant**: Context-aware AI assistant drawer to ask questions about your saved notes or draft new content.

### 💾 6. Offline-First & WebAPK / Native APK Distribution
- **IndexedDB / Local Storage**: Full offline functionality — all notes are saved locally and synced automatically when back online.
- **Direct APK Download**: Download `heynote-v1.0.4-release.apk` directly inside the app.
- **1-Tap WebAPK**: Install directly to your device via Chrome or Edge as an offline standalone mobile app.
- **Google Keep & Share**: Export and sync any note directly to Google Keep, WhatsApp, or clipboard.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend API**: Express server (`server.ts`) proxying Gemini 2.5 API requests securely with server-only credentials.
- **Speech Engine**: Web Speech Recognition API with automated fallback and offline NLP rules.
- **PWA / Android**: Service Worker manifest, Android App Shortcuts, AppWidget XML layouts, and APK packager script.
- **AI Engine**: `@google/genai` TypeScript SDK running server-side (`gemini-2.5-flash`, `imagen-3.0`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- npm or bun
- A Google Gemini API Key (obtain from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/heynote.git
   cd heynote
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=3000
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📲 Android Home Screen Widget Setup

HeyNote supports two modes for your smartphone's home screen:

### Option A: Android Chrome / WebAPK (Zero Code)
1. Open the app in Chrome on Android.
2. Tap the browser menu (`⋮`) -> **Install app** or **Add to Home screen**.
3. Once installed, **long-press the HeyNote app icon** on your home screen.
4. Drag the **Record Voice Note (ভয়েস রেকর্ড)** shortcut directly to your home screen.

### Option B: Native Android Studio / Flutter
The repository includes native widget templates ready to compile:
- `res/layout/widget_heynote_mic.xml`: High-contrast pill layout with microphone button.
- `HeyNoteWidgetProvider.kt`: Android AppWidgetProvider triggering `ACTION_RECORD_NOW`.

---

## 📂 Project Structure

```
├── public/                 # Static assets, PWA icons, manifest.json, pre-built APK
├── scripts/
│   └── package_apk.py      # Automated APK packager script
├── src/
│   ├── components/
│   │   ├── DownloadApkModal.tsx       # APK download & WebAPK installation drawer
│   │   ├── GeminiChatDrawer.tsx       # Context-aware AI chat assistant
│   │   ├── HomeScreenWidget.tsx       # Live 4x1 & 4x2 home screen widget components
│   │   ├── HomeScreenWidgetModal.tsx  # Smartphone simulator & interactive widget tester
│   │   ├── ImageGeneratorModal.tsx    # Imagen 3 AI card artwork generator
│   │   ├── LockScreenOverlay.tsx      # Hands-free AMOLED lock screen launcher
│   │   ├── NoteCard.tsx               # Rich note & checklist display
│   │   ├── NoteCreator.tsx            # Voice input and manual note composer
│   │   └── Toast.tsx                  # Notification snackbars
│   ├── hooks/
│   │   └── usePWAInstall.ts           # PWA install prompt hooks
│   ├── utils/
│   │   ├── gemini.ts                  # Server-side AI client calls
│   │   ├── speech.ts                  # Bilingual speech listener & NLP parser
│   │   └── storage.ts                 # Local storage and backup synchronizer
│   ├── types.ts                       # Shared TypeScript interfaces
│   ├── App.tsx                        # Main application orchestrator
│   └── main.tsx                       # React DOM entrypoint
├── server.ts               # Express backend API & Vite production middleware
├── vite.config.ts          # Vite & PWA build configuration
├── metadata.json           # App permissions and project metadata
└── package.json            # Scripts & project dependencies
```

---

## 🛡️ Security & Privacy

- **API Keys**: All Gemini API keys are strictly kept server-side in `server.ts` and are never leaked to the browser bundle.
- **Local-First Audio**: Voice recording audio is processed directly on your device using speech recognition APIs — no voice recordings are permanently stored on third-party servers.

---

## 🤝 Contributing

Contributions, feature requests, and bug reports are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
