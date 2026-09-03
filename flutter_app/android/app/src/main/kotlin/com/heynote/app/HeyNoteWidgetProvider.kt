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
                // Read shared data from Flutter
                val title = widgetData.getString("widget_title", "HeyNote Mic • হে নোট")
                val recentNote = widgetData.getString("widget_recent_note", "Tap mic to record")

                setTextViewText(R.id.widget_title, title)
                setTextViewText(R.id.widget_recent_note, recentNote)

                // 1-Tap Mic Record Intent (Deep link to Flutter)
                val recordIntent = Intent(Intent.ACTION_VIEW, Uri.parse("heynote://record")).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                val pendingIntent = PendingIntent.getActivity(
                    context,
                    0,
                    recordIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                setOnClickPendingIntent(R.id.btn_quick_record, pendingIntent)
                setOnClickPendingIntent(R.id.widget_container, pendingIntent)
            }
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
