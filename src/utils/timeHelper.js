import { parse, isValid } from 'date-fns';

// Parse a time string like "10:05 AM" into minutes from midnight
export function timeStringToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const cleaned = timeStr.trim();
  // Attempt to parse with date-fns
  const parsed = parse(cleaned, 'h:mm a', new Date());
  if (isValid(parsed)) {
    return parsed.getHours() * 60 + parsed.getMinutes();
  }
  // Also try 24-hour format "HH:mm"
  const parsed24 = parse(cleaned, 'HH:mm', new Date());
  if (isValid(parsed24)) {
    return parsed24.getHours() * 60 + parsed24.getMinutes();
  }
  return null; // invalid
}

// Convert minutes to "10:05 AM" string (for display)
export function minutesToTimeString(minutes) {
  if (minutes === null || minutes === undefined) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const displayHour = h % 12 || 12;
  const pad = (n) => String(n).padStart(2, '0');
  return `${displayHour}:${pad(m)} ${period}`;
}

// Get current date in format like "1-Jun-2026"
export function formatDate(date) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}