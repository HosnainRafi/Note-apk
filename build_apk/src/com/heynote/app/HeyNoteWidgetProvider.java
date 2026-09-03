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
