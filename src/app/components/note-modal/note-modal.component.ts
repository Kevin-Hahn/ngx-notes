import {
  type CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type OnInit,
  input,
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import colorConfig from '../../config/colors.json';
import type { CheckListItem, Note } from '../../models/note.model';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteModalComponent implements OnInit {
  note = input.required<Note>();
  close = output<void>();
  save = output<Note>();
  delete = output<string>();
  pinToggled = output<Note>();

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

  colorConfig = colorConfig;

  ngOnInit(): void {
    this.editedNote.set({
      ...this.note(),
      checkListItems: this.note().checkListItems
        ? structuredClone(this.note().checkListItems)
        : [],
    });
    if (!this.editedNote().color) {
      this.updateEditedNote({ color: colorConfig.defaultColor });
    }
  }

  updateEditedNote(changes: Partial<Note>): void {
    this.editedNote.set({
      ...this.editedNote(),
      ...changes
    });
  }

  updateChecklistItemText(index: number, text: string): void {
    const items = [...(this.editedNote().checkListItems || [])];

    if (index >= 0 && index < items.length) {
      items[index] = { ...items[index], text };
    }

    this.editedNote.set({
      ...this.editedNote(),
      checkListItems: items
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

      this.editedNote.set({
        ...this.editedNote(),
        checkListItems: currentItems
      });
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

        this.editedNote.set({
          ...this.editedNote(),
          checkListItems: currentItems
        });
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

        this.editedNote.set({
          ...this.editedNote(),
          checkListItems: currentItems
        });
      }
    }
  }

  dropChecklistItem(event: CdkDragDrop<CheckListItem[]>): void {
    const checkListItems = this.editedNote().checkListItems;
    if (!checkListItems) return;

    const currentItems = [...checkListItems];

    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(currentItems, event.previousIndex, event.currentIndex);
      this.editedNote.set({
        ...this.editedNote(),
        checkListItems: currentItems
      });
    }
  }


  handleItemFocus(): void {
    this.isDragDisabled.set(true);
  }

  handleItemBlur(): void {
    this.isDragDisabled.set(false);
  }
}