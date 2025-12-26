/**
 * Converts 24-hour time format (HH:MM) to 12-hour AM/PM format
 */
export function formatTo12Hour(time: string | null | undefined): string {
  if (!time) return '--:--';
  
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  
  if (isNaN(hour)) return time;
  
  const period = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  
  return `${hour}:${minute} ${period}`;
}

/**
 * Converts hour number (0-23) to 12-hour AM/PM format
 */
export function formatHourTo12Hour(hour: number): string {
  const period = hour >= 12 ? 'pm' : 'am';
  let displayHour = hour % 12;
  if (displayHour === 0) displayHour = 12;
  return `${displayHour}:00 ${period}`;
}
