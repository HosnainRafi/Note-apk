import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Mic,
  Copy,
  Check,
  Download,
  Layers,
  Sparkles,
  Settings,
  Phone,
  Camera,
  MessageSquare,
  Compass,
  Palette,
  Pin,
  ExternalLink,
} from 'lucide-react';
import HomeScreenWidget, { WidgetVariant } from './HomeScreenWidget';
import { NoteItem } from '../types';

interface HomeScreenWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (note: NoteItem) => void;
  isOnline: boolean;
  recentNotes: NoteItem[];
  isPinnedToHeader: boolean;
  onTogglePinHeader: () => void;
}

export default function HomeScreenWidgetModal({
  isOpen,
  onClose,
  onSaveNote,
  isOnline,
  recentNotes,
  isPinnedToHeader,
  onTogglePinHeader,
}: HomeScreenWidgetModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<WidgetVariant>('pill');
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide'>('simulator');
  const [wallpaper, setWallpaper] = useState<'light' | 'sunset' | 'dark' | 'gradient'>('light');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const getWallpaperClass = () => {
    switch (wallpaper) {
      case 'sunset':
        return 'bg-gradient-to-b from-rose-100 via-orange-50 to-amber-100 text-gray-900';
      case 'dark':
        return 'bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white';
      case 'gradient':
        return 'bg-gradient-to-b from-blue-100 via-indigo-50 to-purple-100 text-gray-900';
      case 'light':
      default:
        return 'bg-gradient-to-b from-gray-100 via-slate-50 to-gray-200 text-gray-900';
    }
  };

  const androidXmlWidget = `<!-- res/layout/widget_heynote_mic.xml -->
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_container"
    android:layout_width="match_parent"
    android:layout_height="72dp"
    android:background="@drawable/widget_background_pill"
    android:padding="12dp">

    <ImageView
        android:id="@+id/widget_icon"
        android:layout_width="32dp"
        android:layout_height="32dp"
        android:layout_alignParentStart="true"
        android:layout_centerVertical="true"
        android:src="@mipmap/ic_launcher" />

    <TextView
        android:id="@+id/widget_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_toEndOf="@id/widget_icon"
        android:layout_marginStart="10dp"
        android:layout_centerVertical="true"
        android:text="HeyNote Mic • হে নোট"
        android:textSize="13sp"
        android:fontFamily="sans-serif-medium"
        android:textColor="#111827" />

    <ImageButton
        android:id="@+id/btn_quick_record"
        android:layout_width="44dp"
        android:layout_height="44dp"
        android:layout_alignParentEnd="true"
        android:layout_centerVertical="true"
        android:background="@drawable/btn_circle_black"
        android:src="@drawable/ic_mic_white"
        android:contentDescription="Instant Voice Note" />
</RelativeLayout>`;

  const kotlinWidgetProvider = `// com/heynote/app/HeyNoteWidgetProvider.kt
package com.heynote.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class HeyNoteWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_heynote_mic)
            
            // Intent to launch voice recognition instantly
            val intent = Intent(context, MainActivity::class.java).apply {
                action = "com.heynote.app.ACTION_RECORD_NOW"
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            views.setOnClickPendingIntent(R.id.btn_quick_record, pendingIntent)
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)
            
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}`;

  return (
    <div
      id="home-screen-widget-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
    >
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  Home Screen Quick Voice Widget
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-gray-500">
                1-tap voice note capture right from your smartphone's home screen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pin to Header quick toggle */}
            <button
              onClick={onTogglePinHeader}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                isPinnedToHeader
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}
              title="Keep the quick mic widget docked on top of the app notes view"
            >
              <Pin className={`w-3.5 h-3.5 ${isPinnedToHeader ? 'rotate-45 fill-white' : ''}`} />
              <span>{isPinnedToHeader ? 'Pinned to Header' : 'Pin Widget to Top'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-100 flex items-center gap-4 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone Simulator & Live Test</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Add to Real Phone</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Android AppWidget Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* ------------------------------------------------------------- */}
          {/* TAB 1: PHONE SIMULATOR & LIVE TESTING                         */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'simulator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Controls & Customization */}
              <div className="lg:col-span-5 space-y-4">
                {/* Widget Variant Picker */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Choose Widget Size & Layout
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'pill',
                        name: '4x1 Quick Mic Pill (Recommended)',
                        desc: 'Compact Android 14/15 dock pill. Minimalist, instant 1-tap capture.',
                      },
                      {
                        id: 'card',
                        name: '4x2 Task Hub & Voice Widget',
                        desc: 'Shows recent tasks with live checklist items + instant recording button.',
                      },
                      {
                        id: 'dial',
                        name: '2x2 Concentric Mic Dial',
                        desc: 'Circular Pixel-style speed dial with "Hey Note" hotword ring.',
                      },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v.id as WidgetVariant)}
                        className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-0.5 ${
                          selectedVariant === v.id
                            ? 'bg-white border-gray-900 shadow-xs'
                            : 'bg-white/60 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">{v.name}</span>
                          {selectedVariant === v.id && (
                            <Check className="w-3.5 h-3.5 text-gray-900" />
                          )}
                        </div>
                        <span className="text-[11px] text-gray-500 leading-snug">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wallpaper Theme Picker */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-gray-500" />
                      <span>Phone Wallpaper</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'light', label: 'Minimal' },
                      { id: 'sunset', label: 'Warm' },
                      { id: 'gradient', label: 'Indigo' },
                      { id: 'dark', label: 'OLED' },
                    ].map((wp) => (
                      <button
                        key={wp.id}
                        type="button"
                        onClick={() => setWallpaper(wp.id as any)}
                        className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                          wallpaper === wp.id
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {wp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Test Instructions */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    Live Interactive Simulation:
                  </span>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Tap the microphone button on the simulated phone screen to test voice recording in Bangla or English. Notes you record here will be saved directly into your notes vault!
                  </p>
                </div>
              </div>

              {/* Right: Phone Frame Mockup */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="w-full max-w-[340px] aspect-[9/18.5] bg-gray-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-gray-800 flex flex-col justify-between select-none">
                  {/* Phone Screen Container */}
                  <div
                    className={`w-full h-full rounded-[34px] overflow-hidden flex flex-col justify-between p-4 relative transition-colors duration-300 ${getWallpaperClass()}`}
                  >
                    {/* Status Bar */}
                    <div className="flex items-center justify-between text-[11px] font-semibold tracking-tight px-2 pt-1">
                      <span>9:41</span>
                      {/* Camera Punch-hole */}
                      <div className="w-3.5 h-3.5 rounded-full bg-black mx-auto" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px]">5G</span>
                        <div className="w-4 h-2 border border-current rounded-xs p-0.2 flex items-center">
                          <div className="w-2.5 h-1 bg-current rounded-2xs" />
                        </div>
                      </div>
                    </div>

                    {/* Top Date & Weather on Phone */}
                    <div className="pt-2 px-2">
                      <div className="text-xl font-light tracking-tight">Wednesday</div>
                      <div className="text-xs opacity-75 font-medium">September 3 • 28°C Sunny</div>
                    </div>

                    {/* Center: THE HEYNOTE HOME SCREEN WIDGET */}
                    <div className="my-auto w-full flex justify-center py-2">
                      <HomeScreenWidget
                        variant={selectedVariant}
                        onSaveNote={onSaveNote}
                        isOnline={isOnline}
                        recentNotes={recentNotes}
                        className="shadow-xl"
                      />
                    </div>

                    {/* Bottom: Simulated App Grid & Dock */}
                    <div className="space-y-4 pb-2">
                      {/* Apps Row */}
                      <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-11 h-11 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-md">
                            <Mic className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-medium opacity-90">HeyNote</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md">
                            <Compass className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-medium opacity-90">Chrome</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                            <Camera className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-medium opacity-90">Camera</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className="w-11 h-11 rounded-2xl bg-gray-700 text-white flex items-center justify-center shadow-md">
                            <Settings className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-medium opacity-90">Settings</span>
                        </div>
                      </div>

                      {/* Dock Bar */}
                      <div className="p-2 rounded-3xl bg-white/30 backdrop-blur-md flex items-center justify-around">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-xs">
                          <Mic className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Android Home Bar */}
                      <div className="w-24 h-1 bg-current opacity-40 mx-auto rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: ADD TO REAL PHONE (SHORTCUTS & WEBWIDGET)              */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'guide' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Method 1: Android Home Screen App Shortcut (Fastest)
                    </h3>
                    <p className="text-xs text-gray-500">
                      Works on Chrome, Edge, and Android WebAPK without writing native code.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs text-gray-700 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p>
                      Open this HeyNote app in Chrome or your Android mobile browser.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p>
                      Tap Chrome menu (three dots <strong className="font-semibold">⋮</strong>) and tap <strong className="font-semibold">"Install app"</strong> or <strong className="font-semibold">"Add to Home screen"</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p>
                      On your Android Home Screen, <strong>long-press the HeyNote icon</strong>. A quick popup menu will appear with <strong className="text-gray-900 font-semibold">"Record Voice Note (ভয়েস রেকর্ড)"</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      4
                    </span>
                    <p>
                      Drag that <strong>"Record Mic"</strong> shortcut directly onto your home screen to turn it into an instant 1-tap voice note button!
                    </p>
                  </div>
                </div>
              </div>

              {/* Pin Header Action */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">
                    Always Keep Widget Active in App
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pin the 4x1 Quick Mic Pill widget right at the top of your notes workspace.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onTogglePinHeader}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs ${
                    isPinnedToHeader
                      ? 'bg-gray-900 text-white hover:bg-black'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <Pin className={`w-3.5 h-3.5 ${isPinnedToHeader ? 'rotate-45 fill-current' : ''}`} />
                  <span>{isPinnedToHeader ? 'Widget Pinned' : 'Pin to Workspace'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: NATIVE ANDROID APPWIDGET CODE                          */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'code' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Android Native AppWidget Source Code
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ready-to-use Kotlin and XML files for compiling native Android Home Screen widgets in Android Studio or Flutter.
                </p>
              </div>

              {/* Code block 1: Layout XML */}
              <div className="rounded-2xl border border-gray-200 bg-gray-950 text-gray-100 overflow-hidden text-xs font-mono">
                <div className="px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                  <span className="text-gray-300 font-medium">res/layout/widget_heynote_mic.xml</span>
                  <button
                    onClick={() => copyToClipboard(androidXmlWidget, 'xml')}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition"
                  >
                    {copiedCode === 'xml' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy XML</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed text-gray-300">
                  {androidXmlWidget}
                </pre>
              </div>

              {/* Code block 2: Kotlin Provider */}
              <div className="rounded-2xl border border-gray-200 bg-gray-950 text-gray-100 overflow-hidden text-xs font-mono">
                <div className="px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                  <span className="text-gray-300 font-medium">HeyNoteWidgetProvider.kt</span>
                  <button
                    onClick={() => copyToClipboard(kotlinWidgetProvider, 'kt')}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition"
                  >
                    {copiedCode === 'kt' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Kotlin</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed text-gray-300">
                  {kotlinWidgetProvider}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
