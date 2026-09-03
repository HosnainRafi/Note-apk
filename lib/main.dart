import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/home_screen.dart';
import 'services/widget_service.dart';
import 'services/google_sync_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style
  try {
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
    );
  } catch (e) {
    debugPrint('Error setting system UI overlay style: $e');
  }

  // Initialize Android Home Screen Widget bridge safely
  try {
    await WidgetService.initialize();
  } catch (e) {
    debugPrint('WidgetService.initialize error: $e');
  }

  runApp(const HeyNoteApp());
}

class HeyNoteApp extends StatefulWidget {
  const HeyNoteApp({super.key});

  @override
  State<HeyNoteApp> createState() => _HeyNoteAppState();
}

class _HeyNoteAppState extends State<HeyNoteApp> {
  bool _recordFromWidget = false;

  @override
  void initState() {
    super.initState();
    _checkInitialIntent();
    _initGoogleSync();
    // Listen to Home Screen Widget clicks safely
    try {
      WidgetService.registerInteractivity((Uri? uri) {
        if (uri != null && uri.host == 'record') {
          if (mounted) {
            setState(() {
              _recordFromWidget = true;
            });
          }
        }
      });
    } catch (e) {
      debugPrint('Error registering interactivity in app: $e');
    }
  }

  Future<void> _checkInitialIntent() async {
    const channel = MethodChannel('com.heynote.app/widget');
    try {
      final String? initialAction = await channel.invokeMethod('getInitialAction');
      if (initialAction != null && initialAction.contains('assistant')) {
        if (mounted) {
          setState(() {
            _recordFromWidget = true;
          });
        }
      }
    } catch (e) {
      debugPrint('Error reading initial intent: $e');
    }
  }

  Future<void> _initGoogleSync() async {
    await GoogleSyncService.signInSilently();
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
          secondary: Colors.grey.shade800,
          surface: const Color(0xFFF9FAFB), // 'background' was deprecated; use 'surface'
        ),
        scaffoldBackgroundColor: const Color(0xFFF9FAFB),
        appBarTheme: const AppBarTheme(
          surfaceTintColor: Colors.transparent,
        ),
      ),
      home: HomeScreen(initialRecordTrigger: _recordFromWidget),
    );
  }
}
