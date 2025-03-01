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
  // Inputs and outputs
  note = input.required<Note>();
  deleteNote = output<string>();
  editNote = output<Note>();
  togglePin = output<string>();
  checkboxToggled = output<{ note: Note; itemId: string }>();

  // Config
  colorConfig = colorConfig;

  handleDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteNote.emit(this.note().id);
  }

  handleNoteClick(event: MouseEvent): void {
    // Don't trigger note edit if a link was clicked
    if ((event.target as HTMLElement).tagName === 'A') {
      return;
    }

    // Don't open edit view if the click was on a checkbox or its label
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
    // Stop propagation to prevent the note from being opened
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

    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s]+)/g;

    // Replace URLs with anchor tags
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

    // Find all top-level items that are not checked
    const activeItems: CheckListItem[] = [];

    // Process all items
    for (let i = 0; i < checkListItems.length; i++) {
      const item = checkListItems[i];

      // If this is a top-level item (level 0)
      if (item.level === 0) {
        // If it's not checked, add it and all its children
        if (!item.checked) {
          activeItems.push(item);

          // Add all child items until we reach another top-level item
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

    // Find all top-level items that are checked and their children
    const completedItems: CheckListItem[] = [];

    // Process all items
    for (let i = 0; i < checkListItems.length; i++) {
      const item = checkListItems[i];

      // If this is a top-level item (level 0)
      if (item.level === 0) {
        // If it's checked, add it and all its children
        if (item.checked) {
          completedItems.push(item);

          // Add all child items until we reach another top-level item
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