import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import {
  type MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import colorConfig from '../../config/colors.json';
import type { CheckListItem, Note } from '../../models/note.model';

@Component({
  selector: 'app-note-card',
  imports: [CommonModule, MatCheckboxModule, MatTooltipModule],
  templateUrl: './note-card.component.html',
  styleUrls: ['./note-card.component.css'],
})
export class NoteCardComponent {
  note = input.required<Note>();
  deleteNote = output<string>();
  editNote = output<Note>();
  togglePin = output<string>();
  checkboxToggled = output<{ note: Note; itemId: string }>();

  colorConfig = colorConfig;

  handleDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteNote.emit(this.note().id);
  }

  handleNoteClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).tagName === 'A') {
      return;
    }

    const target = event.target as HTMLElement;
    if (
      target.closest('.checklist-checkbox') ||
      target.classList.contains('mdc-checkbox') ||
      target.classList.contains('mdc-checkbox__background') ||
      target.classList.contains('mdc-checkbox__native-control')
    ) {
      return;
    }

    this.editNote.emit(this.note());
  }

  handleLinkClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  handleTogglePin(event: MouseEvent): void {
    event.stopPropagation();
    this.togglePin.emit(this.note().id);
  }

  /**
   * Format text to make URLs clickable
   */
  formatItemText(text: string): string {
    if (!text) return '';

    const urlPattern = /(https?:\/\/[^\s]+)/g;

    return text.replace(urlPattern, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  }

  /**
   * Toggle checkbox state directly from the grid card
   */
  toggleCheckbox(item: CheckListItem, event: MatCheckboxChange): void {
    const currentNote = this.note();
    const clonedItems = currentNote.checkListItems ? structuredClone(currentNote.checkListItems) : [];
    const updatedNote = { ...currentNote, checkListItems: clonedItems };

    const itemIndex = clonedItems.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
      clonedItems[itemIndex] = { ...clonedItems[itemIndex], checked: event.checked };

      if (clonedItems[itemIndex].level === 0) {
        const newCheckedState = clonedItems[itemIndex].checked;
        let i = itemIndex + 1;
        while (i < clonedItems.length && clonedItems[i].level > 0) {
          clonedItems[i] = { ...clonedItems[i], checked: newCheckedState };
          i++;
        }
      }

      updatedNote.modifiedAt = new Date();
      this.checkboxToggled.emit({ note: updatedNote, itemId: item.id });
    }
  }

  /**
   * Get all active (unchecked) top-level items and their unchecked children
   */
  getActiveItems(): CheckListItem[] {
    const checkListItems = this.note().checkListItems;
    if (!checkListItems || checkListItems.length === 0) {
      return [];
    }

    const activeItems: CheckListItem[] = [];

    for (let i = 0; i < checkListItems.length; i++) {
      const item = checkListItems[i];

      if (item.level === 0) {
        if (!item.checked) {
          activeItems.push(item);

          let j = i + 1;
          while (j < checkListItems.length && checkListItems[j].level > 0) {
            activeItems.push(checkListItems[j]);
            j++;
          }
        }
      }
    }

    return activeItems;
  }

  /**
   * Get all completed (checked) top-level items and all their children
   */
  getCompletedItems(): CheckListItem[] {
    const checkListItems = this.note().checkListItems;
    if (!checkListItems || checkListItems.length === 0) {
      return [];
    }

    const completedItems: CheckListItem[] = [];

    for (let i = 0; i < checkListItems.length; i++) {
      const item = checkListItems[i];

      if (item.level === 0) {
        if (item.checked) {
          completedItems.push(item);

          let j = i + 1;
          while (j < checkListItems.length && checkListItems[j].level > 0) {
            completedItems.push(checkListItems[j]);
            j++;
          }
        }
      }
    }

    return completedItems;
  }
}