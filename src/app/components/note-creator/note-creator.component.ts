import { CommonModule } from '@angular/common';
import {
  type AfterViewInit,
  Component,
  type ElementRef,
  ViewChild,
  effect,
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import colorConfig from '../../config/colors.json';
import type { Note } from '../../models/note.model';
import { ColorPickerComponent } from '../color-picker/color-picker.component';

@Component({
  selector: 'app-note-creator',
  imports: [CommonModule, FormsModule, ColorPickerComponent, MatTooltipModule],
  templateUrl: './note-creator.component.html',
  styleUrls: ['./note-creator.component.css']
})
export class NoteCreatorComponent implements AfterViewInit {
  noteAdded = output<Note>();

  @ViewChild('noteInput') noteInput!: ElementRef;
  @ViewChild('noteTitleInput') noteTitleInput!: ElementRef;
  @ViewChild('noteContentInput') noteContentInput!: ElementRef;

  isExpanded = signal(false);
  noteTitle = signal('');
  noteContent = signal('');
  selectedColor = signal(colorConfig.defaultColor);
  initialInputValue = signal('');

  colorConfig = colorConfig;

  constructor() {
    effect(() => {
      if (this.isExpanded()) {
        setTimeout(() => {
          if (this.noteContentInput?.nativeElement) {
            this.noteContentInput.nativeElement.focus();
          }
        }, 0);
      } else {
        setTimeout(() => {
          if (this.noteInput?.nativeElement) {
            this.noteInput.nativeElement.focus();
          }
        }, 0);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.noteInput?.nativeElement) {
        this.noteInput.nativeElement.focus();
      }
    }, 0);
  }

  expandInput(): void {
    this.isExpanded.set(true);
  }

  handleInputKeyup(event: KeyboardEvent): void {
    if (this.noteInput?.nativeElement) {
      this.initialInputValue.set(this.noteInput.nativeElement.value);
    }

    if (this.initialInputValue().trim() !== '') {
      this.isExpanded.set(true);

      this.noteContent.set(this.initialInputValue());

      setTimeout(() => {
        if (this.noteInput?.nativeElement) {
          this.noteInput.nativeElement.value = '';
        }
      }, 0);
    }
  }

  handleTitleInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab' || event.key === 'Enter') {
      event.preventDefault();
      if (this.noteContentInput?.nativeElement) {
        this.noteContentInput.nativeElement.focus();
      }
    }
  }

  handleColorSelected(color: string): void {
    this.selectedColor.set(color);
  }

  saveNote(): void {
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