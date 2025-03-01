import {
  type CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  type OnInit,
  computed,
  inject,
  output,
  signal
} from '@angular/core';
import type { Note } from '../../models/note.model';
import { NoteService } from '../../services/note.service';
import { NoteCardComponent } from '../note-card/note-card.component';
import { NoteModalComponent } from '../note-modal/note-modal.component';

@Component({
  selector: 'app-notes-grid',
  imports: [
    CommonModule,
    DragDropModule,
    NoteCardComponent,
    NoteModalComponent,
  ],
  templateUrl: './notes-grid.component.html',
  styleUrls: ['./notes-grid.component.css'],
})
export class NotesGridComponent implements OnInit {
  // Inputs and outputs
  notesChanged = output<Note[]>();
  noteDeleted = output<string>();
  noteUpdated = output<Note>();
  notePinToggled = output<string>();

  // Signals
  selectedNote = signal<Note | null>(null);

  // Services
  private noteService = inject(NoteService);

  // Computed values
  pinnedNotes = computed(() =>
    this.noteService.notes().filter((note) => note.isPinned)
  );
  unpinnedNotes = computed(() =>
    this.noteService.notes().filter((note) => !note.isPinned)
  );

  ngOnInit(): void {
    // Initialize any necessary state
  }

  @HostListener('window:resize')
  handleResize(): void {
    // No need to update column layout with the new grid layout approach
  }

  dropPinned(event: CdkDragDrop<Note[]>): void {
    // Get a copy of the current pinned notes
    const pinnedNotesCopy = [...this.pinnedNotes()];

    // Move the item within the pinned notes array
    moveItemInArray(pinnedNotesCopy, event.previousIndex, event.currentIndex);

    // Emit the updated notes
    this.emitUpdatedNotes(pinnedNotesCopy, this.unpinnedNotes());
  }

  dropUnpinned(event: CdkDragDrop<Note[]>): void {
    // Get a copy of the current unpinned notes
    const unpinnedNotesCopy = [...this.unpinnedNotes()];

    // Move the item within the unpinned notes array
    moveItemInArray(unpinnedNotesCopy, event.previousIndex, event.currentIndex);

    // Emit the updated notes
    this.emitUpdatedNotes(this.pinnedNotes(), unpinnedNotesCopy);
  }

  emitUpdatedNotes(pinnedNotes: Note[], unpinnedNotes: Note[]): void {
    // Combine pinned and unpinned notes
    const allNotes = [...pinnedNotes, ...unpinnedNotes];

    // Emit the updated notes
    this.notesChanged.emit(allNotes);
  }

  handleDeleteNote(noteId: string): void {
    this.noteDeleted.emit(noteId);
  }

  handleEditNote(note: Note): void {
    this.selectedNote.set(note);
  }

  handleTogglePin(noteId: string): void {
    this.notePinToggled.emit(noteId);
  }

  handleCheckboxToggled(data: { note: Note; itemId: string }): void {
    // Update the note without opening the edit modal
    this.noteUpdated.emit(data.note);
  }

  closeModal(): void {
    this.selectedNote.set(null);
  }

  saveEditedNote(updatedNote: Note): void {
    this.noteUpdated.emit(updatedNote);
    this.selectedNote.set(null);
  }

  // Handle pin toggle from the modal
  handlePinToggled(updatedNote: Note): void {
    // Update the note in the service
    this.noteUpdated.emit(updatedNote);
  }
}
