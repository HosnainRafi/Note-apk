import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/tasks/v1.dart' as tasks;
import 'package:extension_google_sign_in_as_googleapis_auth/extension_google_sign_in_as_googleapis_auth.dart';
import '../models/note_item.dart';

class GoogleSyncService {
  static final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: [
      tasks.TasksApi.tasksScope,
    ],
  );

  /// Authenticates the user and returns true if successful.
  static Future<bool> signIn() async {
    try {
      final account = await _googleSignIn.signIn();
      return account != null;
    } catch (e) {
      debugPrint('Google Sign-In error: $e');
      return false;
    }
  }

  /// Silently attempts to sign in if previously authenticated.
  static Future<bool> signInSilently() async {
    try {
      final account = await _googleSignIn.signInSilently();
      return account != null;
    } catch (e) {
      debugPrint('Silent Google Sign-In error: $e');
      return false;
    }
  }

  static Future<void> signOut() async {
    await _googleSignIn.signOut();
  }

  /// Syncs a note to Google Tasks
  static Future<void> syncNoteToGoogleTasks(NoteItem note) async {
    final account = _googleSignIn.currentUser ?? await _googleSignIn.signInSilently();
    if (account == null) {
      debugPrint('GoogleSyncService: Not signed in. Skipping sync.');
      return;
    }

    try {
      // Get the authenticated HTTP client
      final authClient = await _googleSignIn.authenticatedClient();
      if (authClient == null) return;

      final tasksApi = tasks.TasksApi(authClient);

      // Create a task list for HeyNote if needed, or use default '@default'
      final taskListId = '@default';

      // Build the task description from the note
      final buffer = StringBuffer();
      if (note.isList && note.checklist.isNotEmpty) {
        for (var item in note.checklist) {
          buffer.writeln('${item.isDone ? '☑' : '☐'} ${item.text}');
        }
      } else {
        buffer.writeln(note.content);
      }

      if (note.summary != null && note.summary!.isNotEmpty) {
        buffer.writeln('\nAI Summary: ${note.summary}');
      }

      final newTask = tasks.Task(
        title: 'HeyNote: ${note.title}',
        notes: buffer.toString().trim(),
      );

      await tasksApi.tasks.insert(newTask, taskListId);
      debugPrint('Successfully synced note "${note.title}" to Google Tasks.');
    } catch (e) {
      debugPrint('Error syncing note to Google Tasks: $e');
    }
  }
}
