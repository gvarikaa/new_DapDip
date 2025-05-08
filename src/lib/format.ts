import { formatDistanceToNow, format, formatDistance } from 'date-fns';

/**
 * Format a timestamp as a human-readable relative time string
 * @param date Date to format
 * @returns Formatted string like "5 minutes ago", "2 days ago", etc.
 */
export function formatTimeAgo(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a time duration in seconds to MM:SS format
 * @param seconds Time in seconds
 * @returns Formatted string like "02:30"
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format a date to a standard date string
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'PPP');
}

/**
 * Format a date to a standard date and time string
 * @param date Date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'PPpp');
}

/**
 * Format a number of bytes to a human-readable file size
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 * @returns Formatted string like "1.5 MB"
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format a count number with K/M/B suffixes for large numbers
 * @param count Number to format
 * @returns Formatted string like "1.5K", "2.3M", etc.
 */
export function formatCount(count: number): string {
  if (count < 1000) return count.toString();
  
  if (count < 1000000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  if (count < 1000000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  
  return (count / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
}

/**
 * Format a duration between two dates
 * @param start Start date
 * @param end End date
 * @returns Formatted duration string
 */
export function formatDuration(start: Date | string, end: Date | string): string {
  if (!start || !end) return '';
  
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  return formatDistance(startDate, endDate, { includeSeconds: true });
}