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
import { MatCheckboxModule, type MatCheckboxChange } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import colorConfig from '../../config/colors.json';
import type { CheckListItem, Note } from '../../models/note.model';
import { ColorPickerComponent } from '../color-picker/color-picker.component';

@Component({
  selector: 'app-note-creator',
  imports: [CommonModule, FormsModule, ColorPickerComponent, MatTooltipModule, MatCheckboxModule],
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
  isCheckList = signal(false);
  checkListItems = signal<CheckListItem[]>([]);
  newItemText = signal('');

  colorConfig = colorConfig;

  constructor() {
    effect(() => {
      if (this.isExpanded()) {
        setTimeout(() => {
          if (this.noteContentInput?.nativeElement && !this.isCheckList()) {
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
      if (this.noteContentInput?.nativeElement && !this.isCheckList()) {
        this.noteContentInput.nativeElement.focus();
      }
    }
  }

  handleColorSelected(color: string): void {
    this.selectedColor.set(color);
  }

  toggleChecklistMode(): void {
    if (this.isCheckList()) {
      // Convert checklist to text
      if (this.checkListItems().length > 0) {
        const lines = this.checkListItems().map(item => {
          const indent = '  '.repeat(item.level);
          return `${indent}${item.text}`;
        });
        this.noteContent.set(lines.join('\n'));
      }
      this.isCheckList.set(false);
    } else {
      // Convert text to checklist
      if (this.noteContent().trim()) {
        const items = this.parseTextToChecklistItems(this.noteContent());
        this.checkListItems.set(items);
      } else {
        this.checkListItems.set([]);
        this.addEmptyChecklistItem();
      }
      this.isCheckList.set(true);
    }
  }

  parseTextToChecklistItems(content: string): CheckListItem[] {
    if (!content.trim()) {
      return [];
    }

    const lines = content.split('\n').filter(line => line !== null);
    return lines.map(line => {
      const leadingSpacesMatch = line.match(/^(\s*)/);
      const leadingSpaces = leadingSpacesMatch ? leadingSpacesMatch[0].length : 0;
      const level = Math.min(3, Math.floor(leadingSpaces / 2));
      const text = line.trim();

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: text,
        checked: false,
        level: level
      };
    });
  }

  addEmptyChecklistItem(): void {
    const emptyItem: CheckListItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: '',
      checked: false,
      level: 0
    };

    this.checkListItems.update(items => [...items, emptyItem]);
  }

  addChecklistItem(): void {
    if (!this.newItemText().trim()) return;

    const newItem: CheckListItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: this.newItemText(),
      checked: false,
      level: 0
    };

    this.checkListItems.update(items => [...items, newItem]);
    this.newItemText.set('');
  }

  updateChecklistItemText(itemId: string, text: string): void {
    this.checkListItems.update(items => 
      items.map(item => 
        item.id === itemId ? { ...item, text } : item
      )
    );
  }

  deleteChecklistItem(itemId: string): void {
    this.checkListItems.update(items => 
      items.filter(item => item.id !== itemId)
    );
  }

  toggleCheckbox(item: CheckListItem, event: MatCheckboxChange): void {
    this.checkListItems.update(items => {
      const updatedItems = [...items];
      const itemIndex = updatedItems.findIndex(i => i.id === item.id);
      
      if (itemIndex !== -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          checked: event.checked
        };
      }
      
      return updatedItems;
    });
  }

  saveNote(): void {
    if (this.isExpanded() && (this.noteTitle().trim() || this.noteContent().trim() || 
        (this.isCheckList() && this.checkListItems().length > 0))) {
      const now = new Date();
      const newNote: Note = {
        id: Date.now().toString(),
        title: this.noteTitle().trim(),
        content: this.isCheckList() ? '' : this.noteContent().trim(),
        createdAt: now,
        modifiedAt: now,
        color: this.selectedColor(),
        isCheckList: this.isCheckList(),
        checkListItems: this.isCheckList() ? [...this.checkListItems()] : undefined
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
    this.isCheckList.set(false);
    this.checkListItems.set([]);
    this.newItemText.set('');
  }
}