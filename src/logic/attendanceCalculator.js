import { timeStringToMinutes } from '../utils/timeHelper';
import { calculateDayFine } from './fineCalculator';

/**
 * Process attendance for one employee.
 * @param {object} employee - employee object from DB (with shift settings)
 * @param {object} record - parsed attendance record { employeeId, dates: [{dateStr, inMinutes, outMinutes, status, raw}] }
 * @returns {object} summary and per‑day details
 */
export function calculateEmployeeAttendance(employee, record) {
  const halfDayTimeMinutes = timeStringToMinutes(employee.halfDayTime);
  const result = {
    employeeId: employee.id,
    employeeName: employee.name,
    totalWorkingDays: 0,
    presentDays: 0,
    halfDays: 0,
    absentDays: 0,
    paidLeaveDays: 0,
    sickLeaveDays: 0,
    totalFine: 0,
    dailyBreakdown: [] // for detailed view
  };

  if (!record || !record.dates) return result;

  record.dates.forEach(day => {
    const { dateStr, inMinutes, outMinutes, status } = day;

    // Skip non‑working days (Holiday, Sunday)
    if (status === 'Holiday' || status === 'Sunday') return;

    result.totalWorkingDays++;

    const dayDetail = { dateStr, status, inMinutes, outMinutes, fine: 0, effectiveStatus: status };

    // Explicit HalfDay from Excel
    if (status === 'HalfDay') {
      result.halfDays++;
      dayDetail.effectiveStatus = 'HalfDay';
      result.dailyBreakdown.push(dayDetail);
      return;
    }

    // Leaves
    if (status === 'Leave') {
      result.paidLeaveDays++;
      dayDetail.effectiveStatus = 'Leave';
    } else if (status === 'SickLeave') {
      result.sickLeaveDays++;
      dayDetail.effectiveStatus = 'SickLeave';
    } else if (status === 'Present') {
      // Determine if half day based on IN time
      if (inMinutes !== null && halfDayTimeMinutes !== null && inMinutes > halfDayTimeMinutes) {
        result.halfDays++;
        dayDetail.effectiveStatus = 'HalfDay';
        // No fine for half‑day (arrived after half‑day cut‑off, but still worked)
        dayDetail.fine = 0;
      } else {
        result.presentDays++;
        dayDetail.effectiveStatus = 'Present';
        // Calculate late fine
        const fine = calculateDayFine(
          inMinutes,
          employee.shiftStartTime,
          employee.graceTimeMinutes,
          employee.lateFineEnabled
        );
        dayDetail.fine = fine;
        result.totalFine += fine;
      }
    } else if (status === 'Absent') {
      result.absentDays++;
      dayDetail.effectiveStatus = 'Absent';
    }

    result.dailyBreakdown.push(dayDetail);
  });

  return result;
}