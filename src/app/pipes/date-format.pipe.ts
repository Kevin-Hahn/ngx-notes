import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | null | undefined, format: string = 'relative'): string {
    if (!value) return '';
    
    const dateTime = typeof value === 'string' 
      ? DateTime.fromISO(value) 
      : DateTime.fromJSDate(value);
    
    if (!dateTime.isValid) return '';
    
    const now = DateTime.now();
    
    if (format === 'relative') {
      const diff = now.diff(dateTime, ['minutes', 'hours', 'days']);
      const diffMinutes = Math.floor(diff.minutes);
      const diffHours = Math.floor(diff.hours);
      const diffDays = Math.floor(diff.days);
      
      // If less than 1 hour ago
      if (diffMinutes < 60) {
        return diffMinutes <= 1 ? 'just now' : `${diffMinutes} mins ago`;
      }
      // If less than 24 hours ago
      else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      }
      // If less than 7 days ago
      else if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
      }
      // Otherwise show the date
      else {
        return dateTime.toFormat('LLL d');
      }
    } else if (format === 'full') {
      return dateTime.toFormat('LLL d, yyyy, h:mm a');
    } else {
      return dateTime.toFormat(format);
    }
  }
}