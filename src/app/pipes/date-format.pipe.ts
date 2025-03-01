import { Pipe, type PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | null | undefined, format = 'relative'): string {
    if (!value) return '';

    const dateTime = typeof value === 'string'
      ? DateTime.fromISO(value)
      : DateTime.fromJSDate(value);

    if (!dateTime.isValid) return '';

    if (format === 'relative') return this.formatRelative(dateTime);
    if (format === 'full') return this.formatFull(dateTime);
    return this.formatCustom(dateTime, format);
  }

  /**
   * Returns a relative time string for the provided DateTime.
   * 
   * Uses Luxon's toRelative() if available, otherwise computes a diff.
   *
   * @param dateTime - The Luxon DateTime instance.
   * @returns A string representing the relative time.
   */
  private formatRelative(dateTime: DateTime): string {
    const relative = dateTime.toRelative({ base: DateTime.now() });
    if (relative) return relative.replace('in ', '').replace('about ', '');
    // Fallback in case toRelative returns null
    const diff = DateTime.now().diff(dateTime, ['minutes', 'hours', 'days']).toObject();
    const diffMinutes = Math.floor(diff.minutes ?? 0);
    if (diffMinutes < 60) {
      return diffMinutes <= 1 ? 'just now' : `${diffMinutes} mins ago`;
    }
    const diffHours = Math.floor(diff.hours ?? 0);
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    const diffDays = Math.floor(diff.days ?? 0);
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
    return dateTime.toFormat('LLL d');
  }

  /**
   * Formats the DateTime object into a full date string.
   *
   * @param dateTime - The Luxon DateTime instance.
   * @returns A formatted full date string.
   */
  private formatFull(dateTime: DateTime): string {
    return dateTime.toFormat('LLL d, yyyy, h:mm a');
  }

  /**
   * Formats the DateTime object according to a custom format string.
   *
   * @param dateTime - The Luxon DateTime instance.
   * @param format - The custom format string.
   * @returns A formatted date string.
   */
  private formatCustom(dateTime: DateTime, format: string): string {
    return dateTime.toFormat(format);
  }
}