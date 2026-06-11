export const DEFAULT_SHIFT_START = "10:00 AM";
export const DEFAULT_GRACE_MINUTES = 10;
export const DEFAULT_HALF_DAY_TIME = "1:00 PM";
export const DEFAULT_LATE_FINE_ENABLED = true;

export const FINE_SLABS = [
  { fromMinutes: 1, toMinutes: 20, fine: 50 },   // 10:11 - 10:30 (relative to grace end)
  { fromMinutes: 21, toMinutes: 65, fine: 100 },  // 10:31 - 11:15
  // after 11:15: continue ₹100 / 45 min ratio
];

export const SALARY_CALCULATION_DAYS = 30;