// Complete Flutter project blueprints for Android APK build with Home Screen Widget & Voice Capture

export const FLUTTER_PUBSPEC = `name: heynote
description: "HeyNote - Smart Bilingual Voice Notes & Quick Home Screen Widget (বাংলা ও ইংরেজি)"
publish_to: 'none'
version: 1.0.4+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  # Speech to text in Bangla & English
  speech_to_text: ^6.6.0
  flutter_tts: ^4.0.2
  # Offline local vault
  shared_preferences: ^2.2.2
  # Android Home Screen Widget bridge
  home_widget: ^0.6.0
  # Cloud sync & Gemini API
  http: ^1.2.1
  intl: ^0.19.0
  share_plus: ^9.0.0
  uuid: ^4.4.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`;

export const ANDROID_MANIFEST = `<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.heynote.app">

    <!-- Permissions for Voice Recognition, Background Hotword, and Network -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application
        android:label="HeyNote"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Widget 1-Tap Trigger Deep Link -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="heynote"
                    android:host="record" />
            </intent-filter>
        </activity>

        <!-- Home Screen Quick Voice Widget Receiver -->
        <receiver
            android:name=".HeyNoteWidgetProvider"
            android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/heynote_widget_info" />
        </receiver>

        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>`;

export const ANDROID_WIDGET_PROVIDER = `// android/app/src/main/kotlin/com/heynote/app/HeyNoteWidgetProvider.kt
package com.heynote.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import es.antonborri.home_widget.HomeWidgetPlugin

class HeyNoteWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            val widgetData = HomeWidgetPlugin.getData(context)
            val views = RemoteViews(context.packageName, R.layout.widget_heynote_mic).apply {
                val title = widgetData.getString("widget_title", "HeyNote Mic • হে নোট")
                val recentNote = widgetData.getString("widget_recent_note", "Tap mic to record")

                setTextViewText(R.id.widget_title, title)
                setTextViewText(R.id.widget_recent_note, recentNote)

                // 1-Tap Deep Link into Flutter
                val recordIntent = Intent(Intent.ACTION_VIEW, Uri.parse("heynote://record")).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                val pendingIntent = PendingIntent.getActivity(
                    context, 0, recordIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                setOnClickPendingIntent(R.id.btn_quick_record, pendingIntent)
                setOnClickPendingIntent(R.id.widget_container, pendingIntent)
            }
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}`;

export const ANDROID_WIDGET_XML = `<!-- android/app/src/main/res/layout/widget_heynote_mic.xml -->
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_container"
    android:layout_width="match_parent"
    android:layout_height="72dp"
    android:background="@drawable/widget_background_pill"
    android:paddingStart="16dp"
    android:paddingEnd="16dp"
    android:paddingTop="10dp"
    android:paddingBottom="10dp">

    <ImageView
        android:id="@+id/widget_icon"
        android:layout_width="36dp"
        android:layout_height="36dp"
        android:layout_centerVertical="true"
        android:src="@mipmap/ic_launcher" />

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_centerVertical="true"
        android:layout_toEndOf="@id/widget_icon"
        android:layout_toStartOf="@id/btn_quick_record"
        android:layout_marginStart="12dp"
        android:layout_marginEnd="12dp"
        android:orientation="vertical">

        <TextView
            android:id="@+id/widget_title"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="HeyNote Mic • হে নোট"
            android:textColor="#111827"
            android:textStyle="bold"
            android:textSize="13sp" />

        <TextView
            android:id="@+id/widget_recent_note"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="2dp"
            android:text="Tap mic to dictate voice note"
            android:textColor="#6B7280"
            android:textSize="11sp" />
    </LinearLayout>

    <ImageButton
        android:id="@+id/btn_quick_record"
        android:layout_width="48dp"
        android:layout_height="48dp"
        android:layout_alignParentEnd="true"
        android:layout_centerVertical="true"
        android:background="@drawable/btn_circle_black"
        android:src="@android:drawable/ic_btn_speak_now"
        android:tint="#FFFFFF" />
</RelativeLayout>`;

export const FLUTTER_MAIN_DART = `// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/home_screen.dart';
import 'services/widget_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize Android Home Screen Widget bridge
  await WidgetService.initialize();

  runApp(const HeyNoteApp());
}

class HeyNoteApp extends StatefulWidget {
  const HeyNoteApp({Key? key}) : super(key: key);

  @override
  State<HeyNoteApp> createState() => _HeyNoteAppState();
}

class _HeyNoteAppState extends State<HeyNoteApp> {
  bool _recordFromWidget = false;

  @override
  void initState() {
    super.initState();
    // Listen to Home Screen Widget clicks (heynote://record)
    WidgetService.registerInteractivity((Uri? uri) {
      if (uri != null && uri.host == 'record') {
        setState(() {
          _recordFromWidget = true;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HeyNote',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.black,
          primary: Colors.black,
        ),
        scaffoldBackgroundColor: const Color(0xFFF9FAFB),
        fontFamily: 'Roboto',
      ),
      home: HomeScreen(initialRecordTrigger: _recordFromWidget),
    );
  }
}
`;

export function downloadFlutterProject(): void {
  const content = `================================================
           HeyNote Flutter APK Project
================================================

HOW TO BUILD THE FLUTTER APK:

1. Clone or export this repository.
2. In the project directory (or inside /flutter_app), run:
   flutter pub get
3. Build the release APK:
   flutter build apk --release

The output APK will be ready at:
build/app/outputs/flutter-apk/app-release.apk

To build architecture-specific APKs (smaller file size):
   flutter build apk --split-per-abi

------------------------------------------------
FILE 1: pubspec.yaml
------------------------------------------------
${FLUTTER_PUBSPEC}

------------------------------------------------
FILE 2: android/app/src/main/AndroidManifest.xml
------------------------------------------------
${ANDROID_MANIFEST}

------------------------------------------------
FILE 3: android/app/src/main/kotlin/com/heynote/app/HeyNoteWidgetProvider.kt
------------------------------------------------
${ANDROID_WIDGET_PROVIDER}

------------------------------------------------
FILE 4: android/app/src/main/res/layout/widget_heynote_mic.xml
------------------------------------------------
${ANDROID_WIDGET_XML}

------------------------------------------------
FILE 5: lib/main.dart
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

