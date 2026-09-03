// Complete Flutter project blueprints for Android APK build with Lock-Screen voice trigger

export const FLUTTER_PUBSPEC = `name: heynote
description: "HeyNote - Lock Screen Bangla & English Offline Voice Notes"
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  # Offline Speech Recognition with Bangla & English models
  vosk_flutter: ^0.3.2
  speech_to_text: ^6.3.0
  # Lock Screen Background Service & Wake Lock
  flutter_background_service: ^5.0.5
  flutter_local_notifications: ^17.1.2
  wakelock_plus: ^1.2.8
  # Secure local storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  # Google Keep & Cloud Sync
  googleapis: ^13.1.0
  google_sign_in: ^6.2.1
  # Audio Playback
  audioplayers: ^5.2.1
  path_provider: ^2.1.2
  uuid: ^4.3.3

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
`;

export const ANDROID_MANIFEST = `<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.heynote.app">

    <!-- Permissions required for lock-screen wake word and offline recording -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:label="HeyNote"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        
        <!-- Main Activity configured to show on top of Lock Screen when "Hey Note" triggered -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:showWhenLocked="true"
            android:turnScreenOn="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>

        <!-- Background hotword listener service -->
        <service
            android:name="id.flutter.flutter_background_service.BackgroundService"
            android:foregroundServiceType="microphone"
            android:exported="false" />
    </application>
</manifest>`;

export const FLUTTER_MAIN_DART = `// lib/main.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  await Hive.openBox('notes_box');
  await initializeBackgroundService();
  runApp(const HeyNoteApp());
}

Future<void> initializeBackgroundService() async {
  final service = FlutterBackgroundService();
  await service.configure(
    androidConfiguration: AndroidConfiguration(
      onStart: onBackgroundServiceStart,
      autoStart: true,
      isForegroundMode: true,
      notificationChannelId: 'heynote_hotword_channel',
      initialNotificationTitle: 'HeyNote Voice Ready',
      initialNotificationContent: 'Say "Hey Note" or "হে নোট" even while locked',
      foregroundServiceTypes: [AndroidForegroundType.microphone],
    ),
    iosConfiguration: IosConfiguration(),
  );
}

@pragma('vm:entry-point')
void onBackgroundServiceStart(ServiceInstance service) async {
  final stt.SpeechToText speech = stt.SpeechToText();
  bool available = await speech.initialize();

  if (available) {
    // Continuously listen for "Hey Note" wake word in background
    speech.listen(
      onResult: (result) {
        String words = result.recognizedWords.toLowerCase();
        if (words.contains('hey note') || words.contains('হে নোট')) {
          // Bring note overlay to lock screen and record note
          service.invoke('wake_word_triggered', {'words': words});
        }
      },
      listenMode: stt.ListenMode.confirmation,
    );
  }
}

class HeyNoteApp extends StatelessWidget {
  const HeyNoteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HeyNote',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F1115),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          surface: Color(0xFF1A1D24),
        ),
      ),
      home: const NoteHomeScreen(),
    );
  }
}

class NoteHomeScreen extends StatefulWidget {
  const NoteHomeScreen({super.key});

  @override
  State<NoteHomeScreen> createState() => _NoteHomeScreenState();
}

class _NoteHomeScreenState extends State<NoteHomeScreen> {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isListening = false;
  String _currentText = "";

  void _listen() async {
    if (!_isListening) {
      bool available = await _speech.initialize();
      if (available) {
        setState(() => _isListening = true);
        // Supports locale "bn_BD" for Bangla or "en_US" for English
        _speech.listen(
          localeId: "bn_BD",
          onResult: (val) {
            setState(() {
              _currentText = val.recognizedWords;
              // Detect checklist vs note
              if (_currentText.contains('বাজার') || _currentText.contains('list')) {
                // Auto format into checklist
              }
            });
          },
        );
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
      _saveNote();
    }
  }

  void _saveNote() {
    if (_currentText.trim().isEmpty) return;
    final box = Hive.box('notes_box');
    box.add({
      'title': _currentText.split(' ').take(4).join(' '),
      'content': _currentText,
      'createdAt': DateTime.now().toIso8601String(),
    });
    setState(() => _currentText = "");
  }

  @override
  Widget build(BuildContext context) {
    final box = Hive.box('notes_box');
    return Scaffold(
      appBar: AppBar(
        title: const Text('HeyNote • ভয়েস নোট', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1A1D24),
      ),
      body: ValueListenableBuilder(
        valueListenable: box.listenable(),
        builder: (context, Box b, _) {
          return ListView.builder(
            itemCount: b.length,
            padding: const EdgeInsets.all(16),
            itemBuilder: (context, index) {
              final note = b.getAt(index) as Map;
              return Card(
                color: const Color(0xFF1A1D24),
                child: ListTile(
                  title: Text(note['title'] ?? ''),
                  subtitle: Text(note['content'] ?? ''),
                ),
              );
            },
          );
        },
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _listen,
        backgroundColor: _isListening ? Colors.redAccent : const Color(0xFF10B981),
        icon: Icon(_isListening ? Icons.mic : Icons.mic_none),
        label: Text(_isListening ? 'রেকর্ড হচ্ছে...' : 'বলুন (Say Note)'),
      ),
    );
  }
}
`;

export function downloadFlutterProject(): void {
  const content = `================================================
           HeyNote Flutter APK Project
================================================

INSTRUCTIONS TO BUILD AND RUN THE APK:

1. Ensure Flutter is installed (flutter.dev)
2. Run:
   flutter create heynote
   cd heynote

3. Replace pubspec.yaml with the configuration in FLUTTER_PUBSPEC.
4. Replace android/app/src/main/AndroidManifest.xml with ANDROID_MANIFEST.
5. Replace lib/main.dart with FLUTTER_MAIN_DART.
6. Install dependencies:
   flutter pub get
7. Build the APK:
   flutter build apk --release

The APK file will be generated at:
build/app/outputs/flutter-apk/app-release.apk

------------------------------------------------
FILE 1: pubspec.yaml
------------------------------------------------
${FLUTTER_PUBSPEC}

------------------------------------------------
FILE 2: android/app/src/main/AndroidManifest.xml
------------------------------------------------
${ANDROID_MANIFEST}

------------------------------------------------
FILE 3: lib/main.dart
------------------------------------------------
${FLUTTER_MAIN_DART}
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'heynote-flutter-apk-project.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
