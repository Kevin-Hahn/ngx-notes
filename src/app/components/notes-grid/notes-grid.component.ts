import {
  type CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
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
export class NotesGridComponent {
  notesChanged = output<Note[]>();
  noteDeleted = output<string>();
  noteUpdated = output<Note>();
  notePinToggled = output<string>();

  selectedNote = signal<Note | null>(null);

  private noteService = inject(NoteService);

  pinnedNotes = computed(() =>
    this.noteService.notes().filter((note) => note.isPinned)
  );
  unpinnedNotes = computed(() =>
    this.noteService.notes().filter((note) => !note.isPinned)
  );

  dropPinned(event: CdkDragDrop<Note[]>): void {
    const pinnedNotesCopy = [...this.pinnedNotes()];

    moveItemInArray(pinnedNotesCopy, event.previousIndex, event.currentIndex);

    this.emitUpdatedNotes(pinnedNotesCopy, this.unpinnedNotes());
  }

  dropUnpinned(event: CdkDragDrop<Note[]>): void {
    const unpinnedNotesCopy = [...this.unpinnedNotes()];

    moveItemInArray(unpinnedNotesCopy, event.previousIndex, event.currentIndex);

    this.emitUpdatedNotes(this.pinnedNotes(), unpinnedNotesCopy);
  }

  emitUpdatedNotes(pinnedNotes: Note[], unpinnedNotes: Note[]): void {
    const allNotes = [...pinnedNotes, ...unpinnedNotes];

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
    this.noteUpdated.emit(data.note);
  }

  closeModal(): void {
    this.selectedNote.set(null);
  }

  saveEditedNote(updatedNote: Note): void {
    this.noteUpdated.emit(updatedNote);
    this.selectedNote.set(null);
  }

  handlePinToggled(updatedNote: Note): void {
    this.noteUpdated.emit(updatedNote);
  }
}
