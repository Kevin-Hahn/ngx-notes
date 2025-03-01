import { Injectable } from '@angular/core';
import { Note, CheckListItem } from '../models/note.model';
import colorConfig from '../config/colors.json';

@Injectable({
  providedIn: 'root'
})
export class DevNotesService {
  private readonly ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Sample task titles for generating random checklists
  private readonly TASK_TITLES = [
    'Buy groceries',
    'Call doctor',
    'Schedule meeting',
    'Pay bills',
    'Finish project',
    'Send email to team',
    'Review documents',
    'Update website',
    'Research new tools',
    'Plan vacation',
    'Clean apartment',
    'Fix bug in code',
    'Prepare presentation',
    'Read article',
    'Write blog post',
    'Exercise',
    'Call mom',
    'Pick up package',
    'Renew subscription',
    'Update resume'
  ];
  
  // Sample subtask titles
  private readonly SUBTASK_TITLES = [
    'Review details',
    'Gather materials',
    'Make notes',
    'Set reminder',
    'Check requirements',
    'Verify information',
    'Follow up',
    'Prepare questions',
    'Create outline',
    'Schedule time',
    'Milk',
    'Eggs',
    'Bread',
    'Coffee',
    'Fruits',
    'Vegetables',
    'Cheese',
    'Yogurt',
    'Chicken',
    'Rice'
  ];
  
  // Sample URLs to include in some tasks
  private readonly SAMPLE_URLS = [
    'https://example.com',
    'https://github.com',
    'https://angular.io',
    'https://material.angular.io',
    'https://stackoverflow.com',
    'https://medium.com',
    'https://dev.to'
  ];
  
  /**
   * Generate sample notes for development mode
   * @returns An array of sample notes
   */
  generateSampleNotes(): Note[] {
    const notes: Note[] = [];
    const colors = colorConfig.colorOptions;
    
    // Create 11 notes (A-K) with different colors
    for (let i = 0; i < 11; i++) {
      const title = this.ALPHABET[i];
      const color = colors[i % colors.length].value;
      const isCheckList = i >= 5; // Half notes are checklists
      const isPinned = i < 3; // First 3 notes are pinned
      
      if (isCheckList) {
        notes.push(this.createChecklistNote(title, color, isPinned, i));
      } else {
        notes.push(this.createTextNote(title, color, isPinned, i));
      }
    }
    
    return notes;
  }
  
  /**
   * Create a text note with lorem ipsum content
   */
  private createTextNote(title: string, color: string, isPinned: boolean, index: number): Note {
    const now = new Date();
    const modifiedDate = new Date(now);
    modifiedDate.setHours(now.getHours() - index); // Different modification times
    
    return {
      id: `dev-note-${title}`,
      title: `Note ${title}`,
      content: this.generateLoremIpsum(index + 1),
      createdAt: now,
      modifiedAt: modifiedDate,
      color: color,
      isPinned: isPinned,
      isCheckList: false
    };
  }
  
  /**
   * Create a checklist note with sample tasks
   */
  private createChecklistNote(title: string, color: string, isPinned: boolean, seed: number): Note {
    const now = new Date();
    const modifiedDate = new Date(now);
    modifiedDate.setHours(now.getHours() - seed); // Different modification times
    
    return {
      id: `dev-note-${title}`,
      title: `Checklist ${title}`,
      content: '',
      createdAt: now,
      modifiedAt: modifiedDate,
      color: color,
      isPinned: isPinned,
      isCheckList: true,
      checkListItems: this.generateRandomChecklistItems(seed)
    };
  }
  
  /**
   * Generate lorem ipsum text of varying length
   */
  private generateLoremIpsum(multiplier: number): string {
    const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;
    
    // Repeat the text based on the multiplier (1-5 paragraphs)
    return Array(Math.min(5, multiplier))
      .fill(loremIpsum)
      .join('\n\n');
  }
  
  /**
   * Generate random checklist items with different states and indentation levels
   * @param seed A number to help randomize the generation
   */
  private generateRandomChecklistItems(seed: number): CheckListItem[] {
    const items: CheckListItem[] = [];
    
    // Use the seed to determine the number of top-level items (3-7)
    const numTopLevelItems = 3 + (seed % 5);
    
    // Create top-level items
    for (let i = 0; i < numTopLevelItems; i++) {
      // Select a random task title
      const taskIndex = (seed + i) % this.TASK_TITLES.length;
      const taskTitle = this.TASK_TITLES[taskIndex];
      
      // Determine if this task should be checked (completed)
      const isChecked = (seed + i) % 3 === 0;
      
      // Add URL to some tasks
      const shouldAddUrl = (seed + i) % 7 === 0;
      const taskText = shouldAddUrl 
        ? `${taskTitle} at ${this.SAMPLE_URLS[(seed + i) % this.SAMPLE_URLS.length]}`
        : taskTitle;
      
      // Create the top-level item
      const topLevelItem: CheckListItem = {
        id: `task-${seed}-${i}`,
        text: taskText,
        checked: isChecked,
        level: 0
      };
      
      items.push(topLevelItem);
      
      // Determine if this task should have subtasks
      const hasSubtasks = (seed + i) % 2 === 0;
      
      if (hasSubtasks) {
        // Determine number of subtasks (1-3)
        const numSubtasks = 1 + ((seed + i) % 3);
        
        // Create subtasks
        for (let j = 0; j < numSubtasks; j++) {
          // Select a random subtask title
          const subtaskIndex = (seed + i + j) % this.SUBTASK_TITLES.length;
          const subtaskTitle = this.SUBTASK_TITLES[subtaskIndex];
          
          // Subtasks are usually checked if parent is checked
          const isSubtaskChecked = isChecked || ((seed + i + j) % 4 === 0);
          
          // Create the subtask
          const subtask: CheckListItem = {
            id: `task-${seed}-${i}-${j}`,
            text: subtaskTitle,
            checked: isSubtaskChecked,
            level: 1
          };
          
          items.push(subtask);
          
          // Rarely add a level 2 subtask
          if ((seed + i + j) % 5 === 0) {
            const level2Subtask: CheckListItem = {
              id: `task-${seed}-${i}-${j}-0`,
              text: `Detail for ${subtaskTitle.toLowerCase()}`,
              checked: isSubtaskChecked,
              level: 2
            };
            
            items.push(level2Subtask);
          }
        }
      }
    }
    
    // Add at least one completed top-level task at the end
    items.push({
      id: `task-${seed}-completed`,
      text: 'Completed task',
      checked: true,
      level: 0
    });
    
    return items;
  }
}