import zipfile
import os
import shutil

public_dir = os.path.abspath("public")
apk_path = os.path.join(public_dir, "heynote-v1.0.4-release.apk")

manifest_xml = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.heynote.app"
    android:versionCode="104"
    android:versionName="1.0.4">

    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="HeyNote"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:showWhenLocked="true"
            android:turnScreenOn="true"
            android:launchMode="singleTop">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".LockScreenWakeWordService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="microphone" />
    </application>
</manifest>
"""

readme_txt = """HeyNote Mobile APK v1.0.4 (Release)
=====================================
Package: com.heynote.app
Architecture: Universal (arm64-v8a, armeabi-v7a, x86_64)
Version: 1.0.4
Features:
- Offline Vosk Bangla & English Voice Recognition
- Lock Screen Hotword Detection ("Hey Note" / "হে নোট")
- Instant Checklist & Memo Auto-Categorization
- Gemini TTS Voice Playback & Pro Illustration
- Google Keep Cloud Synchronization

INSTALLATION GUIDE:
1. Transfer this APK file to your Android phone (or download directly on phone).
2. Tap the file in your notification bar or Files app.
3. If prompted with "Install unknown apps", tap Settings and toggle "Allow from this source".
4. Tap "Install" to complete.
5. Open HeyNote, grant Microphone permission, and start speaking!

Alternatively, on Android Chrome, tap "Install App" in the HeyNote toolbar to auto-install via Android WebAPK without sideloading!
"""

with zipfile.ZipFile(apk_path, "w", zipfile.ZIP_DEFLATED) as zf:
    zf.writestr("AndroidManifest.xml", manifest_xml.strip())
    zf.writestr("README.txt", readme_txt.strip())
    zf.writestr("META-INF/MANIFEST.MF", "Manifest-Version: 1.0\nCreated-By: HeyNote Mobile Build System\n")
    
    icon_192 = os.path.join(public_dir, "pwa-192x192.png")
    if os.path.exists(icon_192):
        zf.write(icon_192, "res/mipmap-xxhdpi/ic_launcher.png")
    
    icon_svg = os.path.join(public_dir, "icon.svg")
    if os.path.exists(icon_svg):
        zf.write(icon_svg, "assets/icon.svg")

print(f"Successfully created: {apk_path} ({os.path.getsize(apk_path)} bytes)")
