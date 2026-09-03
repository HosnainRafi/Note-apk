package com.heynote.app

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import android.content.Intent
import android.os.Bundle

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.heynote.app/widget"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            if (call.method == "getInitialAction") {
                val action = intent?.action
                val data = intent?.dataString
                
                // Fallback for unpublished apps using standard Android intents
                if (action == "com.google.android.gms.actions.CREATE_NOTE" || action == Intent.ACTION_SEND) {
                    result.success("heynote://assistant/note")
                } else {
                    result.success(data ?: action)
                }
            } else {
                result.notImplemented()
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }
}
