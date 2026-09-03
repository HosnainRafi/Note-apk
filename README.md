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

## 📦 Pre-Built Android APK in GitHub

The production-ready release APK is tracked directly in this GitHub repository:

- **Primary APK**: `heynote.apk` (Root directory)
- **Versioned APK**: `heynote-v1.0.4-release.apk`
- **Web Download File**: `public/heynote.apk`

### 📲 How to Install Directly from GitHub:

#### Method 1: Download from GitHub on Your Phone (Easiest)
1. Open your repository on GitHub using your phone's browser (e.g. Chrome).
2. Tap on **`heynote.apk`** in the repository root.
3. Tap **View raw** or **Download**.
4. Once downloaded, tap the notification to install! (Allow "Install unknown apps" if prompted).

#### Method 2: Direct Raw Download Link
You can download the APK directly with this URL pattern on any phone browser:
```text
https://github.com/<YOUR-USERNAME>/<YOUR-REPO>/raw/main/heynote.apk
```

#### Method 3: GitHub Releases & Actions
- Every push or tag trigger can automatically build and attach `heynote.apk` under **Releases** via `.github/workflows/build-apk.yml`.
- Go to the **Actions** tab in GitHub to download the build artifact anytime.

---

The repository includes the **complete, self-contained Flutter project** ready to build immediately with Flutter 3.x / Dart 3.x!

### 1. Build Requirements
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (`>= 3.2.0`)
- Android Studio / Android SDK (Platform SDK 34)
- Java 17 or Java 11

### 2. Build Commands

Clone the repository and run:

```bash
# 1. Fetch Flutter dependencies
flutter pub get

# 2. Run on connected Android phone or emulator
flutter run

# 3. Build Universal Release APK
flutter build apk --release
```

The compiled release APK will be generated at:
```
build/app/outputs/flutter-apk/app-release.apk
```

#### Optimized Architecture APKs (Smaller file size)
To generate smaller, per-architecture APKs (`arm64-v8a`, `armeabi-v7a`, `x86_64`):
```bash
flutter build apk --split-per-abi
```

---

## 📲 Android Home Screen Widget (Included in Flutter)

The Flutter project includes full Android Home Screen Widget integration via `home_widget` and Kotlin:

- **Widget Provider**: `android/app/src/main/kotlin/com/heynote/app/HeyNoteWidgetProvider.kt`
- **Widget XML Layout**: `android/app/src/main/res/layout/widget_heynote_mic.xml`
- **Widget Provider Info**: `android/app/src/main/res/xml/heynote_widget_info.xml`
- **Deep Link**: Tapping the 1-Tap Mic button on the widget dispatches `heynote://record`, instantly launching the Flutter app into active voice recording mode!

### Adding the Widget on Android:
1. Long-press any empty space on your Android home screen.
2. Tap **Widgets** -> scroll to **HeyNote**.
3. Drag the **HeyNote Quick Mic** (4x1 pill widget) to your home screen.

---

## 💻 Web & API Development Server

## 📂 Project Structure

```
├── pubspec.yaml            # Flutter package manifest & dependencies
├── lib/                    # Flutter Dart Source Code
│   ├── main.dart           # App entrypoint, theme, and widget deep link handler
│   ├── models/
│   │   └── note_item.dart  # Note & Checklist data model with JSON serialization
│   ├── services/
│   │   ├── speech_service.dart   # Bilingual speech recognition (Bangla & English)
│   │   ├── storage_service.dart  # Offline storage & widget synchronizer
│   │   ├── gemini_service.dart   # Gemini 2.5 Flash summaries & checklists
│   │   └── widget_service.dart   # HomeWidget Android bridge
│   ├── screens/
│   │   ├── home_screen.dart        # Primary notes feed, filters & quick mic FAB
│   │   ├── note_editor_screen.dart # Full note editor, checklist builder & AI tools
│   │   └── lock_screen_screen.dart # AMOLED lock screen mode with voice hotword
│   └── widgets/
│       ├── note_card.dart            # Interactive note card with checklist toggles
│       └── voice_capture_dialog.dart # Real-time pulsing microphone dialog
├── android/                # Native Android Project Configuration
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml   # Permissions, widget receivers & deep links
│   │       ├── kotlin/com/heynote/app/
│   │       │   ├── MainActivity.kt
│   │       │   └── HeyNoteWidgetProvider.kt # Android AppWidgetProvider
│   │       └── res/
│   │           ├── layout/widget_heynote_mic.xml # Home Screen Widget layout
│   │           └── xml/heynote_widget_info.xml   # AppWidget metadata
│   ├── build.gradle
│   └── settings.gradle
├── flutter_app/            # Mirror copy for modular / sub-project workflows
├── public/                 # Static assets, PWA icons, manifest.json, pre-built APK
├── src/                    # Web Application & Interactive Preview (React/Vite)
├── server.ts               # Express backend API & Vite production middleware
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
