import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/home_screen.dart';
import 'services/widget_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style
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
    // Listen to Home Screen Widget clicks
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
          secondary: Colors.grey.shade800,
          background: const Color(0xFFF9FAFB),
        ),
        scaffoldBackgroundColor: const Color(0xFFF9FAFB),
        appBarTheme: const AppBarTheme(
          surfaceTintColor: Colors.transparent,
        ),
        fontFamily: 'Roboto',
      ),
      home: HomeScreen(initialRecordTrigger: _recordFromWidget),
    );
  }
}
