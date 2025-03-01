import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Note, CheckListItem } from '../../models/note.model';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import colorConfig from '../../config/colors.json';

@Component({
  selector: 'app-note-modal',
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    DateFormatPipe,
    ColorPickerComponent,
    MatCheckboxModule,
    MatTooltipModule,
    ConfirmationModalComponent,
  ],
  templateUrl: './note-modal.component.html',
  styleUrls: ['./note-modal.component.css'],
})
export class NoteModalComponent {
  // Inputs and outputs
  note = input.required<Note>();
  close = output<void>();
  save = output<Note>();
  delete = output<string>();
  pinToggled = output<Note>();

  // Signals
  editedNote = signal<Note>({
    id: '',
    title: '',
    content: '',
    createdAt: new Date(),
    isCheckList: false,
    checkListItems: [],
    color: colorConfig.defaultColor,
    isPinned: false,
  });

  newItemText = signal('');
  showDeleteConfirmation = signal(false);
  isDragDisabled = signal(false);

  // Config
  colorConfig = colorConfig;

  // Effect to initialize the edited note when the input note changes
  ref = effect(() => {
    this.editedNote.set({
      ...this.note(),
      checkListItems: this.note().checkListItems
        ? structuredClone(this.note().checkListItems)
        : [],
    });

    const checkListItems = this.editedNote().checkListItems;
    if (
      this.editedNote().isCheckList &&
      (!checkListItems || checkListItems.length === 0)
    ) {
      this.convertContentToChecklist();
    }

    if (!this.editedNote().color) {
      this.updateEditedNote({ color: colorConfig.defaultColor });
    }
  });

  updateEditedNote(changes: Partial<Note>): void {
    this.editedNote.update((note) => {
      const updatedNote = { ...note };
      
      if (changes.id !== undefined) updatedNote.id = changes.id;
      if (changes.title !== undefined) updatedNote.title = changes.title;
      if (changes.content !== undefined) updatedNote.content = changes.content;
      if (changes.createdAt !== undefined) updatedNote.createdAt = changes.createdAt;
      if (changes.modifiedAt !== undefined) updatedNote.modifiedAt = changes.modifiedAt;
      if (changes.isCheckList !== undefined) updatedNote.isCheckList = changes.isCheckList;
      if (changes.checkListItems !== undefined) updatedNote.checkListItems = changes.checkListItems;
      if (changes.color !== undefined) updatedNote.color = changes.color;
      if (changes.isPinned !== undefined) updatedNote.isPinned = changes.isPinned;
      
      return updatedNote;
    });
  }

  updateChecklistItemText(index: number, text: string): void {
    this.editedNote.update((note) => {
      const items = [...(note.checkListItems || [])];
      
      if (index >= 0 && index < items.length) {
        items[index] = { ...items[index], text };
      }
      
      return { ...note, checkListItems: items };
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  saveChanges(): void {
    if (this.editedNote().isCheckList) {
      if (!this.editedNote().checkListItems) {
        this.updateEditedNote({ checkListItems: [] });
      }
    } else {
      const checkListItems = this.editedNote().checkListItems;
      if (
        !this.editedNote().content.trim() &&
        checkListItems &&
        checkListItems.length > 0
      ) {
        this.convertChecklistToContent();
      }
    }

    this.save.emit(this.editedNote());
  }

  deleteNote(): void {
    this.showDeleteConfirmation.set(true);
  }

  confirmDelete(): void {
    this.delete.emit(this.editedNote().id);
    this.closeModal();
  }

  cancelDelete(): void {
    this.showDeleteConfirmation.set(false);
  }

  togglePin(): void {
    const isPinned = !this.editedNote().isPinned;
    this.updateEditedNote({ isPinned });
    this.pinToggled.emit(this.editedNote());
  }

  toggleChecklistMode(): void {
    const currentNote = this.editedNote();
    
    if (currentNote.isCheckList) {
      this.convertChecklistToContent();
      this.updateEditedNote({ isCheckList: false });
    } else {
      const items = this.parseTextToChecklistItems(currentNote.content);
      
      this.updateEditedNote({ 
        isCheckList: true,
        checkListItems: items
      });
      
      if (items.length === 0) {
        this.addEmptyChecklistItem();
      }
    }
  }

  handleColorSelected(color: string): void {
    this.updateEditedNote({ color });
  }

  convertContentToChecklist(): void {
    const currentNote = this.editedNote();

    if (currentNote.content.trim()) {
      const checkListItems = this.parseTextToChecklistItems(currentNote.content);
      this.updateEditedNote({ checkListItems });
    } else {
      this.updateEditedNote({ checkListItems: [] });
      this.addEmptyChecklistItem();
    }
  }

  addEmptyChecklistItem(): void {
    const emptyItem: CheckListItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: '',
      checked: false,
      level: 0,
    };
    
    const currentItems = this.editedNote().checkListItems || [];
    this.updateEditedNote({
      checkListItems: [...currentItems, emptyItem]
    });
  }

  parseTextToChecklistItems(content: string): CheckListItem[] {
    if (!content.trim()) {
      return [];
    }

    const lines = content.split('\n').filter((line) => line !== null);
    return lines.map((line) => {
      const leadingSpacesMatch = line.match(/^(\s*)/);
      const leadingSpaces = leadingSpacesMatch
        ? leadingSpacesMatch[0].length
        : 0;

      const level = Math.min(3, Math.floor(leadingSpaces / 2));
      const text = line.trim();

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: text,
        checked: false,
        level: level,
      };
    });
  }

  convertChecklistToContent(): void {
    const currentNote = this.editedNote();
    const checkListItems = currentNote.checkListItems;

    if (checkListItems && checkListItems.length > 0) {
      const lines = checkListItems.map((item) => {
        const indent = '  '.repeat(item.level);
        return `${indent}${item.text}`;
      });

      this.updateEditedNote({ content: lines.join('\n') });
    }
  }

  addChecklistItem(): void {
    if (!this.newItemText().trim()) return;

    const newItem: CheckListItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: this.newItemText(),
      checked: false,
      level: 0,
    };

    const currentItems = this.editedNote().checkListItems || [];
    this.updateEditedNote({
      checkListItems: [...currentItems, newItem],
    });

    this.newItemText.set('');
  }

  deleteChecklistItem(index: number): void {
    const currentItems = [...(this.editedNote().checkListItems || [])];
    if (index >= 0 && index < currentItems.length) {
      currentItems.splice(index, 1);
      this.updateEditedNote({ checkListItems: currentItems });
    }
  }

  toggleCheckbox(item: CheckListItem): void {
    const currentItems = [...(this.editedNote().checkListItems || [])];
    const itemIndex = currentItems.findIndex((i) => i.id === item.id);

    if (itemIndex !== -1) {
      currentItems[itemIndex] = {
        ...currentItems[itemIndex],
        checked: !currentItems[itemIndex].checked,
      };

      if (currentItems[itemIndex].level === 0) {
        const newCheckedState = currentItems[itemIndex].checked;

        let i = itemIndex + 1;
        while (i < currentItems.length && currentItems[i].level > 0) {
          currentItems[i] = {
            ...currentItems[i],
            checked: newCheckedState,
          };
          i++;
        }
      }

      this.updateEditedNote({ checkListItems: currentItems });
    }
  }

  indentItem(index: number): void {
    const currentItems = [...(this.editedNote().checkListItems || [])];
    if (index >= 0 && index < currentItems.length) {
      const item = currentItems[index];

      if (item.level < 3) {
        currentItems[index] = {
          ...item,
          level: item.level + 1,
        };

        this.updateEditedNote({ checkListItems: currentItems });
      }
    }
  }

  outdentItem(index: number): void {
    const currentItems = [...(this.editedNote().checkListItems || [])];
    if (index >= 0 && index < currentItems.length) {
      const item = currentItems[index];

      if (item.level > 0) {
        currentItems[index] = {
          ...item,
          level: item.level - 1,
        };

        this.updateEditedNote({ checkListItems: currentItems });
      }
    }
  }

  dropChecklistItem(event: CdkDragDrop<CheckListItem[]>): void {
    const checkListItems = this.editedNote().checkListItems;
    if (!checkListItems) return;

    const currentItems = [...checkListItems];

    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(currentItems, event.previousIndex, event.currentIndex);
      this.updateEditedNote({ checkListItems: currentItems });
    }
  }

  getColorName(colorValue: string): string {
    const color = this.colorConfig.colorOptions.find(
      (c) => c.value === colorValue
    );
    return color ? color.name : 'Unknown';
  }

  handleItemFocus(): void {
    this.isDragDisabled.set(true);
  }

  handleItemBlur(): void {
    this.isDragDisabled.set(false);
  }
}