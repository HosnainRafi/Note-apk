#!/bin/bash
set -e

echo "=== HeyNote Android APK Builder ==="

BUILD_DIR="build_apk"
ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"
OUTPUT_DIR="build/app/outputs/flutter-apk"
PUBLIC_DIR="public"

mkdir -p "$BUILD_DIR/src/com/heynote/app"
mkdir -p "$BUILD_DIR/res/layout"
mkdir -p "$BUILD_DIR/res/values"
mkdir -p "$BUILD_DIR/res/xml"
mkdir -p "$BUILD_DIR/res/drawable"
mkdir -p "$BUILD_DIR/res/mipmap-xxhdpi"
mkdir -p "$BUILD_DIR/bin"
mkdir -p "$BUILD_DIR/gen"
mkdir -p "$OUTPUT_DIR"

# Copy Icon
if [ -f "public/pwa-192x192.png" ]; then
    cp public/pwa-192x192.png "$BUILD_DIR/res/mipmap-xxhdpi/ic_launcher.png"
fi

# 1. Create strings.xml
cat << 'EOF' > "$BUILD_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">HeyNote</string>
    <string name="widget_name">HeyNote Quick Mic</string>
    <string name="widget_title">HeyNote Mic • হে নোট</string>
    <string name="widget_subtitle">Tap mic to record voice note</string>
</resources>
EOF

# 2. Create colors.xml & styles.xml
cat << 'EOF' > "$BUILD_DIR/res/values/colors.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="window_bg">#F9FAFB</color>
    <color name="widget_text_dark">#111827</color>
    <color name="widget_text_muted">#6B7280</color>
</resources>
EOF

cat << 'EOF' > "$BUILD_DIR/res/values/styles.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.DeviceDefault.NoActionBar">
        <item name="android:windowBackground">@color/window_bg</item>
    </style>
</resources>
EOF

# 3. Create drawables
cat << 'EOF' > "$BUILD_DIR/res/drawable/widget_bg.xml"
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <corners android:radius="20dp" />
    <solid android:color="#FFFFFF" />
    <stroke android:width="1dp" android:color="#E5E7EB" />
</shape>
EOF

cat << 'EOF' > "$BUILD_DIR/res/drawable/btn_circle_mic.xml"
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <solid android:color="#111827" />
    <size android:width="44dp" android:height="44dp" />
</shape>
EOF

# 4. Create widget layout
cat << 'EOF' > "$BUILD_DIR/res/layout/widget_heynote_mic.xml"
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_container"
    android:layout_width="match_parent"
    android:layout_height="72dp"
    android:background="@drawable/widget_bg"
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
        android:layout_toStartOf="@+id/btn_quick_record"
        android:layout_marginStart="12dp"
        android:layout_marginEnd="12dp"
        android:orientation="vertical">

        <TextView
            android:id="@+id/widget_title"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@string/widget_title"
            android:textColor="#111827"
            android:textStyle="bold"
            android:textSize="13sp" />

        <TextView
            android:id="@+id/widget_recent_note"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="2dp"
            android:text="@string/widget_subtitle"
            android:textColor="#6B7280"
            android:textSize="11sp" />
    </LinearLayout>

    <ImageButton
        android:id="@+id/btn_quick_record"
        android:layout_width="44dp"
        android:layout_height="44dp"
        android:layout_alignParentEnd="true"
        android:layout_centerVertical="true"
        android:background="@drawable/btn_circle_mic"
        android:src="@android:drawable/ic_btn_speak_now" />
</RelativeLayout>
EOF

# 5. Create activity_main layout
cat << 'EOF' > "$BUILD_DIR/res/layout/activity_main.xml"
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</LinearLayout>
EOF

# 6. Create heynote_widget_info.xml
cat << 'EOF' > "$BUILD_DIR/res/xml/heynote_widget_info.xml"
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="60dp"
    android:updatePeriodMillis="86400000"
    android:previewImage="@mipmap/ic_launcher"
    android:initialLayout="@layout/widget_heynote_mic"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen|keyguard">
</appwidget-provider>
EOF

# 7. Create AndroidManifest.xml
cat << 'EOF' > "$BUILD_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.heynote.app"
    android:versionCode="104"
    android:versionName="1.0.4">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|layoutDirection"
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
            android:exported="true"
            android:label="@string/widget_name">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/heynote_widget_info" />
        </receiver>
    </application>
</manifest>
EOF

# 8. Create Java Source: MainActivity.java
cat << 'EOF' > "$BUILD_DIR/src/com/heynote/app/MainActivity.java"
package com.heynote.app;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.WindowManager;

public class MainActivity extends Activity {
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Turn screen on and show over lock screen
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );

        setContentView(R.layout.activity_main);
        mWebView = (WebView) findViewById(R.id.webview);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Auto grant audio recording permission in WebView
        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }
        });

        mWebView.setWebViewClient(new WebViewClient());

        // Check runtime microphone permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{android.Manifest.permission.RECORD_AUDIO}, 101);
            }
        }

        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        boolean autoRecord = false;
        if (intent != null) {
            Uri data = intent.getData();
            if (data != null && "heynote".equals(data.getScheme()) && "record".equals(data.getHost())) {
                autoRecord = true;
            }
        }

        String targetUrl = "https://ais-pre-fzfuzdyrj4v5nooalyx2dh-892247535318.asia-southeast1.run.app";
        if (autoRecord) {
            targetUrl += "?action=record";
        }
        mWebView.loadUrl(targetUrl);
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
EOF

# 9. Create Java Source: HeyNoteWidgetProvider.java
cat << 'EOF' > "$BUILD_DIR/src/com/heynote/app/HeyNoteWidgetProvider.java"
package com.heynote.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

public class HeyNoteWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_heynote_mic);

            // Intent to trigger 1-tap voice record in MainActivity
            Intent recordIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("heynote://record"));
            recordIntent.setClass(context, MainActivity.class);
            recordIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

            // FLAG_IMMUTABLE is 0x04000000 on Android 23+
            int flags = PendingIntent.FLAG_UPDATE_CURRENT | 0x04000000;
            PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, recordIntent, flags);

            views.setOnClickPendingIntent(R.id.btn_quick_record, pendingIntent);
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}
EOF

echo "[1/6] Generating R.java with AAPT..."
aapt package -f -m \
    -J "$BUILD_DIR/gen" \
    -M "$BUILD_DIR/AndroidManifest.xml" \
    -S "$BUILD_DIR/res" \
    -I "$ANDROID_JAR"

echo "[2/6] Compiling Java classes with javac..."
javac -d "$BUILD_DIR/bin" \
    -classpath "$ANDROID_JAR:$BUILD_DIR/gen" \
    -source 1.8 -target 1.8 \
    "$BUILD_DIR/gen/com/heynote/app/R.java" \
    "$BUILD_DIR/src/com/heynote/app/MainActivity.java" \
    "$BUILD_DIR/src/com/heynote/app/HeyNoteWidgetProvider.java"

echo "[3/6] Converting Java bytecode to Dalvik DEX with dx..."
/usr/bin/dalvik-exchange --dex --output="$BUILD_DIR/bin/classes.dex" "$BUILD_DIR/bin"

echo "[4/6] Packaging APK resources and DEX with AAPT..."
aapt package -f \
    -M "$BUILD_DIR/AndroidManifest.xml" \
    -S "$BUILD_DIR/res" \
    -I "$ANDROID_JAR" \
    -F "$BUILD_DIR/bin/heynote-unaligned.apk"

# Add classes.dex into APK
cd "$BUILD_DIR/bin"
aapt add heynote-unaligned.apk classes.dex
cd ../..

echo "[5/6] Aligning APK with zipalign..."
zipalign -f -p 4 "$BUILD_DIR/bin/heynote-unaligned.apk" "$BUILD_DIR/bin/heynote-aligned.apk"

echo "[6/6] Signing APK with debug/release keystore..."
KEYSTORE="$BUILD_DIR/heynote.keystore"
if [ ! -f "$KEYSTORE" ]; then
    keytool -genkey -v -keystore "$KEYSTORE" \
        -alias heynote -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass heynote123 -keypass heynote123 \
        -dname "CN=HeyNote, OU=Mobile, O=HeyNoteApp, L=Dhaka, ST=Dhaka, C=BD"
fi

apksigner sign \
    --ks "$KEYSTORE" \
    --ks-key-alias heynote \
    --ks-pass pass:heynote123 \
    --key-pass pass:heynote123 \
    --out "$BUILD_DIR/bin/heynote-v1.0.4-release.apk" \
    "$BUILD_DIR/bin/heynote-aligned.apk"

# Verify APK signature
apksigner verify --verbose "$BUILD_DIR/bin/heynote-v1.0.4-release.apk"

echo "=== Copying generated APK to destination paths ==="
# 1. Main project root (so user immediately sees it in their file tree)
cp "$BUILD_DIR/bin/heynote-v1.0.4-release.apk" "heynote.apk"
cp "$BUILD_DIR/bin/heynote-v1.0.4-release.apk" "heynote-v1.0.4-release.apk"

# 2. Public directory (for web downloads)
cp "$BUILD_DIR/bin/heynote-v1.0.4-release.apk" "$PUBLIC_DIR/heynote.apk"
cp "$BUILD_DIR/bin/heynote-v1.0.4-release.apk" "$PUBLIC_DIR/heynote-v1.0.4-release.apk"

# 3. Flutter output directory (standard location)
cp "$BUILD_DIR/bin/heynote-v1.0.4-release.apk" "$OUTPUT_DIR/app-release.apk"

APK_SIZE=$(ls -lh "heynote.apk" | awk '{print $5}')
echo "SUCCESS! APK built and signed: heynote.apk ($APK_SIZE)"
