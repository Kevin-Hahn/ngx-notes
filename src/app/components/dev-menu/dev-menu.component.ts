import { Component, inject, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteService } from '../../services/note.service';
import { DevNotesService } from '../../services/dev-notes.service';

@Component({
  selector: 'app-dev-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dev-menu.component.html',
  styleUrls: ['./dev-menu.component.css']
})
export class DevMenuComponent {
  isDevMode = isDevMode();
  isMenuOpen = false;
  
  private noteService = inject(NoteService);
  private devNotesService = inject(DevNotesService);
  
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  addSampleNotes(): void {
    const sampleNotes = this.devNotesService.generateSampleNotes();
    
    // Add each sample note to the service
    sampleNotes.forEach(note => {
      this.noteService.addNote(note);
    });
    
    this.isMenuOpen = false;
  }
  
  clearAllNotes(): void {
    this.noteService.clearAllNotes();
    this.isMenuOpen = false;
  }
}