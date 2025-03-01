import { 
  Component, 
  output, 
  ViewChild, 
  ElementRef, 
  AfterViewInit, 
  signal, 
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Note } from '../../models/note.model';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import colorConfig from '../../config/colors.json';

@Component({
  selector: 'app-note-creator',
  imports: [CommonModule, FormsModule, ColorPickerComponent, MatTooltipModule],
  templateUrl: './note-creator.component.html',
  styleUrls: ['./note-creator.component.css']
})
export class NoteCreatorComponent implements AfterViewInit {
  // Outputs
  noteAdded = output<Note>();
  
  // ViewChild references
  @ViewChild('noteInput') noteInput!: ElementRef;
  @ViewChild('noteTitleInput') noteTitleInput!: ElementRef;
  @ViewChild('noteContentInput') noteContentInput!: ElementRef;
  
  // Signals
  isExpanded = signal(false);
  noteTitle = signal('');
  noteContent = signal('');
  selectedColor = signal(colorConfig.defaultColor);
  initialInputValue = signal('');
  
  // Config
  colorConfig = colorConfig;
  
  constructor() {
    // Effect to focus the appropriate input when expanded state changes
    effect(() => {
      if (this.isExpanded()) {
        setTimeout(() => {
          if (this.noteContentInput && this.noteContentInput.nativeElement) {
            this.noteContentInput.nativeElement.focus();
          }
        }, 0);
      } else {
        setTimeout(() => {
          if (this.noteInput && this.noteInput.nativeElement) {
            this.noteInput.nativeElement.focus();
          }
        }, 0);
      }
    });
  }
  
  ngAfterViewInit(): void {
    // Focus the note input field after view initialization
    setTimeout(() => {
      if (this.noteInput && this.noteInput.nativeElement) {
        this.noteInput.nativeElement.focus();
      }
    }, 0);
  }
  
  expandInput(): void {
    this.isExpanded.set(true);
  }
  
  handleInputKeyup(event: KeyboardEvent): void {
    // Store the current input value
    if (this.noteInput && this.noteInput.nativeElement) {
      this.initialInputValue.set(this.noteInput.nativeElement.value);
    }
    
    // If user starts typing, expand the form
    if (this.initialInputValue().trim() !== '') {
      this.isExpanded.set(true);
      
      // Transfer the typed content to the content field
      this.noteContent.set(this.initialInputValue());
      
      // Clear the initial input to avoid duplication
      setTimeout(() => {
        if (this.noteInput && this.noteInput.nativeElement) {
          this.noteInput.nativeElement.value = '';
        }
      }, 0);
    }
  }
  
  handleTitleInputKeydown(event: KeyboardEvent): void {
    // When user presses Tab or Enter in the title field, move to the content field
    if (event.key === 'Tab' || event.key === 'Enter') {
      event.preventDefault();
      if (this.noteContentInput && this.noteContentInput.nativeElement) {
        this.noteContentInput.nativeElement.focus();
      }
    }
  }
  
  handleColorSelected(color: string): void {
    this.selectedColor.set(color);
  }
  
  saveNote(): void {
    // Check if we have either title or content to save
    if (this.isExpanded() && (this.noteTitle().trim() || this.noteContent().trim())) {
      const now = new Date();
      const newNote: Note = {
        id: Date.now().toString(),
        title: this.noteTitle().trim(),
        content: this.noteContent().trim(),
        createdAt: now,
        modifiedAt: now,
        color: this.selectedColor()
      };
      
      this.noteAdded.emit(newNote);
      this.resetForm();
    } else {
      // Nothing to save, just reset
      this.resetForm();
    }
  }
  
  resetForm(): void {
    this.isExpanded.set(false);
    this.noteTitle.set('');
    this.noteContent.set('');
    this.initialInputValue.set('');
    this.selectedColor.set(colorConfig.defaultColor);
  }
}