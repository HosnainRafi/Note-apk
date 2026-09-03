import { NoteItem } from '../types';

const STORAGE_KEY = 'heynote_notes_v1';
const SYNC_QUEUE_KEY = 'heynote_sync_queue_v1';

export const INITIAL_DEMO_NOTES: NoteItem[] = [];

export function loadNotes(): NoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: NoteItem[] = JSON.parse(raw);
    // Ensure leftover demo notes from earlier sessions are cleaned out if any
    const userOnlyNotes = parsed.filter((n) => !n.id.startsWith('demo-'));
    if (userOnlyNotes.length !== parsed.length) {
      saveNotes(userOnlyNotes);
    }
    return userOnlyNotes;
  } catch (e) {
    console.error('Failed to load notes from localStorage:', e);
    return [];
  }
}

export function saveNotes(notes: NoteItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage:', e);
  }
}

export function saveSingleNote(note: NoteItem): NoteItem[] {
  const existing = loadNotes();
  const index = existing.findIndex((n) => n.id === note.id);
  let updated: NoteItem[];
  if (index >= 0) {
    updated = [...existing];
    updated[index] = note;
  } else {
    updated = [note, ...existing];
  }
  saveNotes(updated);
  return updated;
}

export function deleteNote(id: string): NoteItem[] {
  const existing = loadNotes();
  const updated = existing.filter((n) => n.id !== id);
  saveNotes(updated);
  return updated;
}

// Google Keep export & integration
export function formatForGoogleKeep(note: NoteItem): string {
  let text = `${note.title}\n\n`;
  if (note.isList && note.checklist && note.checklist.length > 0) {
    text += note.checklist
      .map((item) => `${item.completed ? '☑' : '☐'} ${item.text}`)
      .join('\n');
  } else {
    text += note.content;
  }
  if (note.tags && note.tags.length > 0) {
    text += `\n\nTags: ${note.tags.map((t) => `#${t}`).join(' ')}`;
  }
  return text;
}

export function exportNotesAsJson(notes: NoteItem[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `heynote-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
