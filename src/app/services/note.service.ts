import { Injectable, computed, inject, isDevMode, signal } from '@angular/core';
import type { Note } from '../models/note.model';
import { DevNotesService } from './dev-notes.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private readonly NOTES_STORAGE_KEY = 'notes';
  private localStorageService = inject(LocalStorageService);
  private devNotesService = inject(DevNotesService);

  private readonly notesStore = signal<Note[]>([]);
  readonly notes = computed(() => this.notesStore());

  // Computed signals for filtered notes
  readonly pinnedNotes = computed(() =>
    this.notes().filter((note) => note.isPinned)
  );

  readonly unpinnedNotes = computed(() =>
    this.notes().filter((note) => !note.isPinned)
  );

  constructor() {
    this.loadNotesFromStorage();
  }

  /**
   * Load notes from local storage
   */
  private loadNotesFromStorage(): void {
    const savedNotes = this.localStorageService.getData<Note[]>(
      this.NOTES_STORAGE_KEY
    );
    if (savedNotes && savedNotes?.length > 0) {
      // Convert date strings to Date objects
      const processedNotes = savedNotes.map((note) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        modifiedAt: note.modifiedAt ? new Date(note.modifiedAt) : undefined,
      }));
      this.notesStore.set(processedNotes);
    } else if (isDevMode()) {
      // In development mode, if no notes exist, generate sample notes
      console.log('Development mode: Loading sample notes');
      const sampleNotes = this.devNotesService.generateSampleNotes();
      this.notesStore.set(sampleNotes);
      // Don't save sample notes to storage to avoid persisting them
    }
  }

  /**
   * Save notes to local storage
   */
  private saveNotesToStorage(): void {
    this.localStorageService.saveData(this.NOTES_STORAGE_KEY, this.notes());
  }

  /**
   * Add a new note
   * @param note The note to add
   */
  addNote(note: Note): void {
    this.notesStore.update((notes) => [note, ...notes]);
    this.saveNotesToStorage();
  }

  /**
   * Update an existing note
   * @param updatedNote The updated note
   */
  updateNote(updatedNote: Note): void {
    updatedNote.modifiedAt = new Date();

    this.notesStore.update((notes) => {
      // Check if the pin status has changed
      const existingNote = notes.find((note) => note.id === updatedNote.id);
      const pinStatusChanged =
        existingNote && existingNote.isPinned !== updatedNote.isPinned;

      let updatedNotes: Note[];

      if (pinStatusChanged && updatedNote.isPinned) {
        // If the note was just pinned, move it to the beginning of the array
        updatedNotes = notes.filter((note) => note.id !== updatedNote.id);
        updatedNotes.unshift(updatedNote);
      } else {
        // Otherwise, just update the note in place
        updatedNotes = notes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note
        );
      }

      return updatedNotes;
    });

    this.saveNotesToStorage();
  }

  /**
   * Delete a note by ID
   * @param noteId The ID of the note to delete
   */
  deleteNote(noteId: string): void {
    this.notesStore.update((notes) => notes.filter((note) => note.id !== noteId));
    this.saveNotesToStorage();

    // If all notes are deleted and we're in dev mode, reload sample notes
    if (this.notes().length === 0 && isDevMode()) {
      setTimeout(() => {
        const sampleNotes = this.devNotesService.generateSampleNotes();
        this.notesStore.set(sampleNotes);
        // Don't save sample notes to storage
      }, 500); // Small delay to show the empty state briefly
    }
  }

  /**
   * Toggle the pinned state of a note
   * @param noteId The ID of the note to toggle pin state
   */
  toggleNotePin(noteId: string): void {
    this.notesStore.update((notes) => {
      const noteIndex = notes.findIndex((note) => note.id === noteId);

      if (noteIndex === -1) return notes;

      // Create a copy of the current notes array
      const updatedNotes = [...notes];

      // Get the note and toggle its pin state
      const note = { ...updatedNotes[noteIndex] };
      note.isPinned = !note.isPinned;
      note.modifiedAt = new Date();

      // Remove the note from its current position
      updatedNotes.splice(noteIndex, 1);

      // If the note is now pinned, add it to the beginning of the array
      // Otherwise, add it to the beginning of the unpinned section
      if (note.isPinned) {
        updatedNotes.unshift(note);
      } else {
        // Find the index of the first unpinned note
        const firstUnpinnedIndex = updatedNotes.findIndex((n) => !n.isPinned);

        if (firstUnpinnedIndex === -1) {
          // If all notes are pinned, add to the end
          updatedNotes.push(note);
        } else {
          // Otherwise, add at the beginning of unpinned section
          updatedNotes.splice(firstUnpinnedIndex, 0, note);
        }
      }

      return updatedNotes;
    });

    this.saveNotesToStorage();
  }

  /**
   * Update the order of notes
   * @param reorderedNotes The reordered notes array
   */
  updateNotesOrder(reorderedNotes: Note[]): void {
    // Create a map of existing notes by ID for reference
    const currentNotesMap = new Map(
      this.notes().map((note) => [note.id, note])
    );

    // Create a new array with the updated order, preserving all properties
    const updatedNotes = reorderedNotes.map((note) => {
      const existingNote = currentNotesMap.get(note.id);
      if (existingNote) {
        // Preserve all properties from the existing note, but update isPinned
        return {
          ...existingNote,
          isPinned: note.isPinned,
        };
      }
      return note;
    });

    this.notesStore.set(updatedNotes);
    this.saveNotesToStorage();
  }

  /**
   * Get a note by ID
   * @param noteId The ID of the note to get
   * @returns The note if found, undefined otherwise
   */
  getNoteById(noteId: string): Note | undefined {
    return this.notes().find((note) => note.id === noteId);
  }

  /**
   * Clear all notes (for testing purposes)
   */
  clearAllNotes(): void {
    this.notesStore.set([]);
    this.saveNotesToStorage();
  }
}