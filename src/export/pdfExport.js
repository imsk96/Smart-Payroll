import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportPayrollPDF(payrollData, month, year) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const monthName = month ? new Date(2000, month - 1).toLocaleString('default', { month: 'long' }) : '';
  const title = `Payroll Report - ${monthName} ${year || ''}`;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.text(title, 105, 15, { align: 'center' });

  const headers = [
    ['Employee', 'Present', 'Half Day', 'Absent', 'Leave', 'Sick Leave', 'Late Fine', 'Advance', 'Gross Salary', 'Net Salary']
  ];

  const rows = payrollData.map(row => [
    `${row.employee.name || row.attendance.employeeName} (${row.employee.id})`,
    row.attendance.presentDays,
    row.attendance.halfDays,
    row.attendance.absentDays,
    row.attendance.paidLeaveDays,
    row.attendance.sickLeaveDays,
    `₹${row.attendance.totalFine}`,
    `₹${row.salary.advance}`,
    `₹${row.salary.grossSalary.toFixed(0)}`,
    `₹${row.salary.netSalary.toFixed(0)}`
  ]);

  // Totals row
  const totals = payrollData.reduce((acc, row) => ({
    present: acc.present + row.attendance.presentDays,
    half: acc.half + row.attendance.halfDays,
    absent: acc.absent + row.attendance.absentDays,
    leave: acc.leave + row.attendance.paidLeaveDays,
    sick: acc.sick + row.attendance.sickLeaveDays,
    fine: acc.fine + row.attendance.totalFine,
    advance: acc.advance + row.salary.advance,
    gross: acc.gross + row.salary.grossSalary,
    net: acc.net + row.salary.netSalary
  }), { present: 0, half: 0, absent: 0, leave: 0, sick: 0, fine: 0, advance: 0, gross: 0, net: 0 });

  rows.push([
    'TOTAL',
    totals.present,
    totals.half,
    totals.absent,
    totals.leave,
    totals.sick,
    `₹${totals.fine}`,
    `₹${totals.advance}`,
    `₹${totals.gross.toFixed(0)}`,
    `₹${totals.net.toFixed(0)}`
  ]);

  doc.autoTable({
    head: headers,
    body: rows,
    startY: 25,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      halign: 'center',
      valign: 'middle'
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold'
    },
    foot: [rows[rows.length - 1]],
    footStyles: {
      fillColor: [243, 244, 246],
      textColor: 0,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { halign: 'left' } // Employee column left align
    }
  });

  // Save
  doc.save(`Payroll_${monthName}_${year || ''}.pdf`);
}