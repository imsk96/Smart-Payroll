import { timeStringToMinutes } from '../utils/timeHelper';

/**
 * Calculate fine for a single day based on IN time.
 * @param {number} inMinutes - punch‑in time in minutes from midnight
 * @param {string} shiftStartStr - employee's shift start (e.g. "10:00 AM")
 * @param {number} graceMinutes - grace period in minutes
 * @param {boolean} lateFineEnabled - whether late fine is applicable
 * @returns {number} fine amount
 */
export function calculateDayFine(inMinutes, shiftStartStr, graceMinutes, lateFineEnabled) {
  if (!lateFineEnabled || inMinutes === null) return 0;

  const shiftStart = timeStringToMinutes(shiftStartStr);
  if (shiftStart === null) return 0; // invalid shift

  const allowedUntil = shiftStart + graceMinutes;
  if (inMinutes <= allowedUntil) return 0;

  const lateMinutes = inMinutes - allowedUntil;

  // Fine slabs
  if (lateMinutes <= 20) {
    // 10:11 - 10:30 (1–20 min late)
    return 50;
  } else if (lateMinutes <= 65) {
    // 10:31 - 11:15 (21–65 min late)
    return 100;
  } else {
    // After 11:15: ₹100 + ₹100 per 45 minutes (or pro‑rata)
    return 100 + ((lateMinutes - 65) * (100 / 45));
  }
}