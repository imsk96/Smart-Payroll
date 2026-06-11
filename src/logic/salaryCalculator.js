import { SALARY_CALCULATION_DAYS } from '../utils/constants';

/**
 * Calculate salary for one employee based on attendance result.
 * @param {object} attendanceResult - output from calculateEmployeeAttendance()
 * @param {object} employee - employee object (with monthlySalary, advance)
 * @returns {object} salary breakdown
 */
export function calculateSalary(attendanceResult, employee) {
  const {
    presentDays = 0,
    halfDays = 0,
    paidLeaveDays = 0,
    sickLeaveDays = 0,
    totalFine = 0
  } = attendanceResult;

  const paidDays = presentDays + (halfDays / 2) + paidLeaveDays + sickLeaveDays;
  const grossSalary = (paidDays / SALARY_CALCULATION_DAYS) * (employee.monthlySalary || 0);
  const advance = employee.advance || 0;
  const deductions = totalFine + advance;
  const netSalary = grossSalary - deductions;

  return {
    paidDays: Math.round(paidDays * 100) / 100,
    grossSalary: Math.round(grossSalary * 100) / 100,
    fine: totalFine,
    advance,
    deductions: Math.round(deductions * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100
  };
}