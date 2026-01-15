/**
 * Date formatting utilities for consistent date display across the application
 * 
 * All dates in the application should be formatted as: dd/mm/yyyy
 * 
 * Usage:
 *   import { formatDate, formatDateTime } from '../utils/dateFormatter';
 *   <div>{formatDate(task.dueDate)}</div>
 */

/**
 * Safely parses a date value from various formats (ISO string, Date object, Firestore Timestamp object)
 * @param dateValue - Date value in any format
 * @returns Date object or null if invalid
 */
export const parseDate = (dateValue: string | Date | any): Date | null => {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // If it's a string (ISO format)
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // If it's a Firestore Timestamp object (from API serialization)
  if (dateValue && typeof dateValue === 'object') {
    // Handle Firestore Timestamp format: { _seconds: number, _nanoseconds: number }
    if (dateValue._seconds !== undefined) {
      return new Date(dateValue._seconds * 1000);
    }
    // Handle alternative format: { seconds: number, nanoseconds: number }
    if (dateValue.seconds !== undefined) {
      return new Date(dateValue.seconds * 1000);
    }
    // Try to parse as ISO string if it has a toISOString method
    if (typeof dateValue.toISOString === 'function') {
      return new Date(dateValue.toISOString());
    }
  }
  
  return null;
};

/**
 * Formats a date as dd/mm/yyyy
 * @param dateValue - Date value in any format
 * @returns Formatted date string (dd/mm/yyyy) or 'Invalid Date' if parsing fails
 * 
 * @example
 * formatDate('2024-01-15') // Returns '15/01/2024'
 * formatDate(new Date()) // Returns current date as '15/01/2024'
 */
export const formatDate = (dateValue: string | Date | any): string => {
  const date = parseDate(dateValue);
  if (!date) return 'Invalid Date';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date and time as dd/mm/yyyy HH:mm
 * @param dateValue - Date value in any format
 * @returns Formatted date-time string (dd/mm/yyyy HH:mm) or 'Invalid Date' if parsing fails
 * 
 * @example
 * formatDateTime('2024-01-15T10:30:00') // Returns '15/01/2024 10:30'
 */
export const formatDateTime = (dateValue: string | Date | any): string => {
  const date = parseDate(dateValue);
  if (!date) return 'Invalid Date';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Formats a date and time with seconds as dd/mm/yyyy HH:mm:ss
 * @param dateValue - Date value in any format
 * @returns Formatted date-time string (dd/mm/yyyy HH:mm:ss) or 'Invalid Date' if parsing fails
 * 
 * @example
 * formatDateTimeWithSeconds('2024-01-15T10:30:45') // Returns '15/01/2024 10:30:45'
 */
export const formatDateTimeWithSeconds = (dateValue: string | Date | any): string => {
  const date = parseDate(dateValue);
  if (!date) return 'Invalid Date';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Gets relative time description (e.g., "2 days ago", "in 3 hours")
 * @param dateValue - Date value in any format
 * @returns Relative time string
 */
export const getRelativeTime = (dateValue: string | Date | any): string => {
  const date = parseDate(dateValue);
  if (!date) return 'Invalid Date';
  
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
  const diffMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
  
  if (diffDays > 0) {
    return diffMs > 0 ? `in ${diffDays} day${diffDays > 1 ? 's' : ''}` : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return diffMs > 0 ? `in ${diffHours} hour${diffHours > 1 ? 's' : ''}` : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return diffMs > 0 ? `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}` : `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'just now';
  }
};
