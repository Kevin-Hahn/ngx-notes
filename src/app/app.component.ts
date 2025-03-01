import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DevMenuComponent } from './components/dev-menu/dev-menu.component';
import { NoteCreatorComponent } from './components/note-creator/note-creator.component';
import { NotesGridComponent } from './components/notes-grid/notes-grid.component';
import type { Note } from './models/note.model';
import { NoteService } from './services/note.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    NoteCreatorComponent,
    NotesGridComponent,
    DevMenuComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  noteService = inject(NoteService);

  addNote(note: Note): void {
    this.noteService.addNote(note);
  }

  updateNotes(updatedNotes: Note[]): void {
    this.noteService.updateNotesOrder(updatedNotes);
  }

  deleteNote(noteId: string): void {
    this.noteService.deleteNote(noteId);
  }

  updateNote(updatedNote: Note): void {
    this.noteService.updateNote(updatedNote);
  }

  toggleNotePin(noteId: string): void {
    this.noteService.toggleNotePin(noteId);
  }
}