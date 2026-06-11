import ExcelJS from 'exceljs';

export async function exportPayrollExcel(payrollData, month, year, fileName) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Payroll');

  // Title
  const monthName = month ? new Date(2000, month - 1).toLocaleString('default', { month: 'long' }) : '';
  const title = `Payroll Report - ${monthName} ${year || ''}`;
  sheet.mergeCells('A1:J1');
  const titleRow = sheet.getCell('A1');
  titleRow.value = title;
  titleRow.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF1E3A8A' } };
  titleRow.alignment = { horizontal: 'center' };
  sheet.getRow(1).height = 30;

  // Header row
  const headers = [
    'Employee', 'Present', 'Half Day', 'Absent', 'Leave',
    'Sick Leave', 'Late Fine', 'Advance', 'Gross Salary', 'Net Salary'
  ];
  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 22;
  headerRow.eachCell(cell => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Data rows
  payrollData.forEach(row => {
    const values = [
      `${row.employee.name || row.attendance.employeeName} (${row.employee.id})`,
      row.attendance.presentDays,
      row.attendance.halfDays,
      row.attendance.absentDays,
      row.attendance.paidLeaveDays,
      row.attendance.sickLeaveDays,
      row.attendance.totalFine,
      row.salary.advance,
      row.salary.grossSalary,
      row.salary.netSalary
    ];
    const dataRow = sheet.addRow(values);
    dataRow.font = { size: 11 };
    dataRow.alignment = { horizontal: 'center', vertical: 'middle' };
    dataRow.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    // Format salary columns as currency
    dataRow.getCell(9).numFmt = '₹#,##0';
    dataRow.getCell(10).numFmt = '₹#,##0';
    dataRow.getCell(7).numFmt = '₹#,##0';
    dataRow.getCell(8).numFmt = '₹#,##0';
  });

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

  const totalRow = sheet.addRow([
    'TOTAL', totals.present, totals.half, totals.absent, totals.leave,
    totals.sick, totals.fine, totals.advance, totals.gross, totals.net
  ]);
  totalRow.font = { bold: true, size: 11 };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' }
  };
  totalRow.alignment = { horizontal: 'center' };
  totalRow.eachCell(cell => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  totalRow.getCell(9).numFmt = '₹#,##0';
  totalRow.getCell(10).numFmt = '₹#,##0';
  totalRow.getCell(7).numFmt = '₹#,##0';
  totalRow.getCell(8).numFmt = '₹#,##0';

  // Column widths
  sheet.columns = [
    { width: 30 },
    { width: 10 },
    { width: 12 },
    { width: 10 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 15 },
    { width: 15 }
  ];

  // Generate blob and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'Payroll_Report.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}